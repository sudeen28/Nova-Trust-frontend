'use client';
import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import { FileText, Download, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const TYPE_LABELS = { DEPOSIT:'Deposit',WITHDRAWAL:'Withdrawal',TRANSFER:'Transfer',ZELLE:'Zelle',CASHAPP:'Cash App',BILL_PAYMENT:'Bill Payment',LOAN_DISBURSEMENT:'Loan',LOAN_REPAYMENT:'Loan Repayment',MOBILE_DEPOSIT:'Mobile Deposit',PAYMENT:'Payment' };

export default function StatementsPage() {
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
        <button onClick={downloadCSV} disabled={!statement || statement.transactions.length === 0}
          className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold ml-auto disabled:opacity-40">
          <Download size={14} />Download CSV
        </button>
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
