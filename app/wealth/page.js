'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Shield, ChevronDown, ChevronRight, Check, ArrowRight, Phone, Mail, Calendar } from 'lucide-react';

const COURSES = [
  {
    id: 'wealth-creation',
    label: 'Wealth Creation',
    icon: '💰',
    content: {
      title: 'Wealth Creation Fundamentals',
      subtitle: 'Build lasting financial wealth through proven strategies',
      sections: [
        { heading: 'What is Wealth Creation?', body: 'Wealth creation is the process of generating long-term financial assets through disciplined saving, strategic investing, and compounding returns over time. At Nova Trust, we guide selected clients through a personalized wealth-building journey.' },
        { heading: 'Core Principles', body: 'Our wealth creation framework is built on three pillars: asset accumulation, passive income generation, and capital preservation. Each client receives a tailored strategy based on their financial profile, risk tolerance, and long-term goals.' },
        { heading: 'Investment Vehicles', body: 'We offer access to a diversified range of investment vehicles including high-yield savings accounts (2.5% APY), managed investment portfolios (7.0% estimated annual return), structured loan facilities, and treasury instruments.' },
        { heading: 'Compounding Power', body: 'The most powerful force in wealth building is compound interest. A $50,000 investment at 7% annual return over 20 years grows to over $193,000 — nearly 4x your initial capital — without any additional contributions.' },
      ],
      benefits: ['Personalized wealth roadmap', 'Access to exclusive investment tiers', 'Quarterly portfolio reviews', 'Tax-efficient structuring', 'Dedicated relationship manager'],
    }
  },
  {
    id: 'private-banking',
    label: 'Private Banking',
    icon: '🏛️',
    content: {
      title: 'Private Banking Services',
      subtitle: 'Exclusive banking solutions for high-net-worth individuals',
      sections: [
        { heading: 'What is Private Banking?', body: 'Private banking is a premium, personalized financial service available exclusively to high-net-worth individuals. Unlike retail banking, private banking offers dedicated relationship managers, bespoke financial solutions, and priority access to exclusive products.' },
        { heading: 'Your Dedicated Team', body: 'Every Nova Trust private banking client is assigned a dedicated relationship manager who understands your complete financial picture — assets, liabilities, goals, and risk profile — to provide holistic, proactive advice.' },
        { heading: 'Multi-Account Management', body: 'Manage multiple account types from a single dashboard: Checking for daily transactions, Savings for wealth accumulation at 2.5% APY, and Investment accounts targeting 7.0% estimated annual returns.' },
        { heading: 'Exclusive Services', body: 'Private banking clients enjoy priority transaction processing, enhanced credit facilities, international wire transfers, virtual card issuance with custom spending limits, and access to our loan programs at preferential rates.' },
      ],
      benefits: ['Dedicated relationship manager', 'Multi-account portfolio', 'Priority processing', 'Enhanced credit access', 'Global payment solutions'],
    }
  },
  {
    id: 'investment-strategy',
    label: 'Investment Strategy',
    icon: '📈',
    content: {
      title: 'Strategic Investment Planning',
      subtitle: 'Data-driven investment strategies for long-term growth',
      sections: [
        { heading: 'Our Investment Philosophy', body: 'Nova Trust follows a conservative-to-aggressive spectrum approach, matching each client\'s portfolio allocation to their risk tolerance, time horizon, and financial objectives. We prioritize capital preservation while maximizing growth opportunities.' },
        { heading: 'Asset Allocation Framework', body: 'A well-diversified portfolio at Nova Trust typically consists of liquid holdings in checking accounts for operational needs, growth-oriented savings in high-yield accounts, and a strategic investment allocation for long-term appreciation.' },
        { heading: 'Risk Management', body: 'Every investment strategy includes built-in risk management protocols: stop-loss thresholds, rebalancing triggers, liquidity reserves, and regular stress testing against market scenarios to protect your capital.' },
        { heading: 'Performance Tracking', body: 'Through your Nova Trust dashboard, monitor real-time portfolio performance, view transaction history dating back to account inception, and receive quarterly performance reports prepared by our investment team.' },
      ],
      benefits: ['Customized asset allocation', 'Risk-adjusted returns', 'Real-time performance tracking', 'Quarterly rebalancing', 'Market intelligence reports'],
    }
  },
  {
    id: 'loan-facilities',
    label: 'Loan Facilities',
    icon: '🤝',
    content: {
      title: 'Credit & Loan Facilities',
      subtitle: 'Flexible financing solutions for qualified clients',
      sections: [
        { heading: 'Private Credit Access', body: 'Nova Trust clients have access to premium loan facilities with preferential interest rates starting at 4.9% APR. Loans can be used for business expansion, real estate acquisition, investment leverage, or personal financial needs.' },
        { heading: 'Loan Products', body: 'We offer personal loans from $1,000 to $500,000 with terms of 3 to 60 months. Each loan is structured around your repayment capacity with flexible monthly payment schedules calculated to minimize financial strain.' },
        { heading: 'Fast Approval Process', body: 'Our streamlined approval process means qualified clients receive a decision within 24 hours. Approved funds are disbursed directly to your Nova Trust account, ready for immediate use.' },
        { heading: 'Repayment Flexibility', body: 'We understand financial circumstances evolve. Nova Trust loan facilities include options for early repayment without penalty, payment schedule adjustments, and loan restructuring for clients facing temporary financial challenges.' },
      ],
      benefits: ['Rates from 4.9% APR', 'Up to $500,000 facility', 'Flexible 3–60 month terms', '24-hour approval', 'No prepayment penalty'],
    }
  },
  {
    id: 'security-compliance',
    label: 'Security & Compliance',
    icon: '🔐',
    content: {
      title: 'Security & Compliance Framework',
      subtitle: 'Bank-level security protecting your assets 24/7',
      sections: [
        { heading: 'Military-Grade Encryption', body: 'All data transmitted and stored within Nova Trust systems is protected by AES-256 encryption — the same standard used by governments and financial institutions worldwide. Your financial data is secure at every touchpoint.' },
        { heading: 'Authentication & Access Control', body: 'Multi-factor authentication, JWT-based session management, and role-based access control ensure that only authorized individuals can access your account. All login attempts are logged and monitored for suspicious activity.' },
        { heading: 'Fraud Detection', body: 'Our automated fraud detection system monitors all transactions in real time. Unusual activity — such as large transactions, high-velocity patterns, or abnormal geographic access — triggers immediate alerts and account protection protocols.' },
        { heading: 'Compliance Standards', body: 'Nova Trust operates under strict internal compliance standards. All client information is handled with absolute confidentiality, with no sharing of personal data with third parties without explicit consent.' },
      ],
      benefits: ['AES-256 encryption', 'Multi-factor authentication', 'Real-time fraud monitoring', 'Complete data privacy', '99.99% platform uptime'],
    }
  },
];

function AppointmentForm() {
  const [form, setForm] = useState({ name:'', email:'', phone:'', date:'', time:'', service:'Wealth Consultation', message:'' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setSubmitted(true);
    setLoading(false);
  };

  const INP_STYLE = { display:'block', width:'100%', padding:'12px 14px', background:'#fff', border:'1.5px solid #e5e7eb', borderRadius:10, fontSize:14, color:'#1a1a1a', outline:'none', boxSizing:'border-box', fontFamily:'inherit', transition:'border-color 0.2s' };

  if (submitted) return (
    <div style={{textAlign:'center', padding:'40px 0'}}>
      <div style={{width:56, height:56, borderRadius:'50%', background:'#f0fdf4', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px'}}>
        <Check size={28} style={{color:'#16a34a'}}/>
      </div>
      <h3 style={{fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:20, color:'#1a1a1a', marginBottom:8}}>Appointment Requested!</h3>
      <p style={{color:'#888', fontSize:14}}>Our team will contact you within 24 hours to confirm your consultation.</p>
      <button onClick={() => setSubmitted(false)} style={{marginTop:20, padding:'10px 24px', borderRadius:10, border:'none', background:'#FF6A00', color:'#fff', fontWeight:600, cursor:'pointer', fontSize:14}}>Schedule Another</button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit}>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14}}>
        {[{l:'Full Name *',k:'name',p:'Your full name',t:'text'},{l:'Email Address *',k:'email',p:'your@email.com',t:'email'}].map(({l,k,p,t}) => (
          <div key={k}>
            <label style={{display:'block', fontSize:12, fontWeight:600, color:'#555', marginBottom:6}}>{l}</label>
            <input type={t} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} placeholder={p} required style={INP_STYLE} onFocus={e=>e.target.style.borderColor='#FF6A00'} onBlur={e=>e.target.style.borderColor='#e5e7eb'}/>
          </div>
        ))}
      </div>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14}}>
        <div>
          <label style={{display:'block', fontSize:12, fontWeight:600, color:'#555', marginBottom:6}}>Phone Number</label>
          <input type="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+1 555 000 0000" style={INP_STYLE} onFocus={e=>e.target.style.borderColor='#FF6A00'} onBlur={e=>e.target.style.borderColor='#e5e7eb'}/>
        </div>
        <div>
          <label style={{display:'block', fontSize:12, fontWeight:600, color:'#555', marginBottom:6}}>Service</label>
          <select value={form.service} onChange={e=>setForm({...form,service:e.target.value})} style={INP_STYLE}>
            {['Wealth Consultation','Private Banking','Investment Strategy','Loan Inquiry','Security Review','General Inquiry'].map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14}}>
        <div>
          <label style={{display:'block', fontSize:12, fontWeight:600, color:'#555', marginBottom:6}}>Preferred Date *</label>
          <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} required min={new Date().toISOString().split('T')[0]} style={INP_STYLE}/>
        </div>
        <div>
          <label style={{display:'block', fontSize:12, fontWeight:600, color:'#555', marginBottom:6}}>Preferred Time</label>
          <select value={form.time} onChange={e=>setForm({...form,time:e.target.value})} style={INP_STYLE}>
            {['Morning (9AM–12PM)','Afternoon (12PM–4PM)','Evening (4PM–7PM)'].map(t=><option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div style={{marginBottom:20}}>
        <label style={{display:'block', fontSize:12, fontWeight:600, color:'#555', marginBottom:6}}>Additional Notes</label>
        <textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="Tell us about your financial goals or any specific questions..." rows={3} style={{...INP_STYLE, resize:'vertical'}}/>
      </div>
      <button type="submit" disabled={loading} style={{width:'100%', padding:'14px', borderRadius:11, border:'none', background:'#FF6A00', color:'#fff', fontWeight:700, fontSize:15, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 4px 20px rgba(255,106,0,0.25)', opacity:loading?0.8:1}}>
        {loading ? 'Submitting...' : <><Calendar size={18}/>Schedule Consultation</>}
      </button>
    </form>
  );
}

export default function WealthPage() {
  const [activeTab, setActiveTab] = useState('wealth-creation');
  const [openAccordion, setOpenAccordion] = useState(null);
  const active = COURSES.find(c => c.id === activeTab);

  return (
    <div style={{minHeight:'100vh', background:'#0B0B0B', color:'#F0F0F0', fontFamily:'Inter,sans-serif'}}>
      {/* Navbar */}
      <nav style={{position:'sticky', top:0, zIndex:50, background:'rgba(11,11,11,0.96)', backdropFilter:'blur(12px)', borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
        <div style={{maxWidth:1200, margin:'0 auto', padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between', height:60}}>
          <Link href="/home" style={{display:'flex', alignItems:'center', gap:10, textDecoration:'none'}}>
            <div style={{width:30, height:30, borderRadius:9, background:'#FF6A00', display:'flex', alignItems:'center', justifyContent:'center'}}><Shield size={15} color="#000" strokeWidth={2.5}/></div>
            <span style={{fontFamily:'Poppins,sans-serif', fontWeight:700, color:'white', fontSize:14}}>NOVA TRUST</span>
          </Link>
          <div style={{display:'flex', gap:10}}>
            <Link href="/home" style={{padding:'8px 16px', borderRadius:9, border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.6)', textDecoration:'none', fontSize:13, fontWeight:500}}>← Back to Home</Link>
            <Link href="/login" style={{padding:'8px 16px', borderRadius:9, border:'none', background:'#FF6A00', color:'#000', fontWeight:700, fontSize:13, textDecoration:'none'}}>Client Login</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div style={{textAlign:'center', padding:'60px 24px 40px', background:'linear-gradient(180deg, rgba(255,106,0,0.05) 0%, transparent 100%)'}}>
        <p style={{fontSize:11, fontWeight:600, letterSpacing:'0.1em', color:'#FF6A00', marginBottom:12}}>FINANCIAL EDUCATION</p>
        <h1 style={{fontFamily:'Poppins,sans-serif', fontWeight:800, fontSize:36, color:'white', marginBottom:12}}>Wealth Management Knowledge Center</h1>
        <p style={{fontSize:15, color:'rgba(255,255,255,0.4)', maxWidth:560, margin:'0 auto'}}>Comprehensive financial education for Nova Trust clients. Explore our services and schedule a private consultation with your dedicated advisor.</p>
      </div>

      {/* Desktop Tabs */}
      <div style={{maxWidth:1200, margin:'0 auto', padding:'0 24px'}}>
        <div className="desktop-tabs" style={{display:'flex', gap:4, borderBottom:'1px solid rgba(255,255,255,0.08)', marginBottom:0, overflowX:'auto'}}>
          {COURSES.map(c => (
            <button key={c.id} onClick={() => setActiveTab(c.id)}
              style={{display:'flex', alignItems:'center', gap:8, padding:'14px 20px', border:'none', background:'transparent', cursor:'pointer', whiteSpace:'nowrap', fontSize:13, fontWeight:600, color:activeTab===c.id?'#FF6A00':'rgba(255,255,255,0.4)', borderBottom:activeTab===c.id?'2px solid #FF6A00':'2px solid transparent', transition:'all 0.2s'}}>
              <span>{c.icon}</span>{c.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {active && (
          <div style={{display:'grid', gridTemplateColumns:'1fr 400px', gap:32, padding:'40px 0 60px', alignItems:'start'}}>
            {/* Left: Content */}
            <div>
              <h2 style={{fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:28, color:'white', marginBottom:8}}>{active.content.title}</h2>
              <p style={{fontSize:15, color:'rgba(255,255,255,0.4)', marginBottom:32}}>{active.content.subtitle}</p>

              <div style={{display:'flex', flexDirection:'column', gap:24, marginBottom:36}}>
                {active.content.sections.map((s, i) => (
                  <div key={i} style={{padding:24, borderRadius:16, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)'}}>
                    <h3 style={{fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:17, color:'white', marginBottom:10}}>{s.heading}</h3>
                    <p style={{fontSize:14, color:'rgba(255,255,255,0.5)', lineHeight:1.7, margin:0}}>{s.body}</p>
                  </div>
                ))}
              </div>

              <div style={{padding:24, borderRadius:16, background:'rgba(255,106,0,0.05)', border:'1px solid rgba(255,106,0,0.15)'}}>
                <p style={{fontSize:12, fontWeight:600, letterSpacing:'0.08em', color:'#FF6A00', marginBottom:14}}>KEY BENEFITS</p>
                <div style={{display:'flex', flexDirection:'column', gap:10}}>
                  {active.content.benefits.map((b, i) => (
                    <div key={i} style={{display:'flex', alignItems:'center', gap:10}}>
                      <div style={{width:20, height:20, borderRadius:'50%', background:'rgba(255,106,0,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                        <Check size={11} style={{color:'#FF6A00'}}/>
                      </div>
                      <p style={{fontSize:14, color:'rgba(255,255,255,0.6)', margin:0}}>{b}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Appointment Form */}
            <div style={{position:'sticky', top:80}}>
              <div style={{background:'#fff', borderRadius:20, padding:28, boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
                <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:6}}>
                  <Calendar size={18} style={{color:'#FF6A00'}}/>
                  <p style={{fontSize:11, fontWeight:600, letterSpacing:'0.08em', color:'#FF6A00', margin:0}}>SCHEDULE A CONSULTATION</p>
                </div>
                <h3 style={{fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:18, color:'#1a1a1a', marginBottom:20}}>Book Your Private Session</h3>
                <AppointmentForm/>
                <div style={{marginTop:20, paddingTop:20, borderTop:'1px solid #f0f0f0', display:'flex', flexDirection:'column', gap:10}}>
                  {[{icon:Phone, text:'+1 (800) NOVA-TRUST'},{icon:Mail, text:'advisors@novatrust.com'}].map(({icon:Icon, text}) => (
                    <div key={text} style={{display:'flex', alignItems:'center', gap:8}}>
                      <Icon size={14} style={{color:'#FF6A00', flexShrink:0}}/>
                      <p style={{fontSize:13, color:'#888', margin:0}}>{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Accordion */}
        <div className="mobile-accordion" style={{display:'none', paddingTop:20, paddingBottom:40}}>
          {COURSES.map(c => (
            <div key={c.id} style={{border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, marginBottom:8, overflow:'hidden'}}>
              <button onClick={() => setOpenAccordion(openAccordion===c.id?null:c.id)}
                style={{width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', background:'rgba(255,255,255,0.03)', border:'none', cursor:'pointer', color:'white', fontSize:14, fontWeight:600}}>
                <span style={{display:'flex', alignItems:'center', gap:10}}><span>{c.icon}</span>{c.label}</span>
                <ChevronDown size={18} style={{transform:openAccordion===c.id?'rotate(180deg)':'none', transition:'transform 0.2s', color:'rgba(255,255,255,0.4)'}}/>
              </button>
              {openAccordion === c.id && (
                <div style={{padding:'0 20px 20px', background:'rgba(255,255,255,0.02)'}}>
                  <h3 style={{fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:18, color:'white', margin:'16px 0 8px'}}>{c.content.title}</h3>
                  {c.content.sections.map((s,i) => (
                    <div key={i} style={{marginBottom:16}}>
                      <h4 style={{fontSize:14, fontWeight:600, color:'rgba(255,255,255,0.8)', marginBottom:6}}>{s.heading}</h4>
                      <p style={{fontSize:13, color:'rgba(255,255,255,0.4)', lineHeight:1.6, margin:0}}>{s.body}</p>
                    </div>
                  ))}
                  <div style={{marginTop:20, background:'#fff', borderRadius:14, padding:20}}>
                    <h4 style={{fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:15, color:'#1a1a1a', marginBottom:16}}>Schedule Consultation</h4>
                    <AppointmentForm/>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .desktop-tabs { display: none !important; }
          .mobile-accordion { display: block !important; }
        }
        @media (max-width: 900px) {
          .content-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
