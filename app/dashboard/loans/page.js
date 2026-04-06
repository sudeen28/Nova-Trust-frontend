'use client';
import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import { Landmark, CheckCircle, Clock, XCircle, DollarSign } from 'lucide-react';

const STATUS_STYLE = {
  PENDING:  {badge:'badge-yellow', label:'Pending Review'},
  APPROVED: {badge:'badge-blue',   label:'Approved'},
  ACTIVE:   {badge:'badge-green',  label:'Active'},
  REJECTED: {badge:'badge-red',    label:'Rejected'},
  PAID:     {badge:'badge-green',  label:'Fully Paid'},
  DEFAULTED:{badge:'badge-red',    label:'Defaulted'},
};

export default function LoansPage() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({amount:'',termMonths:'12',purpose:'',accountId:''});
  const [submitting, setSubmitting] = useState(false);
  const [repayModal, setRepayModal] = useState(null);
  const [repayAmount, setRepayAmount] = useState('');
  const [repaying, setRepaying] = useState(false);

  useEffect(()=>{ fetchLoans(); api.get('/account').then(r=>{ setAccounts(r.data.data); if(r.data.data[0]) setForm(p=>({...p,accountId:r.data.data[0].id})); }); },[]);

  const fetchLoans = async()=>{ try{ const {data}=await api.get('/loans'); setLoans(data.data); }catch{} finally{setLoading(false);} };

  const requestLoan = async(e)=>{ e.preventDefault(); setSubmitting(true); try{ await api.post('/loans',form); toast.success('Loan application submitted!'); setForm({amount:'',termMonths:'12',purpose:'',accountId:accounts[0]?.id||''}); fetchLoans(); }catch(err){toast.error(err.response?.data?.message||'Failed');} finally{setSubmitting(false);} };

  const repayLoan = async()=>{ if(!repayAmount) return; setRepaying(true); try{ const {data}=await api.post(`/loans/${repayModal.id}/repay`,{amount:repayAmount}); toast.success(data.message); setRepayModal(null); setRepayAmount(''); fetchLoans(); }catch(err){toast.error(err.response?.data?.message||'Failed');} finally{setRepaying(false);} };

  const ls = {color:'rgba(255,255,255,0.35)'};
  const lc = "block text-xs font-semibold tracking-widest mb-1.5";
  const ic = "inp px-4 py-3 rounded-xl text-sm";

  const activeLoans = loans.filter(l=>l.status==='ACTIVE');
  const totalOwed = activeLoans.reduce((s,l)=>s+(l.totalRepayable-l.amountRepaid),0);

  return (
    <div className="p-5 lg:p-7 anim-up">
      <p className="text-xs font-semibold tracking-widest" style={{color:'rgba(255,106,0,0.7)'}}>CREDIT</p>
      <h1 className="font-display text-2xl font-bold text-white mb-5 mt-0.5">Loan Management</h1>

      {activeLoans.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            {label:'Active Loans', value:activeLoans.length, color:'#6366f1'},
            {label:'Total Owed', value:`$${totalOwed.toLocaleString('en-US',{minimumFractionDigits:2})}`, color:'#f87171'},
            {label:'Monthly Payment', value:`$${activeLoans.reduce((s,l)=>s+l.monthlyPayment,0).toFixed(2)}`, color:'#FF6A00'},
          ].map(s=>(
            <div key={s.label} className="card p-4">
              <p className="text-xs mb-1" style={{color:'rgba(255,255,255,0.3)'}}>{s.label}</p>
              <p className="font-display text-xl font-bold" style={{color:s.color}}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Apply form */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'rgba(99,102,241,0.12)',color:'#818cf8'}}><Landmark size={18}/></div>
            <div><h3 className="font-display font-semibold text-white">Apply for Loan</h3><p className="text-xs" style={{color:'rgba(255,255,255,0.3)'}}>8.5% APR • Fast approval</p></div>
          </div>
          <form onSubmit={requestLoan} className="space-y-4">
            {accounts.length>1&&<div><label className={lc} style={ls}>CREDIT TO</label><select value={form.accountId} onChange={e=>setForm({...form,accountId:e.target.value})} className="inp px-3 py-3 rounded-xl text-sm">{accounts.map(a=><option key={a.id} value={a.id}>{a.accountType} — ${a.balance.toFixed(2)}</option>)}</select></div>}
            <div><label className={lc} style={ls}>LOAN AMOUNT</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold" style={{color:'rgba(255,255,255,0.2)'}}>$</span><input type="number" min="100" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} className="inp pl-8 pr-4 py-3 rounded-xl text-xl font-bold" placeholder="5,000" required/></div></div>
            <div><label className={lc} style={ls}>TERM</label>
              <select value={form.termMonths} onChange={e=>setForm({...form,termMonths:e.target.value})} className="inp px-3 py-3 rounded-xl text-sm">
                {[3,6,12,24,36,48,60].map(m=><option key={m} value={m}>{m} months</option>)}
              </select>
            </div>
            <div><label className={lc} style={ls}>PURPOSE</label><input type="text" value={form.purpose} onChange={e=>setForm({...form,purpose:e.target.value})} className={ic} placeholder="e.g. Business expansion"/></div>
            {form.amount && form.termMonths && (
              <div className="p-3 rounded-xl" style={{background:'rgba(255,106,0,0.05)',border:'1px solid rgba(255,106,0,0.1)'}}>
                <p className="text-xs font-semibold mb-1" style={{color:'rgba(255,106,0,0.7)'}}>ESTIMATE</p>
                <p className="text-xs" style={{color:'rgba(255,255,255,0.4)'}}>
                  Monthly: ~${(parseFloat(form.amount||0)*(8.5/100/12*Math.pow(1+8.5/100/12,parseInt(form.termMonths)))/(Math.pow(1+8.5/100/12,parseInt(form.termMonths))-1)).toFixed(2)}
                </p>
              </div>
            )}
            <button type="submit" disabled={submitting} className="btn-primary w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2">
              {submitting?<div className="spinner"/>:<><Landmark size={14}/>Submit Application</>}
            </button>
          </form>
        </div>

        {/* Loan list */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4" style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}}><h3 className="font-display font-semibold text-white text-sm">My Loans</h3></div>
          {loading?<div className="p-5 space-y-3">{[1,2].map(i=><div key={i} className="skeleton h-16"/>)}</div>:
           loans.length===0?<div className="py-12 text-center" style={{color:'rgba(255,255,255,0.2)'}}><Landmark size={24} className="mx-auto mb-2 opacity-30"/><p className="text-xs">No loans yet</p></div>:(
            <div className="divide-y" style={{'borderColor':'rgba(255,255,255,0.04)'}}>
              {loans.map(loan=>{
                const s = STATUS_STYLE[loan.status]||STATUS_STYLE.PENDING;
                const progress = loan.totalRepayable > 0 ? (loan.amountRepaid/loan.totalRepayable)*100 : 0;
                return (
                  <div key={loan.id} className="px-5 py-4">
                    <div className="flex items-start justify-between mb-3">
                      <div><p className="text-sm font-semibold text-white">${loan.amount.toLocaleString()}</p><p className="text-xs mt-0.5" style={{color:'rgba(255,255,255,0.3)'}}>{loan.termMonths}mo • {loan.interestRate}% APR</p></div>
                      <span className={`badge ${s.badge}`}>{s.label}</span>
                    </div>
                    {loan.status==='ACTIVE'&&(
                      <>
                        <div className="rounded-full overflow-hidden mb-2" style={{height:4,background:'rgba(255,255,255,0.08)'}}>
                          <div className="h-full rounded-full" style={{width:`${progress}%`,background:'#FF6A00'}}/>
                        </div>
                        <div className="flex justify-between text-xs mb-3" style={{color:'rgba(255,255,255,0.3)'}}>
                          <span>Paid: ${loan.amountRepaid.toFixed(2)}</span>
                          <span>Remaining: ${(loan.totalRepayable-loan.amountRepaid).toFixed(2)}</span>
                        </div>
                        <button onClick={()=>setRepayModal(loan)} className="btn-primary w-full py-2 rounded-xl text-xs font-semibold">Make Payment</button>
                      </>
                    )}
                    {loan.status==='REJECTED'&&loan.rejectionReason&&<p className="text-xs mt-1" style={{color:'#f87171'}}>Reason: {loan.rejectionReason}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {repayModal && (
        <div className="modal-wrap">
          <div className="modal">
            <h3 className="font-display font-bold text-white text-lg mb-1">Loan Repayment</h3>
            <p className="text-xs mb-4" style={{color:'rgba(255,255,255,0.35)'}}>Remaining: ${(repayModal.totalRepayable-repayModal.amountRepaid).toFixed(2)} • Monthly: ${repayModal.monthlyPayment.toFixed(2)}</p>
            <div className="relative mb-5"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold" style={{color:'rgba(255,255,255,0.2)'}}>$</span>
            <input type="number" min="1" value={repayAmount} onChange={e=>setRepayAmount(e.target.value)} className="inp pl-8 pr-4 py-4 rounded-xl text-2xl font-bold" placeholder={repayModal.monthlyPayment.toFixed(2)} autoFocus/></div>
            <div className="flex gap-3">
              <button onClick={()=>{setRepayModal(null);setRepayAmount('');}} className="btn-ghost flex-1 py-3 rounded-xl text-sm">Cancel</button>
              <button onClick={repayLoan} disabled={repaying} className="btn-primary flex-1 py-3 rounded-xl text-sm">
                {repaying?<div className="spinner mx-auto"/>:'Repay'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
