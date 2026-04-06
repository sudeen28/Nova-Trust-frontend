'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import { Zap, Smartphone, Receipt, Send, CheckCircle } from 'lucide-react';

const BILL_TYPES = ['Electric','Water','Gas','Internet','Phone','Cable TV','Insurance','Rent','Subscription','Other'];

function PaymentsContent() {
  const sp = useSearchParams();
  const [tab, setTab] = useState(sp.get('tab') || 'zelle');
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [zelleForm, setZelleForm] = useState({amount:'',recipientEmail:'',recipientPhone:'',recipientName:'',memo:''});
  const [cashForm, setCashForm] = useState({amount:'',cashtag:'',recipientName:'',note:''});
  const [billForm, setBillForm] = useState({amount:'',billType:'Electric',billerName:'',accountRef:'',accountId:''});
  const [zelleHistory, setZelleHistory] = useState([]);
  const [cashHistory, setCashHistory] = useState([]);
  const [billHistory, setBillHistory] = useState([]);
  const [success, setSuccess] = useState(null);

  useEffect(()=>{
    api.get('/account').then(r=>{ setAccounts(r.data.data); if(r.data.data[0]) setBillForm(p=>({...p,accountId:r.data.data[0].id})); }).catch(()=>{});
    api.get('/payments/zelle').then(r=>setZelleHistory(r.data.data)).catch(()=>{});
    api.get('/payments/cashapp').then(r=>setCashHistory(r.data.data)).catch(()=>{});
    api.get('/payments/bills').then(r=>setBillHistory(r.data.data)).catch(()=>{});
  },[]);

  const sendZelle = async(e)=>{ e.preventDefault(); setLoading(true); try{ await api.post('/payments/zelle',zelleForm); toast.success('Zelle sent!'); setSuccess('Zelle payment sent!'); setZelleForm({amount:'',recipientEmail:'',recipientPhone:'',recipientName:'',memo:''}); api.get('/payments/zelle').then(r=>setZelleHistory(r.data.data)); }catch(err){toast.error(err.response?.data?.message||'Failed');} finally{setLoading(false);}};
  const sendCash = async(e)=>{ e.preventDefault(); setLoading(true); try{ await api.post('/payments/cashapp',cashForm); toast.success('Sent!'); setSuccess('Cash App payment sent!'); setCashForm({amount:'',cashtag:'',recipientName:'',note:''}); api.get('/payments/cashapp').then(r=>setCashHistory(r.data.data)); }catch(err){toast.error(err.response?.data?.message||'Failed');} finally{setLoading(false);}};
  const payBill = async(e)=>{ e.preventDefault(); setLoading(true); try{ await api.post('/payments/bills',billForm); toast.success('Bill paid!'); setSuccess(`${billForm.billerName} paid!`); setBillForm(p=>({...p,amount:'',billerName:'',accountRef:''})); api.get('/payments/bills').then(r=>setBillHistory(r.data.data)); }catch(err){toast.error(err.response?.data?.message||'Failed');} finally{setLoading(false);}};

  const ls = {color:'rgba(255,255,255,0.35)'};
  const lc = "block text-xs font-semibold tracking-widest mb-1.5";
  const ic = "inp px-4 py-3 rounded-xl text-sm";

  return (
    <div className="p-5 lg:p-7 anim-up">
      <p className="text-xs font-semibold tracking-widest" style={{color:'rgba(255,106,0,0.7)'}}>PAYMENTS</p>
      <h1 className="font-display text-2xl font-bold text-white mb-5 mt-0.5">Pay & Send</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {[{id:'zelle',l:'Zelle',icon:Zap,c:'#6B3FA0'},{id:'cashapp',l:'Cash App',icon:Smartphone,c:'#00D632'},{id:'bills',l:'Pay Bills',icon:Receipt,c:'#f59e0b'}].map(({id,l,icon:Icon,c})=>(
          <button key={id} onClick={()=>{setTab(id);setSuccess(null);}} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition"
            style={tab===id?{background:`${c}15`,color:c,border:`1px solid ${c}30`}:{background:'rgba(255,255,255,0.04)',color:'rgba(255,255,255,0.4)',border:'1px solid rgba(255,255,255,0.06)'}}>
            <Icon size={15}/>{l}
          </button>
        ))}
      </div>

      {success && (
        <div className="flex items-center gap-3 p-4 rounded-2xl mb-5" style={{background:'rgba(34,197,94,0.08)',border:'1px solid rgba(34,197,94,0.2)'}}>
          <CheckCircle size={18} style={{color:'#4ade80'}}/><p className="text-sm font-medium" style={{color:'#4ade80'}}>{success}</p>
          <button onClick={()=>setSuccess(null)} className="ml-auto text-xs" style={{color:'rgba(34,197,94,0.5)'}}>✕</button>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          {tab==='zelle' && (
            <>
              <div className="flex items-center gap-3 mb-5"><div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'rgba(107,63,160,0.15)',color:'#6B3FA0'}}><Zap size={18}/></div><div><h3 className="font-display font-semibold text-white">Send via Zelle</h3><p className="text-xs" style={{color:'rgba(255,255,255,0.3)'}}>Instant bank transfer</p></div></div>
              <form onSubmit={sendZelle} className="space-y-4">
                <div><label className={lc} style={ls}>AMOUNT</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold" style={{color:'rgba(255,255,255,0.2)'}}>$</span><input type="number" min="1" value={zelleForm.amount} onChange={e=>setZelleForm({...zelleForm,amount:e.target.value})} className="inp pl-8 pr-4 py-3 rounded-xl text-xl font-bold" placeholder="0.00" required/></div></div>
                <div className="grid grid-cols-2 gap-3"><div><label className={lc} style={ls}>EMAIL</label><input type="email" value={zelleForm.recipientEmail} onChange={e=>setZelleForm({...zelleForm,recipientEmail:e.target.value})} className={ic} placeholder="email@example.com"/></div><div><label className={lc} style={ls}>PHONE</label><input type="tel" value={zelleForm.recipientPhone} onChange={e=>setZelleForm({...zelleForm,recipientPhone:e.target.value})} className={ic} placeholder="+1 555 000"/></div></div>
                <div><label className={lc} style={ls}>NAME</label><input type="text" value={zelleForm.recipientName} onChange={e=>setZelleForm({...zelleForm,recipientName:e.target.value})} className={ic} placeholder="Full name"/></div>
                <div><label className={lc} style={ls}>MEMO</label><input type="text" value={zelleForm.memo} onChange={e=>setZelleForm({...zelleForm,memo:e.target.value})} className={ic} placeholder="Note..."/></div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2">{loading?<div className="spinner"/>:<><Send size={14}/>Send via Zelle</>}</button>
              </form>
            </>
          )}
          {tab==='cashapp' && (
            <>
              <div className="flex items-center gap-3 mb-5"><div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'rgba(0,214,50,0.1)',color:'#00D632'}}><Smartphone size={18}/></div><div><h3 className="font-display font-semibold text-white">Send via Cash App</h3><p className="text-xs" style={{color:'rgba(255,255,255,0.3)'}}>Quick peer payments</p></div></div>
              <form onSubmit={sendCash} className="space-y-4">
                <div><label className={lc} style={ls}>AMOUNT</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold" style={{color:'rgba(255,255,255,0.2)'}}>$</span><input type="number" min="1" value={cashForm.amount} onChange={e=>setCashForm({...cashForm,amount:e.target.value})} className="inp pl-8 pr-4 py-3 rounded-xl text-xl font-bold" placeholder="0.00" required/></div></div>
                <div><label className={lc} style={ls}>$CASHTAG</label><input type="text" value={cashForm.cashtag} onChange={e=>setCashForm({...cashForm,cashtag:e.target.value})} className={ic} placeholder="$cashtag" required/></div>
                <div><label className={lc} style={ls}>NAME</label><input type="text" value={cashForm.recipientName} onChange={e=>setCashForm({...cashForm,recipientName:e.target.value})} className={ic} placeholder="Full name"/></div>
                <div><label className={lc} style={ls}>NOTE</label><input type="text" value={cashForm.note} onChange={e=>setCashForm({...cashForm,note:e.target.value})} className={ic} placeholder="What's it for?"/></div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2">{loading?<div className="spinner"/>:<><Send size={14}/>Send Cash App</>}</button>
              </form>
            </>
          )}
          {tab==='bills' && (
            <>
              <div className="flex items-center gap-3 mb-5"><div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'rgba(245,158,11,0.12)',color:'#f59e0b'}}><Receipt size={18}/></div><div><h3 className="font-display font-semibold text-white">Pay a Bill</h3><p className="text-xs" style={{color:'rgba(255,255,255,0.3)'}}>Utilities & subscriptions</p></div></div>
              <form onSubmit={payBill} className="space-y-4">
                {accounts.length>1&&<div><label className={lc} style={ls}>PAY FROM</label><select value={billForm.accountId} onChange={e=>setBillForm({...billForm,accountId:e.target.value})} className="inp px-3 py-3 rounded-xl text-sm">{accounts.map(a=><option key={a.id} value={a.id}>{a.accountType} — ${a.balance.toFixed(2)}</option>)}</select></div>}
                <div className="grid grid-cols-2 gap-3"><div><label className={lc} style={ls}>TYPE</label><select value={billForm.billType} onChange={e=>setBillForm({...billForm,billType:e.target.value})} className="inp px-3 py-3 rounded-xl text-sm">{BILL_TYPES.map(t=><option key={t}>{t}</option>)}</select></div><div><label className={lc} style={ls}>AMOUNT</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold" style={{color:'rgba(255,255,255,0.2)'}}>$</span><input type="number" min="1" value={billForm.amount} onChange={e=>setBillForm({...billForm,amount:e.target.value})} className="inp pl-8 pr-4 py-3 rounded-xl font-bold" placeholder="0.00" required/></div></div></div>
                <div><label className={lc} style={ls}>BILLER</label><input type="text" value={billForm.billerName} onChange={e=>setBillForm({...billForm,billerName:e.target.value})} className={ic} placeholder="e.g. AT&T" required/></div>
                <div><label className={lc} style={ls}>ACCOUNT REF</label><input type="text" value={billForm.accountRef} onChange={e=>setBillForm({...billForm,accountRef:e.target.value})} className={ic} placeholder="Account number"/></div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2">{loading?<div className="spinner"/>:<><Receipt size={14}/>Pay Bill</>}</button>
              </form>
            </>
          )}
        </div>

        <div className="card overflow-hidden">
          <div className="px-5 py-4" style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}}><h3 className="font-display font-semibold text-white text-sm">History</h3></div>
          <div className="overflow-y-auto" style={{maxHeight:400}}>
            {(tab==='zelle'?zelleHistory:tab==='cashapp'?cashHistory:billHistory).length===0?(
              <div className="py-12 text-center" style={{color:'rgba(255,255,255,0.2)'}}><p className="text-xs">No history yet</p></div>
            ):(tab==='zelle'?zelleHistory:tab==='cashapp'?cashHistory:billHistory).map(item=>(
              <div key={item.id} className="px-5 py-3.5 flex items-center justify-between" style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                <div><p className="text-sm font-medium text-white">{tab==='zelle'?(item.recipientName||item.recipientEmail):tab==='cashapp'?(item.cashtag||item.recipientName):item.billerName}</p>
                <p className="text-xs mt-0.5" style={{color:'rgba(255,255,255,0.25)'}}>{tab!=='bills'?item.direction:item.billType}</p></div>
                <div className="text-right"><p className="text-sm font-semibold" style={{color:tab!=='bills'&&item.direction==='RECEIVED'?'#4ade80':'#f87171'}}>{tab!=='bills'&&item.direction==='RECEIVED'?'+':'-'}${item.amount.toFixed(2)}</p>
                <span className="badge badge-green" style={{fontSize:10}}>{item.status}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  return <Suspense><PaymentsContent/></Suspense>;
}
