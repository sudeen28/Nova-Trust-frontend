'use client';
import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import {
  User, Building2, ArrowLeftRight, Landmark, Zap,
  Smartphone, Receipt, Bell, CreditCard,
  Plus, Trash2, ChevronRight, ChevronLeft,
  Check, Shield, LogOut, Eye, EyeOff, X
} from 'lucide-react';
import Link from 'next/link';

/* ─── Shared styles ─── */
const INP = {
  display:'block', width:'100%', padding:'11px 14px',
  background:'#fff', border:'1.5px solid #e5e7eb', borderRadius:10,
  fontSize:14, color:'#1a1a1a', outline:'none',
  boxSizing:'border-box', fontFamily:'inherit', transition:'border-color 0.2s',
};
const LABEL = { display:'block', fontSize:12, fontWeight:600, color:'#555', marginBottom:6, letterSpacing:'0.04em' };
const SECTION = { background:'#fff', borderRadius:14, border:'1px solid #e5e7eb', padding:24, boxShadow:'0 1px 3px rgba(0,0,0,0.05)' };
const BTN_ADD = { display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:9, border:'1.5px dashed #e5e7eb', background:'transparent', color:'#888', cursor:'pointer', fontSize:13, fontWeight:600, marginTop:12, transition:'all 0.2s' };
const BTN_DEL = { padding:'6px 10px', borderRadius:8, border:'1px solid #fca5a5', background:'#fef2f2', color:'#dc2626', cursor:'pointer', flexShrink:0 };

const STEPS = [
  { id:'profile',       label:'Profile',       icon:User          },
  { id:'accounts',      label:'Accounts',      icon:Building2     },
  { id:'transactions',  label:'Transactions',  icon:ArrowLeftRight},
  { id:'loans',         label:'Loans',         icon:Landmark      },
  { id:'payments',      label:'Payments',      icon:Zap           },
  { id:'cards',         label:'Cards',         icon:CreditCard    },
  { id:'notifications', label:'Notifications', icon:Bell          },
  { id:'review',        label:'Review',        icon:Check         },
];

const ACCOUNT_TYPES = ['CHECKING','SAVINGS','INVESTMENT'];
const TX_TYPES      = ['DEPOSIT','WITHDRAWAL','TRANSFER','ZELLE','CASHAPP','BILL_PAYMENT','LOAN_DISBURSEMENT','LOAN_REPAYMENT','MOBILE_DEPOSIT','PAYMENT'];
const LOAN_STATUSES = ['ACTIVE','PENDING','PAID','REJECTED'];
const TIERS         = ['STANDARD','ELITE','PRIVATE','VIP'];
const CARD_TIERS    = ['STANDARD','GOLD','PLATINUM','BLACK'];
const NOTIF_TYPES   = ['INFO','SUCCESS','WARNING','ERROR','TRANSACTION'];
const NETWORKS      = ['VISA','MASTERCARD','AMEX','DISCOVER'];

function Field({ label, value, onChange, type='text', placeholder='', required=false, onFocus, onBlur }) {
  return (
    <div>
      <label style={LABEL}>{label}{required&&' *'}</label>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        required={required} style={INP}
        onFocus={e=>{e.target.style.borderColor='#FF6A00'; onFocus&&onFocus();}}
        onBlur={e=>{e.target.style.borderColor='#e5e7eb'; onBlur&&onBlur();}}/>
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label style={LABEL}>{label}</label>
      <select value={value} onChange={e=>onChange(e.target.value)} style={INP}>
        {options.map(o=><option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
      </select>
    </div>
  );
}

function Grid({ cols=2, children }) {
  return <div style={{display:'grid', gridTemplateColumns:`repeat(${cols},1fr)`, gap:14}}>{children}</div>;
}

function SectionTitle({ children }) {
  return <h3 style={{fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:16, color:'#1a1a1a', margin:'0 0 16px'}}>{children}</h3>;
}

function ItemCard({ children, onDelete }) {
  return (
    <div style={{background:'#f9fafb', borderRadius:12, padding:16, border:'1px solid #e5e7eb', marginBottom:10, position:'relative'}}>
      {onDelete && <button onClick={onDelete} style={{...BTN_DEL, position:'absolute', top:12, right:12, padding:'4px 8px'}}><Trash2 size={13}/></button>}
      <div style={{paddingRight:onDelete?40:0, display:'flex', flexDirection:'column', gap:12}}>{children}</div>
    </div>
  );
}

const empty = {
  account:      () => ({ accountType:'CHECKING', balance:'1000', currency:'USD', interestRate:'', accountNumber:'', createdAt:'' }),
  transaction:  () => ({ type:'DEPOSIT', amount:'', description:'', date:'', toAccount:'CHECKING', fromAccount:'', status:'COMPLETED' }),
  loan:         () => ({ amount:'', interestRate:'8.5', termMonths:'12', monthlyPayment:'', totalRepayable:'', amountRepaid:'0', purpose:'Personal loan', status:'ACTIVE', account:'CHECKING', approvedAt:'', nextPaymentDate:'', createDisbursementTx:false }),
  zelle:        () => ({ direction:'RECEIVED', amount:'', recipientName:'', recipientEmail:'', memo:'', date:'' }),
  cashapp:      () => ({ direction:'RECEIVED', amount:'', cashtag:'', recipientName:'', note:'', date:'' }),
  bill:         () => ({ billType:'Electric', billerName:'', accountRef:'', amount:'', date:'', account:'CHECKING' }),
  card:         () => ({ cardTier:'STANDARD', network:'VISA', expiryMonth:String(new Date().getMonth()+1), expiryYear:String(new Date().getFullYear()+4), limit:'5000', issuedAt:'' }),
  notification: () => ({ title:'', message:'', type:'INFO', date:'' }),
};

export default function SetupAccountPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [done, setDone] = useState(null);

  // Form state
  const [profile, setProfile] = useState({
    firstName:'', lastName:'', email:'', password:'', phone:'',
    address:'', city:'', country:'', dateOfBirth:'', tier:'STANDARD', adminNotes:'',
  });
  const [accounts,      setAccounts]      = useState([empty.account()]);
  const [transactions,  setTransactions]  = useState([]);
  const [loans,         setLoans]         = useState([]);
  const [zelleList,     setZelleList]     = useState([]);
  const [cashList,      setCashList]      = useState([]);
  const [billList,      setBillList]      = useState([]);
  const [cardList,      setCardList]      = useState([]);
  const [notifList,     setNotifList]     = useState([]);

  const p = (k) => (v) => setProfile(prev=>({...prev,[k]:v}));

  const upd = (setter, idx, key) => (val) =>
    setter(prev => prev.map((item,i) => i===idx ? {...item,[key]:val} : item));

  const add = (setter, template) => () => setter(prev=>[...prev, template()]);
  const del = (setter, idx)       => () => setter(prev=>prev.filter((_,i)=>i!==idx));

  const canNext = () => {
    if (step === 0) return profile.firstName && profile.lastName && profile.email && profile.password;
    if (step === 1) return accounts.length > 0;
    return true;
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const { data } = await api.post('/admin/setup-account', {
        ...profile,
        accounts,
        transactions,
        loans,
        zelleTransfers: zelleList,
        cashAppTransfers: cashList,
        billPayments: billList,
        cards: cardList,
        notifications: notifList,
      });
      setDone(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Setup failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) return null;

  // Success screen
  if (done) return (
    <div style={{minHeight:'100vh', background:'#f5f6fa', display:'flex', alignItems:'center', justifyContent:'center', padding:24}}>
      <div style={{background:'#fff', borderRadius:20, padding:40, maxWidth:520, width:'100%', textAlign:'center', boxShadow:'0 8px 32px rgba(0,0,0,0.1)'}}>
        <div style={{width:64, height:64, borderRadius:'50%', background:'#f0fdf4', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px'}}>
          <Check size={32} style={{color:'#16a34a'}}/>
        </div>
        <h2 style={{fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:22, color:'#1a1a1a', marginBottom:8}}>Account Created!</h2>
        <p style={{color:'#888', fontSize:14, marginBottom:24}}>Full account setup complete for <strong>{profile.firstName} {profile.lastName}</strong></p>
        <div style={{background:'#f9fafb', borderRadius:12, padding:16, marginBottom:24, textAlign:'left'}}>
          <p style={{fontSize:12, fontWeight:600, color:'#555', marginBottom:10, letterSpacing:'0.06em'}}>ACCOUNT SUMMARY</p>
          <p style={{fontSize:13, color:'#555', marginBottom:4}}><strong>Email:</strong> {done.email}</p>
          <p style={{fontSize:13, color:'#555', marginBottom:4}}><strong>User ID:</strong> <span style={{fontFamily:'monospace', fontSize:11}}>{done.userId}</span></p>
          {done.accounts?.map(a => (
            <p key={a.id} style={{fontSize:13, color:'#555', marginBottom:4}}>
              <strong>{a.type}:</strong> ${parseFloat(a.balance).toLocaleString('en-US',{minimumFractionDigits:2})} — {a.number}
            </p>
          ))}
        </div>
        <div style={{display:'flex', gap:12}}>
          <button onClick={()=>{setDone(null);setStep(0);setProfile({firstName:'',lastName:'',email:'',password:'',phone:'',address:'',city:'',country:'',dateOfBirth:'',tier:'STANDARD',adminNotes:''});setAccounts([empty.account()]);setTransactions([]);setLoans([]);setZelleList([]);setCashList([]);setBillList([]);setCardList([]);setNotifList([]);}}
            style={{flex:1, padding:'12px', borderRadius:10, border:'1.5px solid #e5e7eb', background:'#fff', color:'#555', fontWeight:600, cursor:'pointer', fontSize:14}}>
            Create Another
          </button>
          <button onClick={()=>router.push('/admin')}
            style={{flex:1, padding:'12px', borderRadius:10, border:'none', background:'#FF6A00', color:'#fff', fontWeight:700, cursor:'pointer', fontSize:14}}>
            Go to Admin Panel
          </button>
        </div>
      </div>
    </div>
  );

  const currentStep = STEPS[step];

  return (
    <div style={{minHeight:'100vh', background:'#f5f6fa', display:'flex'}}>
      {/* Sidebar */}
      <div style={{width:220, background:'#0F0F0F', flexShrink:0, display:'flex', flexDirection:'column', position:'sticky', top:0, height:'100vh', overflowY:'auto'}}>
        <div style={{padding:'20px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', gap:10}}>
          <div style={{width:32, height:32, borderRadius:10, background:'#FF6A00', display:'flex', alignItems:'center', justifyContent:'center'}}><Shield size={16} color="#000"/></div>
          <div><p style={{fontFamily:'Poppins,sans-serif', fontWeight:700, color:'white', fontSize:13, margin:0}}>NOVA TRUST</p><p style={{fontSize:10, color:'rgba(255,255,255,0.3)', margin:0}}>Admin</p></div>
        </div>
        <nav style={{flex:1, padding:'12px 8px'}}>
          <Link href="/admin" style={{display:'block', padding:'9px 12px', borderRadius:10, marginBottom:2, fontSize:13, fontWeight:600, textDecoration:'none', color:'rgba(255,255,255,0.4)'}}>← Back to Admin</Link>
          <div style={{margin:'12px 0', height:1, background:'rgba(255,255,255,0.06)'}}/>
          <p style={{fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.2)', padding:'0 12px', marginBottom:8, letterSpacing:'0.08em'}}>SETUP STEPS</p>
          {STEPS.map((s,i) => {
            const Icon = s.icon;
            const isActive  = i === step;
            const isDone    = i < step;
            return (
              <button key={s.id} onClick={() => i <= step && setStep(i)}
                style={{width:'100%', display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:10, marginBottom:2, border:'none', cursor:i<=step?'pointer':'default', background:isActive?'rgba(255,106,0,0.1)':'transparent', color:isActive?'#FF6A00':isDone?'rgba(34,197,94,0.8)':'rgba(255,255,255,0.3)', textAlign:'left', fontSize:13, fontWeight:600, borderRight:isActive?'2px solid #FF6A00':'2px solid transparent'}}>
                <div style={{width:22, height:22, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background:isActive?'rgba(255,106,0,0.2)':isDone?'rgba(34,197,94,0.15)':'rgba(255,255,255,0.06)'}}>
                  {isDone ? <Check size={11} style={{color:'#4ade80'}}/> : <Icon size={11}/>}
                </div>
                {s.label}
              </button>
            );
          })}
        </nav>
        <div style={{padding:'12px 8px', borderTop:'1px solid rgba(255,255,255,0.06)'}}>
          <button onClick={async()=>{await logout();router.push('/login');}} style={{width:'100%', display:'flex', alignItems:'center', gap:8, padding:'9px 12px', borderRadius:10, border:'none', background:'transparent', color:'rgba(255,255,255,0.3)', cursor:'pointer', fontSize:13}}><LogOut size={14}/>Sign out</button>
        </div>
      </div>

      {/* Main content */}
      <div style={{flex:1, overflow:'auto'}}>
        <div style={{maxWidth:820, margin:'0 auto', padding:'32px 24px'}}>

          {/* Header */}
          <div style={{marginBottom:28}}>
            <p style={{fontSize:11, fontWeight:600, color:'#FF6A00', letterSpacing:'0.08em', marginBottom:6}}>STEP {step+1} OF {STEPS.length}</p>
            <h1 style={{fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:26, color:'#1a1a1a', margin:0}}>
              {step===0&&'Client Profile'}
              {step===1&&'Bank Accounts'}
              {step===2&&'Transaction History'}
              {step===3&&'Loan Records'}
              {step===4&&'Payment History (Zelle, Cash App, Bills)'}
              {step===5&&'Virtual Cards'}
              {step===6&&'Notifications'}
              {step===7&&'Review & Create Account'}
            </h1>
            <p style={{fontSize:14, color:'#888', marginTop:4}}>
              {step===0&&'Enter the client\'s personal information and credentials.'}
              {step===1&&'Add checking, savings, and investment accounts with starting balances.'}
              {step===2&&'Add any transaction history — deposits, withdrawals, transfers. Supports historical dates.'}
              {step===3&&'Add loan records with custom dates, amounts, and repayment history.'}
              {step===4&&'Add Zelle transfers, Cash App payments, and bill payment history.'}
              {step===5&&'Issue virtual cards to this client.'}
              {step===6&&'Add welcome messages or account notifications.'}
              {step===7&&'Review everything before creating the account.'}
            </p>
          </div>

          {/* Progress bar */}
          <div style={{height:4, background:'#e5e7eb', borderRadius:100, marginBottom:28, overflow:'hidden'}}>
            <div style={{height:'100%', background:'#FF6A00', borderRadius:100, transition:'width 0.3s', width:`${((step+1)/STEPS.length)*100}%`}}/>
          </div>

          {/* ── STEP 0: Profile ── */}
          {step===0 && (
            <div style={{display:'flex', flexDirection:'column', gap:16}}>
              <div style={SECTION}>
                <SectionTitle>Personal Information</SectionTitle>
                <Grid cols={2}>
                  <Field label="First Name" value={profile.firstName} onChange={p('firstName')} placeholder="James" required/>
                  <Field label="Last Name"  value={profile.lastName}  onChange={p('lastName')}  placeholder="Carter" required/>
                </Grid>
                <div style={{marginTop:14}}/>
                <Grid cols={2}>
                  <Field label="Email Address" value={profile.email}    onChange={p('email')}    type="email" placeholder="james@example.com" required/>
                  <Field label="Phone Number"  value={profile.phone}    onChange={p('phone')}    type="tel"   placeholder="+1 555 000 0000"/>
                </Grid>
                <div style={{marginTop:14}}/>
                <Grid cols={2}>
                  <Field label="Date of Birth" value={profile.dateOfBirth} onChange={p('dateOfBirth')} type="date"/>
                  <Select label="Client Tier" value={profile.tier} onChange={p('tier')} options={TIERS}/>
                </Grid>
                <div style={{marginTop:14}}/>
                <Field label="Address" value={profile.address} onChange={p('address')} placeholder="123 Main Street"/>
                <div style={{marginTop:14}}/>
                <Grid cols={2}>
                  <Field label="City"    value={profile.city}    onChange={p('city')}    placeholder="New York"/>
                  <Field label="Country" value={profile.country} onChange={p('country')} placeholder="United States"/>
                </Grid>
              </div>

              <div style={SECTION}>
                <SectionTitle>Login Credentials</SectionTitle>
                <Grid cols={2}>
                  <Field label="Email (login)" value={profile.email} onChange={p('email')} type="email" required/>
                  <div>
                    <label style={LABEL}>Password *</label>
                    <div style={{position:'relative'}}>
                      <input type={showPass?'text':'password'} value={profile.password} onChange={e=>p('password')(e.target.value)}
                        placeholder="Min 8 characters" required style={{...INP, paddingRight:42}}
                        onFocus={e=>e.target.style.borderColor='#FF6A00'} onBlur={e=>e.target.style.borderColor='#e5e7eb'}/>
                      <button type="button" onClick={()=>setShowPass(!showPass)} style={{position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#aaa'}}>
                        {showPass?<EyeOff size={16}/>:<Eye size={16}/>}
                      </button>
                    </div>
                  </div>
                </Grid>
              </div>

              <div style={SECTION}>
                <SectionTitle>Admin Notes (Private)</SectionTitle>
                <textarea value={profile.adminNotes} onChange={e=>p('adminNotes')(e.target.value)} rows={3}
                  placeholder="Internal notes about this client — not visible to the user..."
                  style={{...INP, resize:'vertical'}}/>
              </div>
            </div>
          )}

          {/* ── STEP 1: Accounts ── */}
          {step===1 && (
            <div style={SECTION}>
              <SectionTitle>Bank Accounts</SectionTitle>
              {accounts.map((acc, i) => (
                <ItemCard key={i} onDelete={accounts.length>1 ? del(setAccounts,i) : null}>
                  <Grid cols={2}>
                    <Select label="Account Type" value={acc.accountType} onChange={upd(setAccounts,i,'accountType')} options={ACCOUNT_TYPES}/>
                    <Field  label="Starting Balance ($)" value={acc.balance} onChange={upd(setAccounts,i,'balance')} type="number" placeholder="0.00"/>
                  </Grid>
                  <Grid cols={2}>
                    <Field label="Account Number (leave blank to auto-generate)" value={acc.accountNumber} onChange={upd(setAccounts,i,'accountNumber')} placeholder="Auto-generated"/>
                    <Field label="Interest Rate (%)" value={acc.interestRate} onChange={upd(setAccounts,i,'interestRate')} type="number" placeholder={acc.accountType==='SAVINGS'?'2.5':acc.accountType==='INVESTMENT'?'7.0':'0'}/>
                  </Grid>
                  <Field label="Account Opened Date (optional — allows historical dates)" value={acc.createdAt} onChange={upd(setAccounts,i,'createdAt')} type="date"/>
                </ItemCard>
              ))}
              <button onClick={add(setAccounts,empty.account)} style={BTN_ADD}><Plus size={15}/>Add Another Account</button>
              <div style={{marginTop:14, padding:'12px 14px', background:'#fffbeb', borderRadius:10, border:'1px solid #fde68a', fontSize:13, color:'#92400e'}}>
                💡 Tip: Add Checking, Savings, and Investment accounts. The first account will be the primary account.
              </div>
            </div>
          )}

          {/* ── STEP 2: Transactions ── */}
          {step===2 && (
            <div style={SECTION}>
              <SectionTitle>Transaction History</SectionTitle>
              <p style={{fontSize:13, color:'#888', marginBottom:16}}>Add any transaction history. You can use dates as far back as 1990. All transactions will appear in the client's history.</p>
              {transactions.length === 0 && (
                <div style={{padding:'32px', textAlign:'center', color:'#aaa', background:'#f9fafb', borderRadius:12, border:'1px dashed #e5e7eb', marginBottom:12}}>
                  No transactions added yet. Click below to add one.
                </div>
              )}
              {transactions.map((tx, i) => (
                <ItemCard key={i} onDelete={del(setTransactions,i)}>
                  <Grid cols={3}>
                    <Select label="Type" value={tx.type} onChange={upd(setTransactions,i,'type')} options={TX_TYPES}/>
                    <Field  label="Amount ($)" value={tx.amount} onChange={upd(setTransactions,i,'amount')} type="number" placeholder="500.00"/>
                    <Field  label="Date" value={tx.date} onChange={upd(setTransactions,i,'date')} type="date"/>
                  </Grid>
                  <Grid cols={2}>
                    <Field  label="Description / Caption" value={tx.description} onChange={upd(setTransactions,i,'description')} placeholder="e.g. Salary deposit, Wire transfer..."/>
                    <Select label="Status" value={tx.status} onChange={upd(setTransactions,i,'status')} options={['COMPLETED','PENDING','FAILED','REVERSED']}/>
                  </Grid>
                  {['TRANSFER','LOAN_REPAYMENT'].includes(tx.type) && (
                    <Grid cols={2}>
                      <Select label="From Account" value={tx.fromAccount} onChange={upd(setTransactions,i,'fromAccount')} options={[{value:'',label:'None'},...ACCOUNT_TYPES]}/>
                      <Select label="To Account"   value={tx.toAccount}   onChange={upd(setTransactions,i,'toAccount')}   options={[{value:'',label:'None'},...ACCOUNT_TYPES]}/>
                    </Grid>
                  )}
                </ItemCard>
              ))}
              <button onClick={add(setTransactions,empty.transaction)} style={BTN_ADD}><Plus size={15}/>Add Transaction</button>
            </div>
          )}

          {/* ── STEP 3: Loans ── */}
          {step===3 && (
            <div style={SECTION}>
              <SectionTitle>Loan Records</SectionTitle>
              <p style={{fontSize:13, color:'#888', marginBottom:16}}>Add loan records with full control over amounts, dates, and repayment status. Historical dates supported.</p>
              {loans.length === 0 && (
                <div style={{padding:'32px', textAlign:'center', color:'#aaa', background:'#f9fafb', borderRadius:12, border:'1px dashed #e5e7eb', marginBottom:12}}>
                  No loans added. Click below to add a loan record.
                </div>
              )}
              {loans.map((loan, i) => (
                <ItemCard key={i} onDelete={del(setLoans,i)}>
                  <Grid cols={3}>
                    <Field label="Loan Amount ($)" value={loan.amount} onChange={upd(setLoans,i,'amount')} type="number" placeholder="10000"/>
                    <Field label="Interest Rate (%)" value={loan.interestRate} onChange={upd(setLoans,i,'interestRate')} type="number" placeholder="8.5"/>
                    <Field label="Term (months)" value={loan.termMonths} onChange={upd(setLoans,i,'termMonths')} type="number" placeholder="12"/>
                  </Grid>
                  <Grid cols={3}>
                    <Field label="Monthly Payment ($)" value={loan.monthlyPayment} onChange={upd(setLoans,i,'monthlyPayment')} type="number" placeholder="Auto-calc"/>
                    <Field label="Total Repayable ($)" value={loan.totalRepayable} onChange={upd(setLoans,i,'totalRepayable')} type="number" placeholder="Auto-calc"/>
                    <Field label="Amount Already Repaid ($)" value={loan.amountRepaid} onChange={upd(setLoans,i,'amountRepaid')} type="number" placeholder="0"/>
                  </Grid>
                  <Grid cols={2}>
                    <Field  label="Purpose" value={loan.purpose} onChange={upd(setLoans,i,'purpose')} placeholder="Home improvement, Business..."/>
                    <Select label="Status"  value={loan.status}  onChange={upd(setLoans,i,'status')}  options={LOAN_STATUSES}/>
                  </Grid>
                  <Grid cols={2}>
                    <Select label="Credit to Account" value={loan.account} onChange={upd(setLoans,i,'account')} options={ACCOUNT_TYPES}/>
                    <Field  label="Approval Date" value={loan.approvedAt} onChange={upd(setLoans,i,'approvedAt')} type="date"/>
                  </Grid>
                  <Grid cols={2}>
                    <Field label="Next Payment Date" value={loan.nextPaymentDate} onChange={upd(setLoans,i,'nextPaymentDate')} type="date"/>
                    <div>
                      <label style={LABEL}>Create Disbursement Transaction</label>
                      <label style={{display:'flex', alignItems:'center', gap:8, cursor:'pointer', marginTop:4}}>
                        <input type="checkbox" checked={loan.createDisbursementTx}
                          onChange={e=>upd(setLoans,i,'createDisbursementTx')(e.target.checked)}
                          style={{width:16, height:16, accentColor:'#FF6A00'}}/>
                        <span style={{fontSize:13, color:'#555'}}>Add disbursement to transaction history</span>
                      </label>
                    </div>
                  </Grid>
                </ItemCard>
              ))}
              <button onClick={add(setLoans,empty.loan)} style={BTN_ADD}><Plus size={15}/>Add Loan Record</button>
            </div>
          )}

          {/* ── STEP 4: Payments ── */}
          {step===4 && (
            <div style={{display:'flex', flexDirection:'column', gap:16}}>
              {/* Zelle */}
              <div style={SECTION}>
                <SectionTitle>Zelle Transfers</SectionTitle>
                {zelleList.length===0 && <div style={{padding:'20px', textAlign:'center', color:'#aaa', background:'#f9fafb', borderRadius:10, marginBottom:8}}>No Zelle transfers added.</div>}
                {zelleList.map((z,i)=>(
                  <ItemCard key={i} onDelete={del(setZelleList,i)}>
                    <Grid cols={3}>
                      <Select label="Direction" value={z.direction} onChange={upd(setZelleList,i,'direction')} options={['SENT','RECEIVED']}/>
                      <Field  label="Amount ($)" value={z.amount} onChange={upd(setZelleList,i,'amount')} type="number" placeholder="200"/>
                      <Field  label="Date" value={z.date} onChange={upd(setZelleList,i,'date')} type="date"/>
                    </Grid>
                    <Grid cols={3}>
                      <Field label="Recipient Name" value={z.recipientName} onChange={upd(setZelleList,i,'recipientName')} placeholder="John Doe"/>
                      <Field label="Recipient Email" value={z.recipientEmail} onChange={upd(setZelleList,i,'recipientEmail')} placeholder="john@example.com"/>
                      <Field label="Memo" value={z.memo} onChange={upd(setZelleList,i,'memo')} placeholder="Rent, Dinner..."/>
                    </Grid>
                  </ItemCard>
                ))}
                <button onClick={add(setZelleList,empty.zelle)} style={BTN_ADD}><Plus size={15}/>Add Zelle Transfer</button>
              </div>

              {/* Cash App */}
              <div style={SECTION}>
                <SectionTitle>Cash App Transfers</SectionTitle>
                {cashList.length===0 && <div style={{padding:'20px', textAlign:'center', color:'#aaa', background:'#f9fafb', borderRadius:10, marginBottom:8}}>No Cash App transfers added.</div>}
                {cashList.map((c,i)=>(
                  <ItemCard key={i} onDelete={del(setCashList,i)}>
                    <Grid cols={3}>
                      <Select label="Direction" value={c.direction} onChange={upd(setCashList,i,'direction')} options={['SENT','RECEIVED']}/>
                      <Field  label="Amount ($)" value={c.amount} onChange={upd(setCashList,i,'amount')} type="number" placeholder="150"/>
                      <Field  label="Date" value={c.date} onChange={upd(setCashList,i,'date')} type="date"/>
                    </Grid>
                    <Grid cols={3}>
                      <Field label="$Cashtag" value={c.cashtag} onChange={upd(setCashList,i,'cashtag')} placeholder="$johndoe"/>
                      <Field label="Recipient Name" value={c.recipientName} onChange={upd(setCashList,i,'recipientName')} placeholder="John Doe"/>
                      <Field label="Note" value={c.note} onChange={upd(setCashList,i,'note')} placeholder="Payment note"/>
                    </Grid>
                  </ItemCard>
                ))}
                <button onClick={add(setCashList,empty.cashapp)} style={BTN_ADD}><Plus size={15}/>Add Cash App Transfer</button>
              </div>

              {/* Bills */}
              <div style={SECTION}>
                <SectionTitle>Bill Payments</SectionTitle>
                {billList.length===0 && <div style={{padding:'20px', textAlign:'center', color:'#aaa', background:'#f9fafb', borderRadius:10, marginBottom:8}}>No bill payments added.</div>}
                {billList.map((b,i)=>(
                  <ItemCard key={i} onDelete={del(setBillList,i)}>
                    <Grid cols={3}>
                      <Select label="Bill Type" value={b.billType} onChange={upd(setBillList,i,'billType')} options={['Electric','Water','Gas','Internet','Phone','Cable TV','Insurance','Rent','Subscription','Other']}/>
                      <Field  label="Amount ($)" value={b.amount} onChange={upd(setBillList,i,'amount')} type="number" placeholder="120"/>
                      <Field  label="Date Paid" value={b.date} onChange={upd(setBillList,i,'date')} type="date"/>
                    </Grid>
                    <Grid cols={2}>
                      <Field  label="Biller Name" value={b.billerName} onChange={upd(setBillList,i,'billerName')} placeholder="AT&T, City Power..."/>
                      <Field  label="Account Reference" value={b.accountRef} onChange={upd(setBillList,i,'accountRef')} placeholder="Account #"/>
                    </Grid>
                  </ItemCard>
                ))}
                <button onClick={add(setBillList,empty.bill)} style={BTN_ADD}><Plus size={15}/>Add Bill Payment</button>
              </div>
            </div>
          )}

          {/* ── STEP 5: Cards ── */}
          {step===5 && (
            <div style={SECTION}>
              <SectionTitle>Virtual Cards</SectionTitle>
              {cardList.length===0 && <div style={{padding:'32px', textAlign:'center', color:'#aaa', background:'#f9fafb', borderRadius:12, border:'1px dashed #e5e7eb', marginBottom:12}}>No cards added. Click below to issue a card.</div>}
              {cardList.map((card,i)=>(
                <ItemCard key={i} onDelete={del(setCardList,i)}>
                  <Grid cols={2}>
                    <Select label="Card Tier"   value={card.cardTier} onChange={upd(setCardList,i,'cardTier')} options={CARD_TIERS}/>
                    <Select label="Network"     value={card.network}  onChange={upd(setCardList,i,'network')}  options={NETWORKS}/>
                  </Grid>
                  <Grid cols={3}>
                    <Select label="Expiry Month" value={card.expiryMonth} onChange={upd(setCardList,i,'expiryMonth')}
                      options={Array.from({length:12},(_,i)=>({value:String(i+1), label:String(i+1).padStart(2,'0')}))}/>
                    <Select label="Expiry Year" value={card.expiryYear} onChange={upd(setCardList,i,'expiryYear')}
                      options={Array.from({length:20},(_,i)=>String(new Date().getFullYear()+i))}/>
                    <Field label="Spending Limit ($)" value={card.limit} onChange={upd(setCardList,i,'limit')} type="number" placeholder="5000"/>
                  </Grid>
                  <Field label="Issuance Date (optional — supports historical dates from 1990)" value={card.issuedAt} onChange={upd(setCardList,i,'issuedAt')} type="date"/>
                  {/* Card preview */}
                  <div style={{padding:'12px 14px', background: card.cardTier==='GOLD'?'linear-gradient(135deg,#78350f,#d97706)':card.cardTier==='PLATINUM'?'linear-gradient(135deg,#1e293b,#64748b)':card.cardTier==='BLACK'?'linear-gradient(135deg,#000,#2d2d2d)':'linear-gradient(135deg,#334155,#475569)', borderRadius:10, display:'flex', justifyContent:'space-between', alignItems:'flex-end'}}>
                    <div><p style={{fontFamily:'Poppins,sans-serif', fontWeight:800, fontSize:10, color:'rgba(255,255,255,0.8)', margin:'0 0 4px'}}>NOVA TRUST · {card.cardTier}</p><p style={{fontFamily:'monospace', fontSize:12, color:'rgba(255,255,255,0.7)', margin:0, letterSpacing:'0.15em'}}>•••• •••• •••• ••••</p></div>
                    <p style={{fontFamily:'Poppins,sans-serif', fontWeight:800, fontSize:14, color:'rgba(255,255,255,0.9)', margin:0}}>{card.network}</p>
                  </div>
                </ItemCard>
              ))}
              <button onClick={add(setCardList,empty.card)} style={BTN_ADD}><Plus size={15}/>Issue Virtual Card</button>
            </div>
          )}

          {/* ── STEP 6: Notifications ── */}
          {step===6 && (
            <div style={SECTION}>
              <SectionTitle>Account Notifications</SectionTitle>
              <p style={{fontSize:13, color:'#888', marginBottom:16}}>Add welcome messages, account alerts, or any notifications that will appear in the client's notification center.</p>
              {notifList.length===0 && <div style={{padding:'32px', textAlign:'center', color:'#aaa', background:'#f9fafb', borderRadius:12, border:'1px dashed #e5e7eb', marginBottom:12}}>No notifications added.</div>}
              {notifList.map((n,i)=>(
                <ItemCard key={i} onDelete={del(setNotifList,i)}>
                  <Grid cols={2}>
                    <Field  label="Title" value={n.title} onChange={upd(setNotifList,i,'title')} placeholder="Welcome to Nova Trust!"/>
                    <Select label="Type"  value={n.type}  onChange={upd(setNotifList,i,'type')}  options={NOTIF_TYPES}/>
                  </Grid>
                  <div>
                    <label style={LABEL}>Message</label>
                    <textarea value={n.message} onChange={e=>upd(setNotifList,i,'message')(e.target.value)} rows={2}
                      placeholder="Your account has been set up successfully..."
                      style={{...INP, resize:'vertical'}}/>
                  </div>
                  <Field label="Date (optional)" value={n.date} onChange={upd(setNotifList,i,'date')} type="date"/>
                </ItemCard>
              ))}
              <button onClick={add(setNotifList,empty.notification)} style={BTN_ADD}><Plus size={15}/>Add Notification</button>
            </div>
          )}

          {/* ── STEP 7: Review ── */}
          {step===7 && (
            <div style={{display:'flex', flexDirection:'column', gap:16}}>
              <div style={SECTION}>
                <SectionTitle>Account Summary</SectionTitle>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
                  {[
                    {label:'Name',         value:`${profile.firstName} ${profile.lastName}`},
                    {label:'Email',        value:profile.email},
                    {label:'Phone',        value:profile.phone||'—'},
                    {label:'Tier',         value:profile.tier},
                    {label:'City/Country', value:[profile.city,profile.country].filter(Boolean).join(', ')||'—'},
                    {label:'DOB',          value:profile.dateOfBirth||'—'},
                  ].map(({label,value})=>(
                    <div key={label} style={{padding:'12px 14px', background:'#f9fafb', borderRadius:10}}>
                      <p style={{fontSize:11, color:'#888', margin:'0 0 3px'}}>{label.toUpperCase()}</p>
                      <p style={{fontSize:14, fontWeight:600, color:'#1a1a1a', margin:0}}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {[
                {title:'Accounts',          items:accounts,       render:a=>`${a.accountType} — $${parseFloat(a.balance||0).toLocaleString('en-US',{minimumFractionDigits:2})}`},
                {title:'Transactions',      items:transactions,   render:t=>`${t.type} — $${t.amount} ${t.date?'on '+t.date:''} — ${t.description||''}`},
                {title:'Loans',             items:loans,          render:l=>`$${l.amount} loan — ${l.status} — ${l.purpose||''}`},
                {title:'Zelle Transfers',   items:zelleList,      render:z=>`${z.direction} $${z.amount} ${z.recipientName?'to/from '+z.recipientName:''}`},
                {title:'Cash App',          items:cashList,       render:c=>`${c.direction} $${c.amount} ${c.cashtag||''}`},
                {title:'Bill Payments',     items:billList,       render:b=>`${b.billerName} — $${b.amount} — ${b.billType}`},
                {title:'Virtual Cards',     items:cardList,       render:c=>`${c.cardTier} ${c.network} card`},
                {title:'Notifications',     items:notifList,      render:n=>`${n.type}: ${n.title}`},
              ].filter(s=>s.items.length>0).map(({title,items,render})=>(
                <div key={title} style={SECTION}>
                  <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12}}>
                    <h3 style={{fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:15, color:'#1a1a1a', margin:0}}>{title}</h3>
                    <span style={{padding:'2px 10px', borderRadius:100, background:'rgba(255,106,0,0.1)', color:'#FF6A00', fontSize:12, fontWeight:600}}>{items.length}</span>
                  </div>
                  <div style={{display:'flex', flexDirection:'column', gap:6}}>
                    {items.map((item,i)=>(
                      <div key={i} style={{display:'flex', alignItems:'center', gap:8, padding:'10px 12px', background:'#f9fafb', borderRadius:9, fontSize:13, color:'#555'}}>
                        <Check size={13} style={{color:'#16a34a', flexShrink:0}}/>
                        {render(item)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div style={{padding:'16px 20px', background:'#fffbeb', borderRadius:12, border:'1px solid #fde68a', fontSize:14, color:'#92400e'}}>
                ⚠️ Once created, the client can log in immediately with the email and password you set. The account will appear in the admin users list and all data will be fully editable from the admin panel.
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div style={{display:'flex', justifyContent:'space-between', marginTop:28, paddingTop:20, borderTop:'1px solid #e5e7eb'}}>
            <button onClick={()=>setStep(s=>Math.max(0,s-1))} disabled={step===0}
              style={{display:'flex', alignItems:'center', gap:8, padding:'12px 24px', borderRadius:11, border:'1.5px solid #e5e7eb', background:'#fff', color:step===0?'#ccc':'#555', fontWeight:600, cursor:step===0?'default':'pointer', fontSize:14, opacity:step===0?0.5:1}}>
              <ChevronLeft size={18}/>Previous
            </button>

            {step < STEPS.length-1 ? (
              <button onClick={()=>canNext()&&setStep(s=>s+1)} disabled={!canNext()}
                style={{display:'flex', alignItems:'center', gap:8, padding:'12px 28px', borderRadius:11, border:'none', background:canNext()?'#FF6A00':'#e5e7eb', color:canNext()?'#fff':'#aaa', fontWeight:700, cursor:canNext()?'pointer':'default', fontSize:14, boxShadow:canNext()?'0 4px 16px rgba(255,106,0,0.25)':'none'}}>
                {step === STEPS.length-2 ? 'Review Setup' : 'Next Step'}<ChevronRight size={18}/>
              </button>
            ) : (
              <button onClick={submit} disabled={submitting}
                style={{display:'flex', alignItems:'center', gap:8, padding:'12px 32px', borderRadius:11, border:'none', background:submitting?'#e5e7eb':'#FF6A00', color:submitting?'#aaa':'#fff', fontWeight:700, cursor:submitting?'default':'pointer', fontSize:14, boxShadow:submitting?'none':'0 4px 20px rgba(255,106,0,0.3)'}}>
                {submitting ? 'Creating Account...' : <><Check size={18}/>Create Full Account</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
