'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = (localStorage.getItem('folioiq-theme') as 'dark' | 'light') || 'dark';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('folioiq-theme', next);
  };

  return (
    <>
      <style>{`
        .hero-section::before {
          content:''; position:absolute; top:-200px; left:50%; transform:translateX(-50%);
          width:900px; height:900px; border-radius:50%;
          background:radial-gradient(circle,color-mix(in oklab,var(--brand) 14%,transparent),transparent 60%);
          filter:blur(40px); pointer-events:none; z-index:0;
        }
        .hero-section>*{position:relative;z-index:1;}
        .hero-em{font-style:italic;color:var(--brand);position:relative;display:inline-block;}
        .hero-em::after{content:'';position:absolute;left:0;right:0;bottom:6px;height:8px;background:var(--brand);opacity:.3;border-radius:99px;transform:skew(-12deg);}
        .feat-card{transition:transform .25s,border-color .25s;}
        .feat-card:hover{transform:translateY(-4px);border-color:var(--border-strong)!important;}
        .intg{transition:color .15s;cursor:pointer;}
        .intg:hover{color:var(--ink)!important;}
        .flink{display:block;padding:6px 0;font-size:13.5px;text-decoration:none;transition:color .15s;}
        .flink:hover{color:var(--ink)!important;}
        @keyframes pd{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.6;transform:scale(1.4);}}
        @media(max-width:900px){
          .nav-links{display:none!important;}
          .feat-grid,.steps-grid,.testi-grid{grid-template-columns:1fr!important;}
          .stats-grid{grid-template-columns:repeat(2,1fr)!important;}
          .prev-port{grid-template-columns:1fr!important;}
          .footer-cols{grid-template-columns:1fr 1fr!important;}
          .cta-box{padding:48px 24px!important;margin:60px 16px!important;}
        }
      `}</style>

      {/* NAV */}
      <header style={{position:'sticky',top:0,zIndex:50,background:'color-mix(in oklab,var(--bg) 85%,transparent)',backdropFilter:'blur(16px) saturate(180%)',borderBottom:'1px solid var(--border)'}}>
        <div style={{display:'flex',alignItems:'center',gap:32,padding:'16px 28px',maxWidth:1240,margin:'0 auto'}}>
          <Link href="/" style={{display:'flex',alignItems:'center',gap:10,fontSize:18,fontWeight:700,letterSpacing:'-0.02em',color:'var(--ink)',textDecoration:'none',flexShrink:0}}>
            <span style={{width:36,height:36,borderRadius:11,background:'var(--brand)',display:'inline-flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 0 1px var(--brand),0 0 20px -4px color-mix(in oklab,var(--brand) 60%,transparent)'}}>
              <span style={{fontFamily:'var(--font-serif)',fontSize:22,color:'var(--bg-deep)',fontStyle:'italic',lineHeight:1,marginTop:-2}}>ƒ</span>
            </span>
            FolioIQ
          </Link>
          <nav className="nav-links" style={{display:'flex',gap:28,flex:1,justifyContent:'center',fontSize:14}}>
            <a href="#features" style={{color:'var(--ink-2)',textDecoration:'none'}}>Features</a>
            <a href="#how-it-works" style={{color:'var(--ink-2)',textDecoration:'none'}}>How it works</a>
            <Link href="/screener" style={{color:'var(--ink-2)',textDecoration:'none'}}>Fund Screener</Link>
            <a href="#pricing" style={{color:'var(--ink-2)',textDecoration:'none'}}>Pricing</a>
          </nav>
          <div style={{display:'flex',gap:10,alignItems:'center',flexShrink:0}}>
            <button onClick={toggleTheme} style={{padding:9,background:'transparent',border:'none',borderRadius:8,cursor:'pointer',color:'var(--ink-2)',display:'flex'}} aria-label="Toggle theme">
              {theme==='dark'
                ?<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
                :<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>}
            </button>
            <Link href="/auth" style={{padding:'9px 14px',borderRadius:999,fontSize:13,color:'var(--ink-2)',textDecoration:'none'}}>Sign in</Link>
            <Link href="/auth" style={{padding:'9px 18px',borderRadius:999,fontSize:13,fontWeight:600,background:'var(--ink)',color:'var(--bg-deep)',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:6}}>
              Get started <span style={{fontSize:14}}>→</span>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="hero-section" style={{padding:'100px 0 80px',textAlign:'center',position:'relative',overflow:'hidden'}}>
        <span style={{display:'inline-flex',alignItems:'center',gap:8,padding:'8px 16px',borderRadius:999,background:'var(--surface-2)',border:'1px solid var(--border)',fontSize:12,fontWeight:500,color:'var(--ink-2)'}}>
          <span style={{width:6,height:6,borderRadius:99,background:'var(--up)',boxShadow:'0 0 8px var(--up)',animation:'pd 2s infinite',display:'inline-block'}}/>
          India's smartest mutual fund portfolio analyzer
        </span>
        <h1 style={{fontFamily:'var(--font-serif)',fontSize:'clamp(56px,9vw,132px)',lineHeight:.95,letterSpacing:'-0.04em',fontWeight:400,margin:'28px 0',color:'var(--ink)'}}>
          Your money, <span className="hero-em">finally</span><br/>working.
        </h1>
        <p style={{fontSize:18,lineHeight:1.6,color:'var(--ink-2)',maxWidth:580,margin:'0 auto 36px'}}>
          Upload your CAS statement and get instant AI signals, after-tax returns, tax harvest plan, and rebalancing advice. No jargon. Just clarity.
        </p>
        <div style={{display:'flex',gap:12,justifyContent:'center',marginBottom:28,flexWrap:'wrap'}}>
          <Link href="/auth" style={{padding:'18px 28px',borderRadius:999,fontSize:15,fontWeight:600,background:'var(--ink)',color:'var(--bg-deep)',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:8}}>
            Analyze my portfolio — free <span style={{fontSize:16}}>→</span>
          </Link>
          <Link href="/screener" style={{padding:'18px 28px',borderRadius:999,fontSize:15,fontWeight:500,background:'var(--surface)',color:'var(--ink)',border:'1px solid var(--border)',textDecoration:'none'}}>
            Browse 63+ funds
          </Link>
        </div>
        <div style={{display:'flex',gap:22,justifyContent:'center',alignItems:'center',color:'var(--ink-3)',fontSize:12,flexWrap:'wrap'}}>
          <span><strong style={{color:'var(--ink-2)',fontWeight:500}}>Free forever</strong> · No credit card</span>
          <span>·</span>
          <span>NJ Wealth, <strong style={{color:'var(--brand)',fontWeight:500}}>Groww</strong>, Zerodha, ET Money, CAMS</span>
        </div>

        {/* Dashboard preview */}
        <div style={{marginTop:60,padding:'0 28px'}}>
          <div style={{maxWidth:1100,margin:'0 auto',borderRadius:20,overflow:'hidden',background:'var(--surface)',border:'1px solid var(--border)',boxShadow:'0 0 0 1px var(--border),0 30px 80px -20px rgba(0,0,0,.6),0 0 120px -20px color-mix(in oklab,var(--brand) 20%,transparent)'}}>
            <div style={{display:'flex',alignItems:'center',gap:8,padding:'12px 16px',background:'var(--surface-2)',borderBottom:'1px solid var(--border)'}}>
              <div style={{display:'flex',gap:6}}>
                {['#ff5f57','#ffbd2e','#28ca42'].map((c,i)=><span key={i} style={{width:12,height:12,borderRadius:99,background:c}}/>)}
              </div>
              <span style={{marginLeft:14,fontFamily:'var(--font-mono)',fontSize:11.5,color:'var(--ink-3)'}}>folioiq.com/dashboard</span>
              <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:8}}>
                <div style={{width:32,height:32,borderRadius:9,background:'color-mix(in oklab,var(--brand) 14%,var(--surface-3))',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{color:'var(--brand)'}}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></svg>
                </div>
                <span style={{fontSize:11,color:'var(--ink-3)'}}><strong style={{color:'var(--brand)'}}>94</strong>/100</span>
              </div>
            </div>
            <div style={{padding:36}}>
              <div style={{display:'flex',gap:40,padding:'12px 20px',background:'var(--bg-deep)',borderRadius:12,marginBottom:28,fontFamily:'var(--font-mono)',fontSize:11.5,overflow:'hidden',flexWrap:'wrap'}}>
                {[['NIFTY 50','23,412 +0.14%'],['SENSEX','74,608 +0.07%'],['GOLD','₹1,62,010 +4.52%'],['USD/INR','95.71 +0.43%'],['NIFTY IT','29,394 +1.21%']].map(([k,v],i)=>(
                  <span key={i}><span style={{color:'var(--ink-3)',marginRight:8}}>{k}</span><span style={{color:'var(--up)'}}>{v}</span></span>
                ))}
              </div>
              <div className="prev-port" style={{display:'grid',gridTemplateColumns:'1.4fr 1fr',gap:28,marginBottom:28}}>
                <div>
                  <div style={{fontSize:10.5,textTransform:'uppercase',letterSpacing:'0.14em',color:'var(--ink-3)',fontWeight:500}}>Total portfolio value</div>
                  <div style={{fontFamily:'var(--font-serif)',fontSize:80,lineHeight:.95,letterSpacing:'-0.03em',margin:'8px 0',fontWeight:400,color:'var(--ink)'}}>₹55.33 L</div>
                  <div style={{color:'var(--up)',fontSize:13}}>↑ ₹16.22L (+41.46%) all time · After-tax ≈ ₹14.19L</div>
                  <div style={{marginTop:14,padding:'10px 14px',background:'var(--surface-2)',borderRadius:10,fontSize:12,color:'var(--ink-2)',display:'inline-block'}}>
                    📉 Portfolio declined ₹16,361 (−0.30%) today vs yesterday
                  </div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,alignContent:'start'}}>
                  {[['Invested','₹39.11L',null],['SIP/mo','₹91K',null],['Tax savable','~₹16,250','var(--gold)']].map(([l,v,c],i)=>(
                    <div key={i} style={{background:'var(--surface-2)',borderRadius:14,padding:18}}>
                      <div style={{fontSize:10.5,textTransform:'uppercase',letterSpacing:'0.14em',color:'var(--ink-3)',fontWeight:500}}>{l}</div>
                      <div style={{fontFamily:'var(--font-serif)',fontSize:28,lineHeight:1,letterSpacing:'-0.02em',margin:'8px 0 4px',color:c||'var(--ink)'}}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{height:140,borderRadius:12,background:'var(--surface-2)',backgroundImage:`url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 140' preserveAspectRatio='none'><path d='M0,120 L80,108 L160,114 L240,86 L320,96 L400,72 L480,80 L560,52 L640,46 L720,30 L800,18' fill='none' stroke='%23b4f230' stroke-width='2.5'/><path d='M0,120 L80,108 L160,114 L240,86 L320,96 L400,72 L480,80 L560,52 L640,46 L720,30 L800,18 L800,140 L0,140 Z' fill='url(%23g)' opacity='0.3'/><defs><linearGradient id='g' x1='0' x2='0' y1='0' y2='1'><stop offset='0' stop-color='%23b4f230'/><stop offset='1' stop-color='%23b4f230' stop-opacity='0'/></linearGradient></defs></svg>")`,backgroundSize:'100% 100%',backgroundRepeat:'no-repeat'}}/>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{padding:'100px 0'}}>
        <div style={{maxWidth:1240,margin:'0 auto',padding:'0 28px'}}>
          <div style={{fontSize:10.5,textTransform:'uppercase',letterSpacing:'0.14em',color:'var(--ink-3)',fontWeight:500}}>Why FolioIQ</div>
          <h2 style={{fontFamily:'var(--font-serif)',fontSize:'clamp(38px,5vw,64px)',lineHeight:.98,letterSpacing:'-0.03em',margin:'14px 0 16px',fontWeight:400,maxWidth:720,color:'var(--ink)'}}>
            Built for India. Backed by intelligence.
          </h2>
          <p style={{color:'var(--ink-2)',fontSize:17,maxWidth:580,lineHeight:1.55,margin:0}}>
            Six tools that turn a confusing spreadsheet of holdings into a clear, actionable plan.
          </p>
          <div className="feat-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginTop:56}}>
            {[
              {icon:'✦',title:'AI Insights tuned to your money',body:'Folio AI watches your 8 funds 24/7. It surfaces drift, concentration, and tax moves before they cost you.',lime:true},
              {icon:'◈',title:'Tax-loss harvesting',body:'LTCG up to ₹1.25 L per year is tax-free in India. We auto-identify lots, sell-and-rebuy to reset cost basis.'},
              {icon:'⇄',title:'Smart rebalance',body:'When your allocation drifts past tolerance, AI proposes the smallest set of trades — accounting for tax and lock-ins.'},
              {icon:'↗',title:'Real returns, after tax',body:'XIRR. CAGR. Sharpe. Drawdown. After-tax IRR with LTCG factored in. The honest math, not the brochure.'},
              {icon:'◎',title:'Goal-based planning',body:"Tie every rupee to retirement, a home, your kid's college. Folio AI tells you when each goal is on track."},
              {icon:'⊘',title:'Private by default',body:'Your CAS parses in your browser. We never see your password, OTP, or PAN. Read-only by design.'},
            ].map((f,i)=>(
              <div key={i} className="feat-card" style={{padding:28,borderRadius:20,background:f.lime?'linear-gradient(135deg,var(--brand-soft),var(--surface))':'var(--surface)',border:f.lime?'1px solid color-mix(in oklab,var(--brand) 25%,transparent)':'1px solid var(--border)',position:'relative',overflow:'hidden'}}>
                <div style={{width:44,height:44,borderRadius:12,background:f.lime?'var(--brand)':'color-mix(in oklab,var(--brand) 14%,var(--surface))',color:f.lime?'var(--bg-deep)':'var(--brand)',display:'inline-flex',alignItems:'center',justifyContent:'center',marginBottom:20,fontSize:20}}>{f.icon}</div>
                <h3 style={{fontFamily:'var(--font-serif)',fontSize:24,lineHeight:1.1,letterSpacing:'-0.02em',margin:'0 0 10px',fontWeight:400,color:'var(--ink)'}}>{f.title}</h3>
                <p style={{color:'var(--ink-2)',fontSize:13.5,lineHeight:1.6,margin:0}}>{f.body}</p>
              </div>
            ))}
          </div>
          {/* Stats */}
          <div className="stats-grid" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',borderRadius:24,background:'var(--surface)',border:'1px solid var(--border)',overflow:'hidden',marginTop:56}}>
            {[['63+','Funds covered',true],['1,840','MFs in our universe',false],['₹14.2L','Avg tax saved per user / yr',false],['94','Average portfolio health',false]].map(([v,l,b],i,a)=>(
              <div key={i} style={{padding:'36px 32px',borderRight:i<a.length-1?'1px solid var(--border)':'none'}}>
                <div style={{fontFamily:'var(--font-serif)',fontSize:56,lineHeight:1,letterSpacing:'-0.03em',marginBottom:8,color:b?'var(--brand)':'var(--ink)'}}>{v}</div>
                <div style={{fontSize:13,color:'var(--ink-2)'}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{padding:'100px 0',background:'var(--bg-deep)',borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)'}}>
        <div style={{maxWidth:1240,margin:'0 auto',padding:'0 28px'}}>
          <div style={{fontSize:10.5,textTransform:'uppercase',letterSpacing:'0.14em',color:'var(--ink-3)',fontWeight:500}}>How it works</div>
          <h2 style={{fontFamily:'var(--font-serif)',fontSize:'clamp(38px,5vw,64px)',lineHeight:.98,letterSpacing:'-0.03em',margin:'14px 0 0',fontWeight:400,color:'var(--ink)'}}>
            From CAS to clarity in <em style={{fontStyle:'italic',color:'var(--brand)'}}>30 seconds</em>.
          </h2>
          <div className="steps-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:28,marginTop:56}}>
            {[
              {n:'01',title:'Drop your CAS PDF',body:'Request a Consolidated Account Statement from CAMS or KFintech — both free, both arrive in your inbox in minutes. Upload here.'},
              {n:'02',title:'We parse 100% of it',body:'Every transaction, holding, SIP, and dividend across every AMC — in your browser. We never store passwords or OTPs.'},
              {n:'03',title:'Get your dashboard',body:'Health score, drift, tax to save, rebalance plan, goal progress. All in one view. Ask Folio AI any question, anytime.'},
            ].map((s,i)=>(
              <div key={i} style={{padding:'28px 0'}}>
                <div style={{fontFamily:'var(--font-serif)',fontSize:80,lineHeight:.9,letterSpacing:'-0.04em',color:'var(--brand)',opacity:.95,marginBottom:12}}>{s.n}</div>
                <h3 style={{fontFamily:'var(--font-serif)',fontSize:28,margin:'0 0 12px',fontWeight:400,lineHeight:1.1,color:'var(--ink)'}}>{s.title}</h3>
                <p style={{color:'var(--ink-2)',fontSize:14,lineHeight:1.6,margin:0}}>{s.body}</p>
              </div>
            ))}
          </div>
          <div style={{display:'flex',gap:36,flexWrap:'wrap',justifyContent:'center',alignItems:'center',marginTop:40,padding:28,background:'var(--surface)',border:'1px solid var(--border)',borderRadius:20}}>
            <div style={{fontSize:10.5,textTransform:'uppercase',letterSpacing:'0.14em',color:'var(--ink-3)',fontWeight:500,marginRight:12}}>Connects with</div>
            {[['CA','CAMS','#0d4a7d'],['KF','KFintech','#c89a3a'],['Z','Zerodha Coin','#387ed1'],['G','Groww','#00d09c'],['IM','INDmoney','#ff5a1f'],['K','Kuvera','#2952ff'],['NS','NSDL e-CAS','#1f6b50']].map(([logo,name,tone],i)=>(
              <div key={i} className="intg" style={{display:'flex',alignItems:'center',gap:10,fontSize:14,fontWeight:500,color:'var(--ink-3)'}}>
                <span style={{width:32,height:32,borderRadius:9,background:tone,display:'inline-flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:11}}>{logo}</span>
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{padding:'100px 0'}}>
        <div style={{maxWidth:1240,margin:'0 auto',padding:'0 28px'}}>
          <div style={{fontSize:10.5,textTransform:'uppercase',letterSpacing:'0.14em',color:'var(--ink-3)',fontWeight:500}}>Believed by 24K+ investors</div>
          <h2 style={{fontFamily:'var(--font-serif)',fontSize:'clamp(38px,5vw,64px)',lineHeight:.98,letterSpacing:'-0.03em',margin:'14px 0 0',fontWeight:400,maxWidth:720,color:'var(--ink)'}}>
            The clarity Indian investors waited for.
          </h2>
          <div className="testi-grid" style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:20,marginTop:56}}>
            {[
              {text:'"Found ₹38K in tax savings in my first session. The harvest plan was four clicks. My CA missed it for three years."',name:'Priya Raghavan',role:'Senior PM · Bengaluru',av:'PR',grad:'linear-gradient(135deg,#ff3d8b,#8c5cff)'},
              {text:'"I had 11 funds across 4 apps. FolioIQ pulled them into one view in under a minute. The rebalance suggestion alone is worth it."',name:'Vikram Kapoor',role:'Doctor · Mumbai',av:'VK',grad:'linear-gradient(135deg,#38e5ff,#0aa7c2)'},
            ].map((q,i)=>(
              <div key={i} style={{padding:32,borderRadius:20,background:'var(--surface)',border:'1px solid var(--border)'}}>
                <div style={{fontFamily:'var(--font-serif)',fontSize:24,lineHeight:1.3,letterSpacing:'-0.01em',marginBottom:24,color:'var(--ink)'}}>{q.text}</div>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div style={{width:42,height:42,borderRadius:12,background:q.grad,color:'white',fontWeight:700,fontSize:13,display:'flex',alignItems:'center',justifyContent:'center'}}>{q.av}</div>
                  <div>
                    <div style={{fontSize:14,fontWeight:600,color:'var(--ink)'}}>{q.name}</div>
                    <div style={{fontSize:12,color:'var(--ink-3)',marginTop:2}}>{q.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{padding:'100px 0',background:'var(--bg-deep)',borderTop:'1px solid var(--border)'}}>
        <div style={{maxWidth:1240,margin:'0 auto',padding:'0 28px'}}>
          <div style={{fontSize:10.5,textTransform:'uppercase',letterSpacing:'0.14em',color:'var(--ink-3)',fontWeight:500}}>Pricing</div>
          <h2 style={{fontFamily:'var(--font-serif)',fontSize:'clamp(38px,5vw,64px)',lineHeight:.98,letterSpacing:'-0.03em',margin:'14px 0 16px',fontWeight:400,color:'var(--ink)'}}>Simple pricing. No surprises.</h2>
          <p style={{color:'var(--ink-2)',fontSize:17,marginBottom:56}}>Start free. Upgrade when you're ready. Cancel anytime.</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:20,maxWidth:860,margin:'0 auto'}}>
            {[
              {name:'Individual',price:199,annual:'₹1,990/yr · save 2 months',highlight:false,features:['Full dashboard & AI insights','Unlimited CAS uploads','Tax-loss harvesting','Smart rebalance plans','Goal planner','AI chat (50 queries/mo)']},
              {name:'Family',price:349,annual:'₹3,490/yr · save 2 months',highlight:true,features:['Everything in Individual','Up to 5 family members','Consolidated family view','AI chat (unlimited)','Priority support','Early access to new features']},
            ].map((plan,i)=>(
              <div key={i} style={{padding:36,borderRadius:24,position:'relative',overflow:'hidden',background:plan.highlight?'color-mix(in oklab,var(--brand) 6%,var(--surface))':'var(--surface)',border:plan.highlight?'1.5px solid var(--brand)':'1px solid var(--border)'}}>
                {plan.highlight&&<><div style={{position:'absolute',top:-40,right:-40,width:160,height:160,borderRadius:'50%',background:'radial-gradient(circle,color-mix(in oklab,var(--brand) 20%,transparent),transparent 70%)'}}/><span style={{position:'absolute',top:18,right:18,padding:'4px 10px',borderRadius:999,background:'var(--brand)',color:'var(--bg-deep)',fontSize:10,fontWeight:700,letterSpacing:'0.08em'}}>MOST POPULAR</span></>}
                <div style={{position:'relative'}}>
                  <div style={{fontSize:10.5,textTransform:'uppercase',letterSpacing:'0.14em',color:'var(--ink-3)',fontWeight:500,marginBottom:12}}>{plan.name}</div>
                  <div style={{display:'flex',alignItems:'baseline',gap:6,marginBottom:4}}>
                    <span style={{fontFamily:'var(--font-serif)',fontSize:56,lineHeight:1,letterSpacing:'-0.03em',color:'var(--ink)'}}>₹{plan.price}</span>
                    <span style={{color:'var(--ink-3)',fontSize:13}}>per month</span>
                  </div>
                  <div style={{color:'var(--ink-3)',fontSize:12,marginBottom:28}}>{plan.annual}</div>
                  <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:28}}>
                    {plan.features.map((f,j)=>(
                      <div key={j} style={{display:'flex',alignItems:'center',gap:10,fontSize:14}}>
                        <span style={{color:'var(--up)',fontSize:16}}>✓</span>
                        <span style={{color:'var(--ink-2)'}}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/auth" style={{display:'flex',alignItems:'center',justifyContent:'center',width:'100%',padding:'15px 0',borderRadius:999,background:plan.highlight?'var(--brand)':'var(--ink)',color:'var(--bg-deep)',fontSize:14,fontWeight:600,textDecoration:'none'}}>Start free trial</Link>
                  <p style={{textAlign:'center',fontSize:11.5,color:'var(--ink-3)',marginTop:10}}>14-day free trial · No card required</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{padding:'0 28px 80px'}}>
        <div className="cta-box" style={{maxWidth:1240,margin:'80px auto 0',padding:'80px 60px',borderRadius:32,textAlign:'center',background:'linear-gradient(135deg,var(--surface),color-mix(in oklab,var(--brand) 12%,var(--surface)))',border:'1px solid var(--border)',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',right:-200,top:-200,width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle,color-mix(in oklab,var(--brand) 20%,transparent),transparent 70%)',filter:'blur(40px)'}}/>
          <div style={{position:'relative'}}>
            <h2 style={{fontFamily:'var(--font-serif)',fontSize:'clamp(48px,6vw,88px)',lineHeight:.95,letterSpacing:'-0.03em',margin:'0 0 20px',fontWeight:400,color:'var(--ink)'}}>
              Money, finally <em style={{fontStyle:'italic',color:'var(--brand)'}}>working.</em>
            </h2>
            <p style={{color:'var(--ink-2)',fontSize:17,marginBottom:36}}>Free forever. Read-only. Two minutes from CAS to clarity.</p>
            <Link href="/auth" style={{padding:'18px 28px',borderRadius:999,fontSize:15,fontWeight:600,background:'var(--ink)',color:'var(--bg-deep)',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:8}}>
              Analyze my portfolio — free <span style={{fontSize:16}}>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{borderTop:'1px solid var(--border)',padding:'60px 0 32px'}}>
        <div style={{maxWidth:1240,margin:'0 auto',padding:'0 28px'}}>
          <div className="footer-cols" style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:40,marginBottom:48}}>
            <div>
              <Link href="/" style={{display:'flex',alignItems:'center',gap:10,fontSize:18,fontWeight:700,letterSpacing:'-0.02em',textDecoration:'none',color:'var(--ink)',marginBottom:14}}>
                <span style={{width:36,height:36,borderRadius:11,background:'var(--brand)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 0 1px var(--brand)'}}>
                  <span style={{fontFamily:'var(--font-serif)',fontSize:22,color:'var(--bg-deep)',fontStyle:'italic',lineHeight:1}}>ƒ</span>
                </span>
                FolioIQ
              </Link>
              <div style={{fontSize:13,color:'var(--ink-2)',lineHeight:1.6,maxWidth:280}}>India's smartest mutual fund portfolio analyzer. Built in Bengaluru, hosted in India.</div>
            </div>
            {[
              {title:'Product',links:[['Dashboard','/dashboard'],['Upload CAS','/upload'],['AI Insights','/intelligence'],['Tax Harvest','/capital-gains'],['SIP Calculator','/calculator'],['Fund Screener','/screener']]},
              {title:'Company',links:[['About','#'],['Blog','#'],['Press kit','#'],['Careers','#'],['Contact','#']]},
              {title:'Legal',links:[['Terms','#'],['Privacy','#'],['Disclosures','#'],['Data security','#']]},
            ].map((col,i)=>(
              <div key={i}>
                <h4 style={{fontSize:11,textTransform:'uppercase',letterSpacing:'0.14em',color:'var(--ink-3)',fontWeight:500,margin:'0 0 16px'}}>{col.title}</h4>
                {col.links.map(([label,href])=>(
                  href.startsWith('/')
                    ?<Link key={label} href={href} className="flink" style={{color:'var(--ink-2)'}}>{label}</Link>
                    :<a key={label} href={href} className="flink" style={{color:'var(--ink-2)'}}>{label}</a>
                ))}
              </div>
            ))}
          </div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:28,borderTop:'1px solid var(--border)',fontSize:12,color:'var(--ink-3)',flexWrap:'wrap',gap:16}}>
            <div>© 2026 FolioIQ Technologies Pvt. Ltd. · Made in 🇮🇳</div>
            <div style={{display:'flex',gap:18}}>
              {['Twitter','LinkedIn','Instagram'].map(s=><a key={s} href="#" style={{color:'var(--ink-3)',textDecoration:'none'}}>{s}</a>)}
            </div>
          </div>
          <div style={{maxWidth:520,fontSize:11,lineHeight:1.55,color:'var(--ink-3)',marginTop:16}}>
            FolioIQ is a portfolio analysis platform. We are not a SEBI-registered investment advisor. Information shown is for educational purposes only and does not constitute investment advice. Mutual fund investments are subject to market risks; please read all scheme-related documents carefully.
          </div>
        </div>
      </footer>
    </>
  );
}
