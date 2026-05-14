'use client';
import { useState } from 'react';
import AppLayout from '@/components/AppLayout';

const fmtPct=(n:number,d=1)=>(n>=0?'+':'')+n.toFixed(d)+'%';
const CATS=[
  {key:'large',label:'Large Cap',desc:'Stable blue-chips',ret:'14-18%',count:42,tone:'#0f3d2e'},
  {key:'flexi',label:'Flexi Cap',desc:'Adaptive market cap',ret:'16-22%',count:34,tone:'#1f6b50'},
  {key:'mid',label:'Mid Cap',desc:'Growth & risk mix',ret:'18-26%',count:28,tone:'#c89a3a'},
  {key:'small',label:'Small Cap',desc:'High-growth potential',ret:'22-38%',count:31,tone:'#c1392b'},
  {key:'index',label:'Index',desc:'Track market passively',ret:'12-16%',count:18,tone:'#2952ff'},
  {key:'intl',label:'International',desc:'Geographic diversification',ret:'8-20%',count:24,tone:'#7a3ec1'},
];
const FUNDS=[
  {id:'qnte',name:'Quant Small Cap Fund',cat:'Small Cap',amc:'Quant',logo:'QT',tone:'#c1392b',rating:5,aum:21340,ret1:38.4,ret3:42.1,ret5:35.2,exp:0.62,risk:'Very High'},
  {id:'nipi',name:'Nippon India Large Cap',cat:'Large Cap',amc:'Nippon',logo:'NP',tone:'#0d4a7d',rating:5,aum:24180,ret1:24.1,ret3:21.4,ret5:18.2,exp:0.74,risk:'Moderate'},
  {id:'hdmi',name:'HDFC Mid-Cap Opportunities',cat:'Mid Cap',amc:'HDFC',logo:'HD',tone:'#2952ff',rating:5,aum:62210,ret1:32.8,ret3:28.1,ret5:24.6,exp:0.81,risk:'High'},
  {id:'mela',name:'Motilal Oswal Large & Midcap',cat:'L&M',amc:'Motilal',logo:'MO',tone:'#7a3ec1',rating:4,aum:6420,ret1:34.2,ret3:25.7,ret5:21.4,exp:0.69,risk:'High'},
  {id:'tata',name:'Tata Digital India',cat:'Sectoral',amc:'Tata',logo:'TT',tone:'#1f6b50',rating:5,aum:11420,ret1:42.6,ret3:24.8,ret5:28.9,exp:0.32,risk:'Very High'},
  {id:'inde',name:'Bandhan Nifty 50 Index',cat:'Index',amc:'Bandhan',logo:'BN',tone:'#1f8a5b',rating:4,aum:1240,ret1:21.4,ret3:18.4,ret5:15.2,exp:0.10,risk:'Moderate'},
];
function Logo({logo,tone,size=36}:{logo:string;tone:string;size?:number}){
  return <div style={{width:size,height:size,borderRadius:size*.3,background:tone,display:'inline-flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:size*.33,color:'white',flexShrink:0}}>{logo}</div>;
}
function Stars({n}:{n:number}){return <span style={{color:'var(--accent)',letterSpacing:1}}>{'★'.repeat(n)}<span style={{color:'var(--ink-4)'}}>{'★'.repeat(5-n)}</span></span>;}

export default function ExplorePage(){
  const [cat,setCat]=useState('all');
  const [search,setSearch]=useState('');
  const visible=FUNDS.filter(f=>(cat==='all'||f.cat===cat)&&(!search||f.name.toLowerCase().includes(search.toLowerCase())));
  return(
    <AppLayout>
      <div style={{padding:'28px 40px 80px'}}>
        <div style={{marginBottom:36}}>
          <div style={{fontSize:10.5,textTransform:'uppercase',letterSpacing:'0.14em',color:'var(--ink-3)',fontWeight:500,marginBottom:10}}>Explore</div>
          <h1 style={{fontFamily:'var(--font-serif)',fontSize:'clamp(40px,5.5vw,80px)',lineHeight:.98,letterSpacing:'-0.03em',fontWeight:400,margin:0,color:'var(--ink)'}}>Discover funds worth your time</h1>
          <div style={{marginTop:14,fontSize:15,color:'var(--ink-2)',lineHeight:1.55,maxWidth:600}}>Filter 1,840+ mutual funds by category, risk, and historical returns. Add to your watchlist or invest directly.</div>
        </div>
        {/* Search */}
        <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:20,padding:18,marginBottom:24}}>
          <div style={{display:'flex',gap:12,alignItems:'center'}}>
            <div style={{display:'flex',alignItems:'center',gap:10,flex:1,padding:'10px 14px',borderRadius:12,background:'var(--surface-2)',border:'1px solid var(--border)'}}>
              <span style={{color:'var(--ink-3)',fontSize:16}}>🔍</span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Try 'best small cap', 'low expense ratio', 'HDFC Mid Cap'…" style={{flex:1,border:'none',outline:'none',background:'transparent',fontSize:14,color:'var(--ink)'}}/>
            </div>
            <button style={{padding:'10px 16px',borderRadius:12,border:'1px solid var(--border)',background:'var(--surface-2)',color:'var(--ink)',cursor:'pointer',fontSize:13}}>⊞ Filters</button>
            <button style={{padding:'10px 16px',borderRadius:12,border:'none',background:'var(--brand)',color:'var(--bg-deep)',fontWeight:600,cursor:'pointer',fontSize:13}}>✦ AI screen</button>
          </div>
          <div style={{display:'flex',gap:6,marginTop:14,flexWrap:'wrap'}}>
            {['5★ rated','Low expense','Beats benchmark','Tax saver ELSS','Direct plan','New launches'].map(t=>(
              <button key={t} style={{padding:'5px 12px',borderRadius:999,fontSize:12,border:'1px solid var(--border)',background:'var(--surface-2)',color:'var(--ink-2)',cursor:'pointer'}}>{t}</button>
            ))}
          </div>
        </div>
        {/* Category grid */}
        <div style={{fontSize:10.5,textTransform:'uppercase',letterSpacing:'0.14em',color:'var(--ink-3)',fontWeight:500,marginBottom:8}}>Browse by category</div>
        <h2 style={{fontFamily:'var(--font-serif)',fontSize:32,letterSpacing:'-0.02em',fontWeight:400,margin:'0 0 20px',color:'var(--ink)'}}>What kind of fund?</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:32}}>
          {CATS.map(c=>(
            <button key={c.key} onClick={()=>setCat(cat===c.key?'all':c.key)} style={{padding:20,background:'var(--surface)',border:`1px solid ${cat===c.key?'var(--brand)':'var(--border)'}`,borderRadius:20,textAlign:'left',cursor:'pointer',display:'flex',flexDirection:'column',gap:14}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                <div style={{width:40,height:40,borderRadius:12,background:`color-mix(in oklab,${c.tone} 16%,var(--surface))`,color:c.tone,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>◈</div>
                <span style={{padding:'4px 10px',borderRadius:999,fontSize:11,border:'1px solid var(--border)',background:'var(--surface-2)',color:'var(--ink-2)'}}>{c.count} funds</span>
              </div>
              <div>
                <div style={{fontSize:16,fontWeight:500,marginBottom:4,color:'var(--ink)'}}>{c.label}</div>
                <div style={{fontSize:12,color:'var(--ink-3)'}}>{c.desc}</div>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginTop:'auto'}}>
                <div>
                  <div style={{fontSize:10,textTransform:'uppercase',letterSpacing:'0.12em',color:'var(--ink-3)',fontWeight:500,marginBottom:2}}>5-yr CAGR</div>
                  <div style={{fontFamily:'var(--font-mono)',fontSize:14,fontWeight:500,color:'var(--ink)'}}>{c.ret}</div>
                </div>
                <span style={{fontSize:16,color:'var(--ink-3)'}}>→</span>
              </div>
            </button>
          ))}
        </div>
        {/* Fund cards */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <div>
            <div style={{fontSize:10.5,textTransform:'uppercase',letterSpacing:'0.14em',color:'var(--ink-3)',fontWeight:500,marginBottom:4}}>Top picks for you</div>
            <h2 style={{fontFamily:'var(--font-serif)',fontSize:28,letterSpacing:'-0.02em',fontWeight:400,margin:0,color:'var(--ink)'}}>Curated by Folio AI</h2>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:16}}>
          {visible.map(f=>(
            <div key={f.id} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:20,padding:20}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:14}}>
                <div style={{display:'flex',gap:12}}>
                  <Logo logo={f.logo} tone={f.tone} size={44}/>
                  <div>
                    <div style={{fontSize:14.5,fontWeight:500,color:'var(--ink)'}}>{f.name}</div>
                    <div style={{fontSize:11.5,color:'var(--ink-3)',marginTop:2}}>{f.cat} · {f.amc}</div>
                    <div style={{marginTop:6,display:'flex',gap:6,alignItems:'center'}}>
                      <Stars n={f.rating}/>
                      <span style={{fontSize:10.5,color:'var(--ink-3)'}}>· {f.risk} risk</span>
                    </div>
                  </div>
                </div>
                <button style={{padding:6,borderRadius:8,border:'none',background:'transparent',color:'var(--ink-3)',cursor:'pointer',fontSize:14}}>👁</button>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,padding:'14px 0',borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)'}}>
                {[['1Y',f.ret1],['3Y',f.ret3],['5Y',f.ret5]].map(([l,v]:any,i)=>(
                  <div key={i}>
                    <div style={{fontSize:10,textTransform:'uppercase',letterSpacing:'0.12em',color:'var(--ink-3)',fontWeight:500,marginBottom:2}}>{l}</div>
                    <div style={{fontSize:13,fontWeight:500,fontFamily:'var(--font-mono)',color:v>0?'var(--up)':'var(--down)'}}>{fmtPct(v)}</div>
                  </div>
                ))}
                <div>
                  <div style={{fontSize:10,textTransform:'uppercase',letterSpacing:'0.12em',color:'var(--ink-3)',fontWeight:500,marginBottom:2}}>Expense</div>
                  <div style={{fontSize:13,fontWeight:500,fontFamily:'var(--font-mono)',color:'var(--ink)'}}>{f.exp.toFixed(2)}%</div>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:14}}>
                <div>
                  <div style={{fontSize:10.5,color:'var(--ink-3)'}}>AUM</div>
                  <div style={{fontFamily:'var(--font-mono)',fontSize:12,color:'var(--ink)'}}>₹{(f.aum/1000).toFixed(1)}K Cr</div>
                </div>
                <div style={{display:'flex',gap:6}}>
                  <button style={{padding:'6px 12px',borderRadius:8,fontSize:12,border:'1px solid var(--border)',background:'transparent',color:'var(--ink-2)',cursor:'pointer'}}>Watch</button>
                  <button style={{padding:'6px 12px',borderRadius:8,fontSize:12,border:'none',background:'var(--brand)',color:'var(--bg-deep)',fontWeight:600,cursor:'pointer'}}>Invest</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
