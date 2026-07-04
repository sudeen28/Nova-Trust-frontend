'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Shield, ArrowRight, Lock, Globe, BarChart2, Users, Phone, Mail, MapPin, Menu, X, DollarSign, PiggyBank, TrendingUp, CheckCircle2, Briefcase, CreditCard, Receipt, Landmark, Wifi, ShieldCheck } from 'lucide-react';

const CARD_TIERS = [
  {
    tier: 'BLACK',
    name: 'Nova Black Rewards',
    gradient: 'linear-gradient(135deg, #000000 0%, #1a1a1a 55%, #000000 100%)',
    accent: '#FF6A00',
    textColor: '#F5F3EF',
    stat: '6', statUnit: '%',
    caption: 'cash back offer',
    sub: 'No annual fee.',
    bonus: '$300 online bonus offer',
  },
  {
    tier: 'PLATINUM',
    name: 'Nova Platinum Cash',
    gradient: 'linear-gradient(135deg, #3a3a3a 0%, #6b6b6b 55%, #3a3a3a 100%)',
    accent: '#FF6A00',
    textColor: '#F5F3EF',
    stat: '2', statUnit: '%',
    caption: 'unlimited cash back',
    sub: 'No annual fee.',
    bonus: '$200 online bonus offer',
  },
  {
    tier: 'GOLD',
    name: 'Nova Gold Points',
    gradient: 'linear-gradient(135deg, #7a4a12 0%, #FF6A00 55%, #7a4a12 100%)',
    accent: '#0B0B0C',
    textColor: '#0B0B0C',
    stat: '1.5', statUnit: '',
    caption: 'points for every $1',
    sub: 'No annual fee.',
    bonus: '25,000 bonus points offer',
  },
  {
    tier: 'STANDARD',
    name: 'Nova Standard Card',
    gradient: 'linear-gradient(135deg, #1a1a1a 0%, #2b2b2b 55%, #1a1a1a 100%)',
    accent: '#FF6A00',
    textColor: '#F5F3EF',
    stat: '0', statUnit: '%',
    caption: 'intro APR offer',
    sub: 'No annual fee.',
    bonus: 'Intro APR for 15 billing cycles',
    badge: 'NEW OFFER',
  },
];

const NAV_ITEMS = [
  { label:'Personal Banking', href:'#services' },
  { label:'Business',         href:'#business' },
  { label:'Security',         href:'#security' },
  { label:'About',            href:'#about'    },
];

const SERVICES = [
  {
    type: 'CHECKING',
    icon: DollarSign,
    color: '#FF6A00',
    title: 'Private Checking',
    desc: 'Everyday banking with no fees, real-time transfers, and a dedicated relationship manager.',
    points: ['No monthly fees', 'Free virtual & physical cards', 'Same-day domestic transfers'],
  },
  {
    type: 'SAVINGS',
    icon: PiggyBank,
    color: '#22c55e',
    title: 'High-Yield Savings',
    desc: 'Put idle capital to work with rates well above the national average.',
    points: ['2.5% APY', 'No minimum balance', 'Instant transfers to Checking'],
  },
  {
    type: 'INVESTMENT',
    icon: TrendingUp,
    color: '#6366f1',
    title: 'Managed Investment',
    desc: 'A dedicated portfolio account, actively managed alongside your banking.',
    points: ['7.0% target APY', 'Quarterly performance reviews', 'Licensed advisor access'],
  },
];

const BUSINESS_SERVICES = [
  {
    icon: Briefcase,
    title: 'Business Checking',
    desc: 'Dedicated operating accounts with same-day transfers and no hidden fees, built for companies that move money daily.',
  },
  {
    icon: CreditCard,
    title: 'Merchant Services',
    desc: 'Accept payments in-store and online with transparent processing rates and next-day settlement.',
  },
  {
    icon: Receipt,
    title: 'Payroll & Disbursements',
    desc: 'Run payroll, pay vendors, and manage recurring disbursements from a single dashboard.',
  },
  {
    icon: Landmark,
    title: 'Business Lines of Credit',
    desc: 'Flexible credit lines sized to your business, reviewed by a dedicated commercial banker.',
  },
];

const STATS = [
  { v:'$2.4B+',  l:'Assets Managed' },
  { v:'99.99%',  l:'Platform Uptime' },
  { v:'256-bit', l:'Encryption' },
  { v:'24/7',    l:'Advisor Access' },
];

// Parses a stat string like "$2.4B+" or "12,400+" into animatable parts.
// Returns null for non-numeric strings (e.g. "A+"), which fall back to a plain fade-in.
const parseStat = (str) => {
  const m = String(str).match(/^([^\d]*)([\d,.]+)(.*)$/);
  if (!m) return null;
  const [, prefix, numStr, suffix] = m;
  const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0;
  const num = parseFloat(numStr.replace(/,/g, ''));
  if (isNaN(num)) return null;
  return { prefix, num, decimals, suffix };
};

// Scroll-triggered fade + rise wrapper. Fires once, first time the element
// enters the viewport (including immediately on load, if already in view).
function Reveal({ children, delay = 0, style = {}, className = '' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            obs.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// Animates a stat number counting up from 0 when it scrolls into view.
// Falls back to just displaying the value statically if it can't be parsed as a number.
function CountUpStat({ value, duration = 1200 }) {
  const parsed = parseStat(value);
  const [display, setDisplay] = useState(parsed ? `${parsed.prefix}0${parsed.suffix}` : value);
  const ref = useRef(null);
  const firedRef = useRef(false);

  useEffect(() => {
    if (!parsed) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !firedRef.current) {
            firedRef.current = true;
            const start = performance.now();
            const step = (now) => {
              const progress = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              const current = parsed.num * eased;
              const formatted = parsed.decimals > 0
                ? current.toFixed(parsed.decimals)
                : Math.round(current).toLocaleString('en-US');
              setDisplay(`${parsed.prefix}${formatted}${parsed.suffix}`);
              if (progress < 1) requestAnimationFrame(step);
              else setDisplay(value);
            };
            requestAnimationFrame(step);
            obs.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [value, duration]);

  return <span ref={ref}>{display}</span>;
}

export default function LandingPage() {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted]       = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{background:'#0B0B0C', minHeight:'100vh', fontFamily:'Inter,sans-serif', color:'#F5F3EF', overflowX:'hidden'}}>

      {/* TRUST STRIP */}
      <div style={{background:'#151515', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'8px 24px'}}>
        <div style={{maxWidth:1200, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'center', gap:10, flexWrap:'wrap'}}>
          <ShieldCheck size={13} style={{color:'#FF6A00', flexShrink:0}}/>
          <p style={{fontSize:11, color:'rgba(255,255,255,0.45)', textAlign:'center'}}>
            Nova Trust Private Banking, established 2000 — 256-bit encryption, deposits protected up to $250,000 per depositor.
          </p>
        </div>
      </div>


      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{background:scrolled?'rgba(11,11,12,0.96)':'transparent', backdropFilter:scrolled?'blur(12px)':'none', borderBottom:scrolled?'1px solid rgba(255,255,255,0.06)':'1px solid transparent'}}>
        <div style={{maxWidth:1200, margin:'0 auto', padding:'0 24px'}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', height:64}}>
            <Link href="/home" style={{display:'flex', alignItems:'center', gap:10, textDecoration:'none'}}>
              <div style={{width:32, height:32, borderRadius:10, background:'#FF6A00', display:'flex', alignItems:'center', justifyContent:'center'}}><Shield size={16} color="#000" strokeWidth={2.5}/></div>
              <span style={{fontFamily:'Poppins,sans-serif', fontWeight:700, color:'white', fontSize:15, letterSpacing:'-0.3px'}}>NOVA TRUST</span>
            </Link>

            <div className="hidden md:flex" style={{alignItems:'center', gap:4}}>
              {NAV_ITEMS.map(item => (
                <a key={item.label} href={item.href} style={{padding:'6px 14px', borderRadius:8, fontSize:12, fontWeight:500, color:'rgba(255,255,255,0.5)', textDecoration:'none', transition:'color 0.15s'}}
                  onMouseEnter={e=>e.currentTarget.style.color='#fff'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.5)'}>
                  {item.label}
                </a>
              ))}
            </div>

            <div className="hidden md:flex" style={{alignItems:'center', gap:10}}>
              <Link href="/login" style={{display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:10, fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.7)', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', textDecoration:'none'}}>
                <Lock size={11}/> Client Login
              </Link>
              <a href="#contact" style={{padding:'8px 16px', borderRadius:10, fontSize:12, fontWeight:600, background:'#FF6A00', color:'#000', textDecoration:'none', boxShadow:'0 4px 20px rgba(255,106,0,0.2)'}}>
                Request Invitation
              </a>
            </div>

            <button className="md:hidden" onClick={()=>setMobileOpen(!mobileOpen)} style={{color:'white', background:'none', border:'none'}}>
              <Menu size={22}/>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer — slides in from the right */}
      <div className="md:hidden" aria-hidden={!mobileOpen} style={{
        position:'fixed', inset:0, zIndex:60,
        pointerEvents: mobileOpen ? 'auto' : 'none',
      }}>
        {/* Backdrop */}
        <div onClick={()=>setMobileOpen(false)} style={{
          position:'absolute', inset:0, background:'rgba(0,0,0,0.6)',
          opacity: mobileOpen ? 1 : 0, transition:'opacity 0.3s ease',
        }}/>
        {/* Panel */}
        <div style={{
          position:'absolute', top:0, right:0, bottom:0, width:'78%', maxWidth:320,
          background:'#0F0F0F', borderLeft:'1px solid rgba(255,255,255,0.08)',
          boxShadow:'-8px 0 40px rgba(0,0,0,0.5)',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(100%)',
          transition:'transform 0.32s cubic-bezier(0.32,0.72,0,1)',
          display:'flex', flexDirection:'column', padding:'20px 24px',
        }}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28}}>
            <div style={{display:'flex', alignItems:'center', gap:10}}>
              <div style={{width:28, height:28, borderRadius:8, background:'#FF6A00', display:'flex', alignItems:'center', justifyContent:'center'}}><Shield size={13} color="#000" strokeWidth={2.5}/></div>
              <span style={{fontFamily:'Poppins,sans-serif', fontWeight:700, color:'white', fontSize:13}}>NOVA TRUST</span>
            </div>
            <button onClick={()=>setMobileOpen(false)} style={{color:'rgba(255,255,255,0.5)', background:'none', border:'none', padding:4}}>
              <X size={20}/>
            </button>
          </div>

          <div style={{display:'flex', flexDirection:'column', gap:2}}>
            {NAV_ITEMS.map(item => (
              <a key={item.label} href={item.href} onClick={()=>setMobileOpen(false)} style={{padding:'12px 4px', fontSize:15, fontWeight:500, color:'rgba(255,255,255,0.75)', textDecoration:'none', borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                {item.label}
              </a>
            ))}
          </div>

          <div style={{marginTop:'auto', display:'flex', flexDirection:'column', gap:10, paddingTop:20}}>
            <Link href="/login" onClick={()=>setMobileOpen(false)} style={{textAlign:'center', padding:'12px', borderRadius:10, fontSize:13, fontWeight:600, color:'white', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', textDecoration:'none'}}>Client Login</Link>
            <a href="#contact" onClick={()=>setMobileOpen(false)} style={{textAlign:'center', padding:'12px', borderRadius:10, fontSize:13, fontWeight:600, background:'#FF6A00', color:'#000', textDecoration:'none'}}>Request Invitation</a>
          </div>
        </div>
      </div>

      {/* HERO */}
      <section style={{minHeight:'80vh', display:'flex', alignItems:'center', position:'relative', overflow:'hidden', paddingTop:64}}>
        {/* Vault rings — signature element, now a background accent behind centered copy */}
        <div aria-hidden style={{
          position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
          width:900, height:900, pointerEvents:'none',
          opacity: mounted ? 0.5 : 0, transition:'opacity 1.2s ease',
        }}>
          <svg viewBox="0 0 720 720" width="900" height="900" style={{animation:'novaSpin 140s linear infinite'}}>
            <defs>
              <radialGradient id="ringGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FF6A00" stopOpacity="0.14"/>
                <stop offset="100%" stopColor="#FF6A00" stopOpacity="0"/>
              </radialGradient>
            </defs>
            <circle cx="360" cy="360" r="340" fill="url(#ringGlow)"/>
            {[330, 280, 232, 186, 142].map((r,i) => (
              <circle key={r} cx="360" cy="360" r={r} fill="none"
                stroke={i % 2 === 0 ? 'rgba(255,106,0,0.22)' : 'rgba(255,255,255,0.06)'}
                strokeWidth={i === 0 ? 1.5 : 1}
                strokeDasharray={i % 2 === 0 ? '2 10' : 'none'}
              />
            ))}
            {Array.from({length:24}).map((_,i) => {
              const angle = (i / 24) * Math.PI * 2;
              const x1 = 360 + Math.cos(angle) * 100, y1 = 360 + Math.sin(angle) * 100;
              const x2 = 360 + Math.cos(angle) * 142, y2 = 360 + Math.sin(angle) * 142;
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>;
            })}
            <circle cx="360" cy="360" r="76" fill="#0B0B0C" stroke="rgba(255,106,0,0.35)" strokeWidth="1.5"/>
            <circle cx="360" cy="360" r="8" fill="#FF6A00"/>
          </svg>
        </div>
        <div style={{position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize:'64px 64px', pointerEvents:'none'}}/>

        <div style={{maxWidth:900, margin:'0 auto', padding:'60px 24px', width:'100%', position:'relative', zIndex:1, textAlign:'center'}}>
          <Reveal delay={0} style={{display:'inline-flex', alignItems:'center', gap:8, padding:'6px 14px', borderRadius:100, background:'rgba(255,106,0,0.1)', border:'1px solid rgba(255,106,0,0.2)', marginBottom:24}}>
            <div style={{width:6, height:6, borderRadius:'50%', background:'#FF6A00'}}/>
            <span style={{fontFamily:'monospace', fontSize:11, fontWeight:600, color:'#FF6A00', letterSpacing:'0.08em'}}>BY INVITATION ONLY</span>
          </Reveal>
          <Reveal delay={100}>
            <h1 style={{fontFamily:'Poppins,sans-serif', fontWeight:800, fontSize:'clamp(36px,5.5vw,60px)', lineHeight:1.05, color:'white', marginBottom:20}}>
              Private Banking<br/>
              <span style={{color:'#FF6A00'}}>for Selected</span> Clients Only.
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p style={{fontSize:15, lineHeight:1.7, color:'rgba(255,255,255,0.45)', marginBottom:36, maxWidth:520, marginLeft:'auto', marginRight:'auto'}}>
              Nova Trust delivers an exclusive financial experience reserved for distinguished individuals. Manage wealth, transfers, and investments through a platform built for precision and privacy.
            </p>
          </Reveal>
          <Reveal delay={300} style={{display:'flex', gap:12, marginBottom:56, flexWrap:'wrap', justifyContent:'center'}}>
            <Link href="/login" style={{display:'flex', alignItems:'center', gap:8, padding:'14px 28px', borderRadius:12, background:'#FF6A00', color:'#000', fontWeight:600, fontSize:14, textDecoration:'none', boxShadow:'0 4px 24px rgba(255,106,0,0.25)'}}>
              Client Login <ArrowRight size={16}/>
            </Link>
            <a href="#contact" style={{display:'flex', alignItems:'center', gap:8, padding:'14px 28px', borderRadius:12, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.65)', fontWeight:600, fontSize:14, textDecoration:'none'}}>
              Request Invitation
            </a>
          </Reveal>
          <Reveal delay={400} style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:20, paddingTop:28, borderTop:'1px solid rgba(255,255,255,0.06)', maxWidth:640, margin:'0 auto'}}>
            {STATS.map(s=>(
              <div key={s.l}>
                <p style={{fontFamily:'monospace', fontWeight:700, fontSize:19, color:'white'}}><CountUpStat value={s.v}/></p>
                <p style={{fontSize:10.5, color:'rgba(255,255,255,0.32)', marginTop:3}}>{s.l}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* CARD CHOOSER — 4-column stat grid, dark-to-orange gradient, echoes real CardTier product data */}
      <section style={{
        padding:'96px 24px',
        background:'linear-gradient(180deg, #0B0B0C 0%, #1a1208 55%, #0B0B0C 100%)',
        borderTop:'1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{maxWidth:1200, margin:'0 auto'}}>
          <Reveal>
            <h2 style={{fontFamily:'Poppins,sans-serif', fontWeight:800, fontSize:'clamp(30px,4vw,44px)', color:'white', lineHeight:1.1, marginBottom:56}}>
              Choose the card that works for you
            </h2>
          </Reveal>

          <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:20}} className="card-chooser-grid">
            {CARD_TIERS.map((c,i) => (
              <Reveal key={c.tier} delay={i*90} style={{display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center'}}>

                {/* Stat */}
                <div style={{marginBottom:18}}>
                  <span style={{fontFamily:'Poppins,sans-serif', fontWeight:800, fontSize:44, color:'white', lineHeight:1}}>{c.stat}</span>
                  {c.statUnit && <span style={{fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:18, color:'white', verticalAlign:'top', position:'relative', top:4}}>{c.statUnit}</span>}
                </div>
                <p style={{fontSize:13, color:'rgba(255,255,255,0.6)', marginBottom:2}}>{c.caption}</p>
                <p style={{fontSize:13, color:'rgba(255,255,255,0.6)', marginBottom:20}}>{c.sub}</p>

                {/* Card mockup */}
                <div style={{
                  width:'100%', maxWidth:220, height:140, borderRadius:14, position:'relative',
                  background:c.gradient, boxShadow:'0 12px 32px rgba(0,0,0,0.4)',
                  padding:'14px 16px', boxSizing:'border-box',
                  border:'1px solid rgba(255,255,255,0.08)', marginBottom:16,
                }}>
                  {c.badge && (
                    <div style={{position:'absolute', top:0, left:0, background:'#FF6A00', color:'#000', fontSize:8.5, fontWeight:700, letterSpacing:'0.05em', padding:'3px 8px', borderRadius:'14px 0 8px 0'}}>
                      {c.badge}
                    </div>
                  )}
                  <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                    <div style={{display:'flex', alignItems:'center', gap:5}}>
                      <div style={{width:14, height:14, borderRadius:4, background:c.accent}}/>
                      <span style={{fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:9.5, color:c.textColor, letterSpacing:'-0.2px'}}>NOVA TRUST</span>
                    </div>
                    <Wifi size={13} style={{color:c.textColor, opacity:0.6, transform:'rotate(90deg)'}}/>
                  </div>
                  <div style={{position:'absolute', left:16, top:54, width:26, height:20, borderRadius:4, background:'linear-gradient(135deg,#d4af37,#f5d576)'}}/>
                  <div style={{position:'absolute', left:16, bottom:12}}>
                    <p style={{fontSize:8, fontWeight:600, letterSpacing:'0.08em', color:c.textColor, opacity:0.6}}>{c.tier}</p>
                  </div>
                  <div style={{position:'absolute', right:16, bottom:12}}>
                    <p style={{fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:11, fontStyle:'italic', color:c.textColor}}>VISA</p>
                  </div>
                </div>

                <p style={{fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.7)', marginBottom:12}}>{c.name}</p>

                {/* Bonus badge */}
                <a href="#contact" style={{
                  width:'100%', background:'white', borderRadius:12, padding:'12px 14px',
                  textDecoration:'none', display:'block',
                }}>
                  <span style={{fontSize:13, fontWeight:700, color:'#FF6A00', textDecoration:'underline', lineHeight:1.4}}>{c.bonus}</span>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES — color-coded to match the actual product's account types */}
      <section id="services" style={{padding:'96px 24px', borderTop:'1px solid rgba(255,255,255,0.05)'}}>
        <div style={{maxWidth:1200, margin:'0 auto'}}>
          <Reveal style={{marginBottom:56, maxWidth:560}}>
            <p style={{fontFamily:'monospace', fontSize:11, fontWeight:600, letterSpacing:'0.1em', color:'#FF6A00', marginBottom:12}}>ACCOUNTS</p>
            <h2 style={{fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:'clamp(28px,3.5vw,36px)', color:'white', lineHeight:1.2}}>Three accounts. One relationship.</h2>
          </Reveal>
          <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20}} className="services-grid">
            {SERVICES.map((s,i) => (
              <Reveal key={s.type} delay={i*100}>
                <div style={{padding:28, borderRadius:18, background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', transition:'transform 0.2s, border-color 0.2s'}}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.borderColor=`${s.color}40`;}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.07)';}}>
                  <div style={{width:44, height:44, borderRadius:13, background:`${s.color}18`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20, color:s.color}}>
                    <s.icon size={20}/>
                  </div>
                  <p style={{fontFamily:'monospace', fontSize:10, fontWeight:600, letterSpacing:'0.08em', color:s.color, marginBottom:8}}>{s.type}</p>
                  <h3 style={{fontFamily:'Poppins,sans-serif', fontWeight:600, color:'white', marginBottom:10, fontSize:18}}>{s.title}</h3>
                  <p style={{fontSize:13, color:'rgba(255,255,255,0.4)', lineHeight:1.6, marginBottom:20}}>{s.desc}</p>
                  <div style={{display:'flex', flexDirection:'column', gap:8}}>
                    {s.points.map(p => (
                      <div key={p} style={{display:'flex', alignItems:'center', gap:8}}>
                        <CheckCircle2 size={13} style={{color:s.color, flexShrink:0}}/>
                        <span style={{fontSize:12.5, color:'rgba(255,255,255,0.55)'}}>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SECURITY / FEATURES */}
      {/* BUSINESS */}
      <section id="business" style={{padding:'96px 24px', borderTop:'1px solid rgba(255,255,255,0.05)'}}>
        <div style={{maxWidth:1200, margin:'0 auto'}}>
          <Reveal style={{marginBottom:56, maxWidth:560}}>
            <p style={{fontFamily:'monospace', fontSize:11, fontWeight:600, letterSpacing:'0.1em', color:'#FF6A00', marginBottom:12}}>FOR BUSINESSES</p>
            <h2 style={{fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:'clamp(28px,3.5vw,36px)', color:'white', lineHeight:1.2, marginBottom:16}}>Banking built to run a business on.</h2>
            <p style={{fontSize:14, color:'rgba(255,255,255,0.4)', lineHeight:1.7}}>From a single operating account to full payroll and merchant processing — a commercial banker manages your relationship end to end.</p>
          </Reveal>
          <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16}} className="features-grid">
            {BUSINESS_SERVICES.map((b,i) => (
              <Reveal key={b.title} delay={i*90}>
                <div style={{padding:24, borderRadius:16, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', transition:'transform 0.2s'}}
                  onMouseEnter={e=>e.currentTarget.style.transform='translateY(-4px)'}
                  onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
                  <div style={{width:40, height:40, borderRadius:12, background:'rgba(255,106,0,0.1)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16, color:'#FF6A00'}}><b.icon size={18}/></div>
                  <h3 style={{fontFamily:'Poppins,sans-serif', fontWeight:600, color:'white', marginBottom:8, fontSize:15}}>{b.title}</h3>
                  <p style={{fontSize:13, color:'rgba(255,255,255,0.35)', lineHeight:1.6}}>{b.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal style={{marginTop:40, textAlign:'center'}}>
            <a href="#contact" style={{display:'inline-flex', alignItems:'center', gap:8, padding:'13px 22px', borderRadius:12, background:'rgba(255,106,0,0.1)', border:'1px solid rgba(255,106,0,0.25)', color:'#FF6A00', fontWeight:600, fontSize:13, textDecoration:'none'}}>
              Talk to a Commercial Banker <ArrowRight size={14}/>
            </a>
          </Reveal>
        </div>
      </section>

      <section id="security" style={{padding:'96px 24px', borderTop:'1px solid rgba(255,255,255,0.05)'}}>
        <div style={{maxWidth:1200, margin:'0 auto'}}>
          <Reveal style={{textAlign:'center', marginBottom:56}}>
            <p style={{fontFamily:'monospace', fontSize:11, fontWeight:600, letterSpacing:'0.1em', color:'#FF6A00', marginBottom:12}}>WHY NOVA TRUST</p>
            <h2 style={{fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:'clamp(28px,3.5vw,36px)', color:'white'}}>Financial excellence,<br/>engineered for you.</h2>
          </Reveal>
          <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16}} className="features-grid">
            {[
              {icon:Lock,     title:'Military-grade Security', desc:'256-bit encryption protecting every transaction and session.'},
              {icon:Globe,    title:'Global Access',           desc:'Access your portfolio securely from anywhere, 24/7.'},
              {icon:BarChart2,title:'Smart Insights',          desc:'Real-time analytics across all your accounts and investments.'},
              {icon:Users,    title:'Dedicated Support',       desc:'Private banking advisors exclusively for our clients.'},
            ].map((f,i)=>(
              <Reveal key={f.title} delay={i*90}>
                <div style={{padding:24, borderRadius:16, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', transition:'transform 0.2s'}}
                  onMouseEnter={e=>e.currentTarget.style.transform='translateY(-4px)'}
                  onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
                  <div style={{width:40, height:40, borderRadius:12, background:'rgba(255,106,0,0.1)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16, color:'#FF6A00'}}><f.icon size={18}/></div>
                  <h3 style={{fontFamily:'Poppins,sans-serif', fontWeight:600, color:'white', marginBottom:8, fontSize:15}}>{f.title}</h3>
                  <p style={{fontSize:13, color:'rgba(255,255,255,0.35)', lineHeight:1.6}}>{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" style={{padding:'96px 24px', borderTop:'1px solid rgba(255,255,255,0.05)'}}>
        <div style={{maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'center'}} className="about-grid">
          <Reveal>
            <p style={{fontFamily:'monospace', fontSize:11, fontWeight:600, letterSpacing:'0.1em', color:'#FF6A00', marginBottom:12}}>ABOUT US</p>
            <h2 style={{fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:'clamp(26px,3vw,32px)', color:'white', marginBottom:20, lineHeight:1.25}}>
              Built for people who expect more from a bank.
            </h2>
            <p style={{fontSize:14, color:'rgba(255,255,255,0.45)', lineHeight:1.8, marginBottom:16}}>
              Since 2000, Nova Trust has operated on a simple premise: private banking should feel effortless, not exclusive for its own sake. Every account comes with a dedicated advisor, real-time visibility into your money, and infrastructure built to institutional standards.
            </p>
            <p style={{fontSize:14, color:'rgba(255,255,255,0.45)', lineHeight:1.8}}>
              We manage checking, savings, and investment accounts under one relationship — so your advisor sees the full picture, not just one product.
            </p>
          </Reveal>
          <Reveal delay={150} style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
            {[
              {v:'2000', l:'Founded'},
              {v:'12,400+', l:'Clients Served'},
              {v:'A+', l:'Trust Rating'},
              {v:'$0', l:'Monthly Fees'},
            ].map(s => (
              <div key={s.l} style={{padding:24, borderRadius:16, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)'}}>
                <p style={{fontFamily:'monospace', fontWeight:700, fontSize:24, color:'#FF6A00'}}><CountUpStat value={s.v}/></p>
                <p style={{fontSize:11.5, color:'rgba(255,255,255,0.35)', marginTop:4}}>{s.l}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{padding:'96px 24px', borderTop:'1px solid rgba(255,255,255,0.05)'}}>
        <div style={{maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'start'}} className="about-grid">
          <Reveal>
            <p style={{fontFamily:'monospace', fontSize:11, fontWeight:600, letterSpacing:'0.1em', color:'#FF6A00', marginBottom:12}}>CONTACT US</p>
            <h2 style={{fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:32, color:'white', marginBottom:16}}>Get in touch.</h2>
            <p style={{fontSize:14, color:'rgba(255,255,255,0.4)', lineHeight:1.7, marginBottom:32}}>Schedule a private consultation. Access to Nova Trust is by invitation only.</p>
            {[{icon:Phone,text:'+1 (800) NOVA-TRUST'},{icon:Mail,text:'private@novatrust.com'},{icon:MapPin,text:'One Private Plaza, New York, NY 10004'}].map(({icon:Icon,text})=>(
              <div key={text} style={{display:'flex', alignItems:'center', gap:12, marginBottom:16}}>
                <div style={{width:36, height:36, borderRadius:10, background:'rgba(255,106,0,0.1)', display:'flex', alignItems:'center', justifyContent:'center', color:'#FF6A00', flexShrink:0}}><Icon size={15}/></div>
                <p style={{fontSize:13, color:'rgba(255,255,255,0.5)'}}>{text}</p>
              </div>
            ))}
          </Reveal>
          <Reveal delay={150} style={{background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:28}}>
            <h3 style={{fontFamily:'Poppins,sans-serif', fontWeight:600, color:'white', marginBottom:20}}>Request an Invitation</h3>
            {[{l:'FULL NAME',p:'Your name'},{l:'EMAIL',p:'your@email.com'},{l:'PHONE',p:'+1 (555) 000-0000'}].map(f=>(
              <div key={f.l} style={{marginBottom:14}}>
                <label style={{display:'block', fontSize:10, fontWeight:600, letterSpacing:'0.08em', color:'rgba(255,255,255,0.35)', marginBottom:6}}>{f.l}</label>
                <input type="text" style={{width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'11px 14px', color:'white', fontSize:13, boxSizing:'border-box', outline:'none'}} placeholder={f.p}/>
              </div>
            ))}
            <div style={{marginBottom:16}}>
              <label style={{display:'block', fontSize:10, fontWeight:600, letterSpacing:'0.08em', color:'rgba(255,255,255,0.35)', marginBottom:6}}>MESSAGE</label>
              <textarea rows={3} style={{width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'11px 14px', color:'white', fontSize:13, boxSizing:'border-box', outline:'none', resize:'none'}} placeholder="Tell us about your needs..."/>
            </div>
            <button style={{width:'100%', padding:'13px', borderRadius:10, background:'#FF6A00', color:'#000', fontWeight:600, fontSize:14, border:'none', cursor:'pointer', boxShadow:'0 4px 20px rgba(255,106,0,0.2)'}}>Submit Request</button>
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{padding:'32px 24px', borderTop:'1px solid rgba(255,255,255,0.05)'}}>
        <div style={{maxWidth:1200, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16}}>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <div style={{width:28, height:28, borderRadius:8, background:'#FF6A00', display:'flex', alignItems:'center', justifyContent:'center'}}><Shield size={13} color="#000"/></div>
            <span style={{fontFamily:'Poppins,sans-serif', fontWeight:700, color:'white', fontSize:13}}>NOVA TRUST</span>
          </div>
          <p style={{fontSize:11, color:'rgba(255,255,255,0.2)'}}>© 2024 Nova Trust Private Banking. For selected clients only.</p>
          <div style={{display:'flex', gap:20}}>
            {['Privacy','Terms','Security'].map(l=><a key={l} href="#" style={{fontSize:11, color:'rgba(255,255,255,0.25)', textDecoration:'none'}}>{l}</a>)}
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes novaSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 860px) {
          .hero-grid, .about-grid { grid-template-columns: 1fr !important; }
          .services-grid, .features-grid, .card-chooser-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 560px) {
          .services-grid, .features-grid, .card-chooser-grid { grid-template-columns: 1fr !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
        }
      `}</style>
    </div>
  );
}