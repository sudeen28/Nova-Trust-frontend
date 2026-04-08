'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, ChevronDown, ArrowRight, Lock, Globe, BarChart2, Users, Phone, Mail, MapPin, Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { label:'Wealth Management',     href:'/wealth'   },
  { label:'Schedule Appointment',  href:'#contact'  },
  { label:'Business',              href:'#business' },
  { label:'Wealth Management',     href:'#wealth'   },
  { label:'Privacy & Security',    href:'#security' },
  { label:'About Us',              href:'#about'    },
  { label:'Contact Us',            href:'#contact'  },
  { label:'Help',                  href:'#help'     },
];

export default function LandingPage() {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginForm, setLoginForm]   = useState({ email:'', password:'' });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{background:'#0B0B0B', minHeight:'100vh', fontFamily:'Inter,sans-serif', color:'#F0F0F0'}}>

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{background:scrolled?'rgba(11,11,11,0.96)':'transparent', backdropFilter:scrolled?'blur(12px)':'none', borderBottom:scrolled?'1px solid rgba(255,255,255,0.06)':'none'}}>
        <div style={{maxWidth:1200, margin:'0 auto', padding:'0 24px'}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', height:64}}>
            <Link href="/home" style={{display:'flex', alignItems:'center', gap:10, textDecoration:'none'}}>
              <div style={{width:32, height:32, borderRadius:10, background:'#FF6A00', display:'flex', alignItems:'center', justifyContent:'center'}}><Shield size={16} color="#000" strokeWidth={2.5}/></div>
              <span style={{fontFamily:'Poppins,sans-serif', fontWeight:700, color:'white', fontSize:15, letterSpacing:'-0.3px'}}>NOVA TRUST</span>
            </Link>
            <div style={{display:'flex', alignItems:'center', gap:4}}>
              {NAV_ITEMS.slice(0,5).map(item => (
                <a key={item.label} href={item.href} style={{padding:'6px 12px', borderRadius:8, fontSize:12, fontWeight:500, color:'rgba(255,255,255,0.45)', textDecoration:'none', transition:'color 0.15s'}}
                  onMouseEnter={e=>e.currentTarget.style.color='#fff'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.45)'}>
                  {item.label}
                </a>
              ))}
            </div>
            <div style={{display:'flex', alignItems:'center', gap:10}}>
              <Link href="/login" style={{display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:10, fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.65)', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', textDecoration:'none'}}>
                <Lock size={11}/> Client Login
              </Link>
              <Link href="/register" style={{padding:'8px 16px', borderRadius:10, fontSize:12, fontWeight:600, background:'#FF6A00', color:'#000', textDecoration:'none', boxShadow:'0 4px 20px rgba(255,106,0,0.2)'}}>
                Enroll Now
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{minHeight:'100vh', display:'flex', alignItems:'center', position:'relative', overflow:'hidden'}}>
        {/* BG effects */}
        <div style={{position:'absolute', inset:0, pointerEvents:'none'}}>
          <div style={{position:'absolute', top:'20%', left:'15%', width:500, height:500, borderRadius:'50%', background:'#FF6A00', opacity:0.07, filter:'blur(80px)'}}/>
          <div style={{position:'absolute', bottom:'20%', right:'15%', width:300, height:300, borderRadius:'50%', background:'#6366f1', opacity:0.05, filter:'blur(60px)'}}/>
          <div style={{position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize:'64px 64px'}}/>
        </div>

        <div style={{maxWidth:1200, margin:'0 auto', padding:'100px 24px 60px', width:'100%', position:'relative', zIndex:1}}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'center'}}>

            {/* Left */}
            <div>
              <div style={{display:'inline-flex', alignItems:'center', gap:8, padding:'6px 14px', borderRadius:100, background:'rgba(255,106,0,0.1)', border:'1px solid rgba(255,106,0,0.2)', marginBottom:24}}>
                <div style={{width:6, height:6, borderRadius:'50%', background:'#FF6A00'}}/>
                <span style={{fontSize:11, fontWeight:600, color:'#FF6A00', letterSpacing:'0.08em'}}>BY INVITATION ONLY</span>
              </div>
              <h1 style={{fontFamily:'Poppins,sans-serif', fontWeight:800, fontSize:56, lineHeight:1.05, color:'white', marginBottom:20}}>
                Private Banking<br/>
                <span style={{color:'#FF6A00'}}>for Selected</span><br/>
                Clients Only.
              </h1>
              <p style={{fontSize:15, lineHeight:1.7, color:'rgba(255,255,255,0.4)', marginBottom:36, maxWidth:460}}>
                Nova Trust delivers an exclusive financial experience reserved for distinguished individuals. Manage wealth, transfers, and investments through a platform built for precision and privacy.
              </p>
              <div style={{display:'flex', gap:12, marginBottom:48}}>
                <Link href="/login" style={{display:'flex', alignItems:'center', gap:8, padding:'14px 24px', borderRadius:12, background:'#FF6A00', color:'#000', fontWeight:600, fontSize:14, textDecoration:'none', boxShadow:'0 4px 24px rgba(255,106,0,0.25)'}}>
                  Access Account <ArrowRight size={16}/>
                </Link>
                <a href="#about" style={{display:'flex', alignItems:'center', gap:8, padding:'14px 24px', borderRadius:12, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.6)', fontWeight:600, fontSize:14, textDecoration:'none'}}>
                  Learn More
                </a>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24, paddingTop:28, borderTop:'1px solid rgba(255,255,255,0.06)'}}>
                {[{v:'$2.4B+',l:'Assets Managed'},{v:'99.99%',l:'Platform Uptime'},{v:'256-bit',l:'Encryption'}].map(s=>(
                  <div key={s.l}>
                    <p style={{fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:22, color:'white'}}>{s.v}</p>
                    <p style={{fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:2}}>{s.l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — login card */}
            <div style={{background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:32}}>
              <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:4}}>
                <Lock size={13} style={{color:'#FF6A00'}}/>
                <p style={{fontSize:10, fontWeight:600, letterSpacing:'0.08em', color:'#FF6A00'}}>SECURE CLIENT ACCESS</p>
              </div>
              <h2 style={{fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:20, color:'white', marginBottom:24}}>Sign In to Your Portfolio</h2>
              <div style={{display:'flex', flexDirection:'column', gap:16}}>
                <div>
                  <label style={{display:'block', fontSize:10, fontWeight:600, letterSpacing:'0.08em', color:'rgba(255,255,255,0.35)', marginBottom:8}}>EMAIL ADDRESS</label>
                  <input type="email" value={loginForm.email} onChange={e=>setLoginForm({...loginForm,email:e.target.value})}
                    style={{width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'12px 16px', color:'white', fontSize:14, boxSizing:'border-box', outline:'none'}}
                    placeholder="your@email.com"/>
                </div>
                <div>
                  <label style={{display:'block', fontSize:10, fontWeight:600, letterSpacing:'0.08em', color:'rgba(255,255,255,0.35)', marginBottom:8}}>PASSWORD</label>
                  <input type="password" value={loginForm.password} onChange={e=>setLoginForm({...loginForm,password:e.target.value})}
                    style={{width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'12px 16px', color:'white', fontSize:14, boxSizing:'border-box', outline:'none'}}
                    placeholder="••••••••"/>
                </div>
                <Link href="/login"
                  style={{display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'14px 24px', borderRadius:12, background:'#FF6A00', color:'#000', fontWeight:600, fontSize:14, textDecoration:'none', boxShadow:'0 4px 20px rgba(255,106,0,0.2)'}}>
                  Access Account <ArrowRight size={15}/>
                </Link>
              </div>
              <div style={{marginTop:20, paddingTop:20, borderTop:'1px solid rgba(255,255,255,0.06)'}}>
                <p style={{fontSize:11, textAlign:'center', color:'rgba(255,255,255,0.25)', marginBottom:10}}>DEMO CREDENTIALS</p>
                {[{r:'Admin',e:'admin@novatrust.com'},{r:'Client',e:'james@demo.com'}].map(d=>(
                  <button key={d.e} onClick={()=>setLoginForm({email:d.e,password:'Password123'})}
                    style={{width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', borderRadius:10, border:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)', color:'rgba(255,255,255,0.4)', fontSize:12, cursor:'pointer', marginBottom:6}}>
                    <span style={{color:'rgba(255,106,0,0.7)'}}>{d.r}</span>
                    <span style={{fontFamily:'monospace'}}>{d.e}</span>
                  </button>
                ))}
                <p style={{fontSize:11, textAlign:'center', color:'rgba(255,255,255,0.2)', marginTop:6}}>Password: <span style={{fontFamily:'monospace'}}>Password123</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="about" style={{padding:'80px 24px', borderTop:'1px solid rgba(255,255,255,0.05)'}}>
        <div style={{maxWidth:1200, margin:'0 auto'}}>
          <div style={{textAlign:'center', marginBottom:56}}>
            <p style={{fontSize:11, fontWeight:600, letterSpacing:'0.1em', color:'#FF6A00', marginBottom:12}}>WHY NOVA TRUST</p>
            <h2 style={{fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:36, color:'white'}}>Financial excellence,<br/>engineered for you.</h2>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16}}>
            {[
              {icon:Lock,     title:'Military-grade Security', desc:'256-bit encryption protecting every transaction and session.'},
              {icon:Globe,    title:'Global Access',           desc:'Access your portfolio securely from anywhere, 24/7.'},
              {icon:BarChart2,title:'Smart Insights',          desc:'Real-time analytics across all your accounts and investments.'},
              {icon:Users,    title:'Dedicated Support',       desc:'Private banking advisors exclusively for our clients.'},
            ].map(f=>(
              <div key={f.title} style={{padding:24, borderRadius:16, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', transition:'transform 0.2s'}}
                onMouseEnter={e=>e.currentTarget.style.transform='translateY(-4px)'}
                onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
                <div style={{width:40, height:40, borderRadius:12, background:'rgba(255,106,0,0.1)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16, color:'#FF6A00'}}><f.icon size={18}/></div>
                <h3 style={{fontFamily:'Poppins,sans-serif', fontWeight:600, color:'white', marginBottom:8, fontSize:15}}>{f.title}</h3>
                <p style={{fontSize:13, color:'rgba(255,255,255,0.35)', lineHeight:1.6}}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{padding:'80px 24px', borderTop:'1px solid rgba(255,255,255,0.05)'}}>
        <div style={{maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'start'}}>
          <div>
            <p style={{fontSize:11, fontWeight:600, letterSpacing:'0.1em', color:'#FF6A00', marginBottom:12}}>CONTACT US</p>
            <h2 style={{fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:32, color:'white', marginBottom:16}}>Get in touch.</h2>
            <p style={{fontSize:14, color:'rgba(255,255,255,0.4)', lineHeight:1.7, marginBottom:32}}>Schedule a private consultation. Access to Nova Trust is by invitation only.</p>
            {[{icon:Phone,text:'+1 (800) NOVA-TRUST'},{icon:Mail,text:'private@novatrust.com'},{icon:MapPin,text:'One Private Plaza, New York, NY 10004'}].map(({icon:Icon,text})=>(
              <div key={text} style={{display:'flex', alignItems:'center', gap:12, marginBottom:16}}>
                <div style={{width:36, height:36, borderRadius:10, background:'rgba(255,106,0,0.1)', display:'flex', alignItems:'center', justifyContent:'center', color:'#FF6A00', flexShrink:0}}><Icon size={15}/></div>
                <p style={{fontSize:13, color:'rgba(255,255,255,0.5)'}}>{text}</p>
              </div>
            ))}
          </div>
          <div style={{background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:28}}>
            <h3 style={{fontFamily:'Poppins,sans-serif', fontWeight:600, color:'white', marginBottom:20}}>Schedule a Consultation</h3>
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
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{padding:'32px 24px', borderTop:'1px solid rgba(255,255,255,0.05)'}}>
        <div style={{maxWidth:1200, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
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
    </div>
  );
}
