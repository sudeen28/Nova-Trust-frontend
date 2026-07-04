'use client';
import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
import { FileText, Download, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const TYPE_LABELS = { DEPOSIT:'Deposit',WITHDRAWAL:'Withdrawal',TRANSFER:'Transfer',ZELLE:'Zelle',CASHAPP:'Cash App',BILL_PAYMENT:'Bill Payment',LOAN_DISBURSEMENT:'Loan',LOAN_REPAYMENT:'Loan Repayment',MOBILE_DEPOSIT:'Mobile Deposit',PAYMENT:'Payment' };

// Brand colors as RGB triplets (jsPDF wants numeric RGB, not hex/CSS strings)
const ORANGE = [255, 106, 0];
const INK    = [15, 15, 15];
const GRAY   = [110, 110, 110];
const LIGHT  = [245, 245, 245];

export default function StatementsPage() {
  const { user } = useAuth();
  const now = new Date();
  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [statement, setStatement] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchStatement(); }, [year, month]);

  const fetchStatement = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/security/statement?year=${year}&month=${month}`);
      setStatement(data.data);
    } catch { toast.error('Failed to load statement'); }
    finally { setLoading(false); }
  };

  const isCredit = (tx, accountIds) =>
    tx.toAccountId && accountIds.includes(tx.toAccountId) || tx.type === 'DEPOSIT' || tx.type === 'LOAN_DISBURSEMENT';

  const downloadCSV = () => {
    if (!statement) return;
    const accountIds = statement.accounts.map(a => a.id);
    const rows = [
      ['Date','Type','Description','Amount','Direction','Reference'],
      ...statement.transactions.map(tx => {
        const credit = isCredit(tx, accountIds);
        return [
          format(new Date(tx.createdAt), 'yyyy-MM-dd HH:mm'),
          TYPE_LABELS[tx.type] || tx.type,
          tx.description || tx.type,
          tx.amount.toFixed(2),
          credit ? 'Credit' : 'Debit',
          tx.reference,
        ];
      })
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nova-trust-statement-${year}-${String(month).padStart(2,'0')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV downloaded');
  };

  const downloadPDF = async () => {
    if (!statement) return;
    // Dynamic import — jsPDF/autotable touch browser-only APIs (window, document)
    // at module load time, which breaks Next.js's server render pass if imported
    // statically at the top of a 'use client' file. Loading them only here,
    // inside a click handler that never runs on the server, avoids that entirely.
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const accountIds = statement.accounts.map(a => a.id);
    const doc = new jsPDF({ unit: 'pt', format: 'letter' }); // 612 x 792pt
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;

    // ── Header band ──────────────────────────────────────────────
    doc.setFillColor(...INK);
    doc.rect(0, 0, pageWidth, 96, 'F');
    doc.setFillColor(...ORANGE);
    doc.rect(0, 92, pageWidth, 4, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text('NOVA TRUST', margin, 40);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...ORANGE);
    doc.text('PRIVATE BANKING', margin, 54);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text('Monthly Statement', pageWidth - margin, 40, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    doc.text(`${MONTHS[month - 1]} ${year}`, pageWidth - margin, 56, { align: 'right' });

    let y = 128;

    // ── Account holder block ─────────────────────────────────────
    doc.setTextColor(...GRAY);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('ACCOUNT HOLDER', margin, y);
    doc.text('ACCOUNTS COVERED', pageWidth / 2 + 10, y);

    y += 14;
    doc.setFontSize(11);
    doc.setTextColor(...INK);
    doc.setFont('helvetica', 'bold');
    doc.text(`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Account Holder', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...GRAY);
    doc.text(user?.email || '', margin, y + 14);

    let accY = y;
    statement.accounts.forEach(acc => {
      doc.setFontSize(9.5);
      doc.setTextColor(...INK);
      doc.text(`${acc.accountType} — ••••${(acc.accountNumber || '').slice(-4)}`, pageWidth / 2 + 10, accY);
      accY += 14;
    });

    y = Math.max(y + 30, accY + 10);

    // ── Summary cards (drawn as boxes) ───────────────────────────
    const cardW = (pageWidth - margin * 2 - 30) / 4;
    const cards = [
      { label: 'TOTAL IN',     value: `$${statement.summary.totalIn.toLocaleString('en-US',{minimumFractionDigits:2})}`, color: [34,197,94] },
      { label: 'TOTAL OUT',    value: `$${statement.summary.totalOut.toLocaleString('en-US',{minimumFractionDigits:2})}`, color: [239,68,68] },
      { label: 'NET CHANGE',   value: `${statement.summary.netChange>=0?'':'-'}$${Math.abs(statement.summary.netChange).toLocaleString('en-US',{minimumFractionDigits:2})}`, color: statement.summary.netChange>=0?[34,197,94]:[239,68,68] },
      { label: 'TRANSACTIONS', value: `${statement.summary.transactionCount}`, color: ORANGE },
    ];
    cards.forEach((c, i) => {
      const x = margin + i * (cardW + 10);
      doc.setFillColor(...LIGHT);
      doc.roundedRect(x, y, cardW, 52, 4, 4, 'F');
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...GRAY);
      doc.text(c.label, x + 10, y + 18);
      doc.setFontSize(13);
      doc.setTextColor(...c.color);
      doc.text(c.value, x + 10, y + 38);
    });

    y += 80;

    // ── Transaction table ────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...INK);
    doc.text('Transaction Detail', margin, y);
    y += 10;

    const rows = statement.transactions.map(tx => {
      const credit = isCredit(tx, accountIds);
      return [
        format(new Date(tx.createdAt), 'MMM d, yyyy'),
        TYPE_LABELS[tx.type] || tx.type,
        tx.description || '—',
        `${credit ? '+' : '-'}$${tx.amount.toFixed(2)}`,
        credit ? 'Credit' : 'Debit',
      ];
    });

    autoTable(doc, {
      startY: y + 8,
      head: [['Date', 'Type', 'Description', 'Amount', 'Direction']],
      body: rows.length ? rows : [['—', '—', 'No transactions this period', '—', '—']],
      margin: { left: margin, right: margin },
      styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 6, textColor: INK },
      headStyles: { fillColor: INK, textColor: [255,255,255], fontStyle: 'bold', fontSize: 8 },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      columnStyles: { 3: { halign: 'right' } },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 3) {
          const txt = String(data.cell.raw);
          data.cell.styles.textColor = txt.startsWith('+') ? [34,197,94] : txt.startsWith('-') ? [239,68,68] : INK;
        }
      },
      didDrawPage: (data) => {
        // Footer on every page
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(7.5);
        doc.setTextColor(...GRAY);
        doc.text(
          `Nova Trust Private Banking · Established 2000 · Generated ${format(new Date(), 'MMM d, yyyy HH:mm')}`,
          margin, doc.internal.pageSize.getHeight() - 24
        );
        doc.text(
          `Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${pageCount}`,
          pageWidth - margin, doc.internal.pageSize.getHeight() - 24, { align: 'right' }
        );
      },
    });

    doc.save(`nova-trust-statement-${year}-${String(month).padStart(2,'0')}.pdf`);
    toast.success('Statement downloaded');
  };

  const years = Array.from({ length: 3 }, (_, i) => now.getFullYear() - i);
  const accountIds = statement?.accounts?.map(a => a.id) || [];

  return (
    <div className="p-5 lg:p-7 anim-up">
      <p className="text-xs font-semibold tracking-widest" style={{ color: 'rgba(255,106,0,0.7)' }}>RECORDS</p>
      <h1 className="font-display text-2xl font-bold text-white mb-6 mt-0.5">Monthly Statements</h1>

      {/* Period selector */}
      <div className="card p-5 mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <div>
            <label className="block text-xs font-semibold tracking-widest mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>MONTH</label>
            <select value={month} onChange={e => setMonth(parseInt(e.target.value))}
              className="inp px-3 py-2.5 rounded-xl text-sm">
              {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-widest mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>YEAR</label>
            <select value={year} onChange={e => setYear(parseInt(e.target.value))}
              className="inp px-3 py-2.5 rounded-xl text-sm">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-2 ml-auto">
          <button onClick={downloadCSV} disabled={!statement || statement.transactions.length === 0}
            className="btn-ghost flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold disabled:opacity-40">
            <Download size={14} />CSV
          </button>
          <button onClick={downloadPDF} disabled={!statement}
            className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold disabled:opacity-40">
            <FileText size={14} />Download PDF Statement
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
      ) : statement && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total In',     value: statement.summary.totalIn,          color: '#22c55e', icon: TrendingUp },
              { label: 'Total Out',    value: statement.summary.totalOut,          color: '#ef4444', icon: TrendingDown },
              { label: 'Net Change',   value: statement.summary.netChange,         color: statement.summary.netChange >= 0 ? '#22c55e' : '#ef4444', icon: ArrowLeftRight },
              { label: 'Transactions', value: statement.summary.transactionCount,  color: '#FF6A00', isCount: true },
            ].map(s => (
              <div key={s.label} className="card p-5">
                <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.label}</p>
                <p className="font-display text-2xl font-bold" style={{ color: s.color }}>
                  {s.isCount ? s.value : `${s.value >= 0 ? '' : '-'}$${Math.abs(s.value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                </p>
              </div>
            ))}
          </div>

          {/* Breakdown by type */}
          {Object.keys(statement.byType).length > 0 && (
            <div className="card p-5 mb-6">
              <h3 className="font-display font-semibold text-white text-sm mb-4">Breakdown by Type</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {Object.entries(statement.byType).map(([type, amount]) => (
                  <div key={type} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{TYPE_LABELS[type] || type}</p>
                    <p className="font-semibold text-white text-sm">${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transaction list */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 className="font-display font-semibold text-white text-sm">
                {MONTHS[month - 1]} {year} — All Transactions
              </h3>
              <span className="badge badge-gray">{statement.transactions.length} records</span>
            </div>

            {statement.transactions.length === 0 ? (
              <div className="py-16 text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
                <FileText size={32} className="mx-auto mb-3 opacity-30" />
                <p>No transactions in {MONTHS[month - 1]} {year}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="tbl">
                  <thead>
                    <tr><th>Date</th><th>Type</th><th>Description</th><th>Amount</th><th>Direction</th></tr>
                  </thead>
                  <tbody>
                    {statement.transactions.map(tx => {
                      const credit = isCredit(tx, accountIds);
                      return (
                        <tr key={tx.id}>
                          <td style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, whiteSpace: 'nowrap' }}>
                            {format(new Date(tx.createdAt), 'MMM d, HH:mm')}
                          </td>
                          <td><span className="badge badge-gray">{TYPE_LABELS[tx.type] || tx.type}</span></td>
                          <td style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{tx.description || '—'}</td>
                          <td className="font-semibold" style={{ color: credit ? '#4ade80' : '#f87171' }}>
                            {credit ? '+' : '-'}${tx.amount.toFixed(2)}
                          </td>
                          <td>
                            <span className={`badge ${credit ? 'badge-green' : 'badge-red'} flex items-center gap-1`}>
                              {credit ? <ArrowDownLeft size={9}/> : <ArrowUpRight size={9}/>}
                              {credit ? 'Credit' : 'Debit'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}