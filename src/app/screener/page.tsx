'use client';
import { useState } from 'react';
import AppLayout from '@/components/AppLayout';

const fmtPct=(n:number,d=1)=>(n>=0?'+':'')+n.toFixed(d)+'%';
const FUNDS=[
  {id:'qnte',name:'Quant Small Cap Fund',cat:'Small Cap',amc:'Quant',logo:'QT',tone:'#c1392b',rating:5,aum:21340,ret1:38.4,ret3:42.1,ret5:35.2,exp:0.62,risk:'Very High'},
  {id:'nipi',name:'Nippon India Large Cap',cat:'Large Cap',amc:'Nippon',logo:'NP',tone:'#0d4a7d',rating:5,aum:24180,ret1:24.1,ret3:21.4,ret5:18.2,exp:0.74,risk:'Moderate'},
  {id:'hdmi',name:'HDFC Mid-Cap Opportunities',cat:'Mid Cap',amc:'HDFC',logo:'HD',tone:'#2952ff',rating:5,aum:62210,ret1:32.8,ret3:28.1,ret5:24.6,exp:0.81,risk:'High'},
  {id:'mela',name:'Motilal Oswal Large & Midcap',cat:'L&M',amc:'Motilal',logo:'MO',tone:'#7a3ec1',rating:4,aum:6420,ret1:34.2,ret3:25.7,ret5:21.4,exp:0.69,risk:'High'},
  {id:'kohy',name:'Kotak Hybrid Equity',cat:'Hybrid',amc:'Kotak',logo:'KO',tone:'#7a3ec1',rating:4,aum:5810,ret1:18.1,ret3:14.8,ret5:13.1,exp:0.51,risk:'Moderate'},
  {id:'tata',name:'Tata Digital India',cat:'Sectoral',amc:'Tata',logo:'TT',tone:'#1f6b50',rating:5,aum:11420,ret1:42.6,ret3:24.8,ret5:28.9,exp:0.32,risk:'Very High'},
  {id:'inde',name:'Bandhan Nifty 50 Index',cat:'Index',amc:'Bandhan',logo:'BN',tone:'#1f8a5b',rating:4,aum:1240,ret1:21.4,ret3:18.4,ret5:15.2,exp:0.10,risk:'Moderate'},
];
function Logo({logo,tone,size=36}:{logo:string;tone:string;size?:number}){
  return <div style={{width:size,height:size,borderRadius:size*.3,background:tone,display:'inline-flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:size*.33,color:'white',flexShrink:0}}>{logo}</div>;
}
function Stars({n}:{n:number}){return <span style={{color:'var(--accent)',letterSpacing:1}}>{'★'.repeat(n)}<span style={{color:'var(--ink-4)'}}>{'★'.repeat(5-n)}</span></span>;}

export default function ScreenerPage(){
  const [filters,setFilters]=useState({category:'all',rating:0,expense:1.5,aum:0,risk:'all',return3y:0});
  const setF=(k:string,v:any)=>setFilters(f=>({...f,[k]:v}));
  const screened=FUNDS.filter(f=>
    (filters.category==='all'||f.cat===filters.category)&&
    f.rating>=filters.rating&&f.exp<=filters.expense&&
    f.aum>=filters.aum*1000&&(filters.risk==='all'||f.risk===filters.risk)&&
    f.ret3>=filters.return3y
  );
  return(
    <AppLayout>
      <div style={{padding:'28px 40px 80px'}}>
        <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:36,gap:20,flexWrap:'wrap'}}>
          <div>
            <div style={{fontSize:10.5,textTransform:'uppercase',letterSpacing:'0.14em',color:'var(--ink-3)',fontWeight:500,marginBottom:10}}>▼ Screener</div>
            <h1 style={{fontFamily:'var(--font-serif)',fontSize:'clamp(40px,5.5vw,80px)',lineHeight:.98,letterSpacing:'-0.03em',fontWeight:400,margin:0,color:'var(--ink)'}}>Find your next fund.</h1>
            <div style={{marginTop:14,fontSize:15,color:'var(--ink-2)',lineHeight:1.55,maxWidth:600}}>Stack filters across 1,840 mutual funds in India. Returns, expense ratio, AUM, manager tenure, factor exposure — all in real time.</div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button style={{padding:'9px 14px',borderRadius:999,fontSize:13,border:'1px solid var(--border)',background:'var(--surface-2)',color:'var(--ink)',cursor:'pointer'}}>↓ Export</button>
            <button style={{padding:'9px 14px',borderRadius:999,fontSize:13,border:'none',background:'var(--brand)',color:'var(--bg-deep)',fontWeight:600,cursor:'pointer'}}>✦ AI screen</button>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'300px 1fr',gap:24}}>
          {/* Filters */}
          <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:20,padding:24,alignSelf:'flex-start',position:'sticky',top:120}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
              <div style={{fontSize:15,fontWeight:600,color:'var(--ink)'}}>Filters</div>
              <button onClick={()=>setFilters({category:'all',rating:0,expense:1.5,aum:0,risk:'all',return3y:0})} style={{padding:'5px 10px',borderRadius:8,fontSize:12,border:'none',background:'transparent',color:'var(--ink-3)',cursor:'pointer'}}>Reset</button>
            </div>
            {/* Category */}
            <div style={{marginBottom:22}}>
              <div style={{fontSize:10.5,textTransform:'uppercase',letterSpacing:'0.14em',color:'var(--ink-3)',fontWeight:500,marginBottom:10}}>Category</div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {['all','Large Cap','Mid Cap','Small Cap','Index','L&M','Hybrid','Sectoral','Intl'].map(c=>(
                  <button key={c} onClick={()=>setF('category',c)} style={{padding:'5px 10px',borderRadius:999,fontSize:11,border:'1px solid var(--border)',background:filters.category===c?'var(--brand)':'var(--surface-2)',color:filters.category===c?'var(--bg-deep)':'var(--ink-2)',cursor:'pointer'}}>{c==='all'?'All':c}</button>
                ))}
              </div>
            </div>
            {/* Rating */}
            <div style={{marginBottom:22}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                <span style={{fontSize:10.5,textTransform:'uppercase',letterSpacing:'0.14em',color:'var(--ink-3)',fontWeight:500}}>Min rating</span>
                <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--ink)'}}>{filters.rating}+ stars</span>
              </div>
              <div style={{display:'flex',gap:6}}>
                {[0,3,4,5].map(r=>(
                  <button key={r} onClick={()=>setF('rating',r)} style={{flex:1,padding:'7px',borderRadius:8,fontSize:11,border:'1px solid var(--border)',background:filters.rating===r?'var(--brand-soft)':'var(--surface-2)',color:filters.rating===r?'var(--brand)':'var(--ink-2)',cursor:'pointer',textAlign:'center'}}>{r===0?'Any':r+'★'}</button>
                ))}
              </div>
            </div>
            {/* Expense */}
            <div style={{marginBottom:22}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                <span style={{fontSize:10.5,textTransform:'uppercase',letterSpacing:'0.14em',color:'var(--ink-3)',fontWeight:500}}>Max expense ratio</span>
                <span style={{fontFamily:'var(--font-mono)',fontSize:11,fontWeight:600,color:'var(--ink)'}}>{filters.expense.toFixed(2)}%</span>
              </div>
              <input type="range" min="0.1" max="2.5" step="0.05" value={filters.expense} onChange={e=>setF('expense',Number(e.target.value))} style={{width:'100%',accentColor:'var(--brand)'}}/>
            </div>
            {/* AUM */}
            <div style={{marginBottom:22}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                <span style={{fontSize:10.5,textTransform:'uppercase',letterSpacing:'0.14em',color:'var(--ink-3)',fontWeight:500}}>Min AUM</span>
                <span style={{fontFamily:'var(--font-mono)',fontSize:11,fontWeight:600,color:'var(--ink)'}}>₹{filters.aum.toFixed(0)}K Cr</span>
              </div>
              <input type="range" min="0" max="50" step="1" value={filters.aum} onChange={e=>setF('aum',Number(e.target.value))} style={{width:'100%',accentColor:'var(--brand)'}}/>
            </div>
            {/* Risk */}
            <div style={{marginBottom:22}}>
              <div style={{fontSize:10.5,textTransform:'uppercase',letterSpacing:'0.14em',color:'var(--ink-3)',fontWeight:500,marginBottom:10}}>Risk</div>
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                {['all','Moderate','High','Very High'].map(r=>(
                  <button key={r} onClick={()=>setF('risk',r)} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',borderRadius:8,fontSize:12,border:`1px solid ${filters.risk===r?'var(--border-strong)':'transparent'}`,background:filters.risk===r?'var(--surface-3)':'transparent',color:filters.risk===r?'var(--ink)':'var(--ink-2)',cursor:'pointer',textAlign:'left'}}>
                    <span style={{width:14,height:14,borderRadius:99,border:'1.5px solid var(--ink-3)',display:'inline-flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      {filters.risk===r&&<span style={{width:7,height:7,borderRadius:99,background:'var(--brand)'}}/>}
                    </span>
                    {r==='all'?'Any risk':r}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Results */}
          <div>
            <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,padding:'16px 24px',marginBottom:14,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div>
                <div style={{fontSize:14,fontWeight:600,color:'var(--ink)'}}>{screened.length} funds match</div>
                <div style={{fontSize:11.5,color:'var(--ink-3)',marginTop:2}}>out of 1,840 in our universe</div>
              </div>
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <span style={{fontSize:10.5,textTransform:'uppercase',letterSpacing:'0.12em',color:'var(--ink-3)',fontWeight:500}}>Sort by</span>
                <select style={{padding:'7px 12px',borderRadius:8,border:'1px solid var(--border)',background:'var(--surface-2)',color:'var(--ink)',fontSize:12,cursor:'pointer'}}>
                  <option>3Y returns</option><option>5Y returns</option><option>AUM</option><option>Expense (low)</option><option>Rating</option>
                </select>
              </div>
            </div>
            {screened.length===0?(
              <div style={{padding:'48px 24px',textAlign:'center',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:20}}>
                <div style={{fontSize:15,fontWeight:500,marginBottom:6,color:'var(--ink)'}}>No funds match</div>
                <div style={{fontSize:13,color:'var(--ink-3)'}}>Loosen a filter or two — try lower rating or higher expense ratio.</div>
              </div>
            ):(
              <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:20,overflow:'hidden'}}>
                <table style={{width:'100%',borderCollapse:'separate',borderSpacing:0}}>
                  <thead>
                    <tr>
                      {['Fund','Rating','1Y','3Y','5Y','Expense','AUM','Risk',''].map((h,i)=>(
                        <th key={i} style={{padding:'14px 18px',fontSize:10.5,fontWeight:500,textTransform:'uppercase',letterSpacing:'0.12em',color:'var(--ink-3)',textAlign:i>1?'right':'left',borderBottom:'1px solid var(--border)',background:'var(--surface-2)',whiteSpace:'nowrap'}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {screened.map((f,i)=>(
                      <tr key={f.id}>
                        <td style={{padding:'16px 18px',borderBottom:i<screened.length-1?'1px solid var(--border)':'none'}}>
                          <div style={{display:'flex',alignItems:'center',gap:12}}>
                            <Logo logo={f.logo} tone={f.tone}/>
                            <div>
                              <div style={{fontWeight:600,fontSize:13.5,color:'var(--ink)'}}>{f.name}</div>
                              <div style={{fontSize:11,color:'var(--ink-3)',marginTop:2}}>{f.cat} · {f.amc}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{padding:'16px 18px',borderBottom:i<screened.length-1?'1px solid var(--border)':'none'}}><Stars n={f.rating}/></td>
                        <td style={{padding:'16px 18px',textAlign:'right',borderBottom:i<screened.length-1?'1px solid var(--border)':'none',fontFamily:'var(--font-mono)',fontSize:12,color:'var(--up)',fontWeight:500}}>{fmtPct(f.ret1)}</td>
                        <td style={{padding:'16px 18px',textAlign:'right',borderBottom:i<screened.length-1?'1px solid var(--border)':'none',fontFamily:'var(--font-mono)',fontSize:12,color:'var(--up)',fontWeight:500}}>{fmtPct(f.ret3)}</td>
                        <td style={{padding:'16px 18px',textAlign:'right',borderBottom:i<screened.length-1?'1px solid var(--border)':'none',fontFamily:'var(--font-mono)',fontSize:12,color:'var(--ink)'}}>{fmtPct(f.ret5)}</td>
                        <td style={{padding:'16px 18px',textAlign:'right',borderBottom:i<screened.length-1?'1px solid var(--border)':'none',fontFamily:'var(--font-mono)',fontSize:12,color:'var(--ink)'}}>{f.exp.toFixed(2)}%</td>
                        <td style={{padding:'16px 18px',textAlign:'right',borderBottom:i<screened.length-1?'1px solid var(--border)':'none',fontFamily:'var(--font-mono)',fontSize:12,color:'var(--ink)'}}>₹{(f.aum/1000).toFixed(1)}K Cr</td>
                        <td style={{padding:'16px 18px',borderBottom:i<screened.length-1?'1px solid var(--border)':'none'}}>
                          <span style={{display:'inline-flex',padding:'4px 10px',borderRadius:999,fontSize:10,border:'1px solid var(--border)',background:'var(--surface-2)',color:'var(--ink-2)'}}>{f.risk}</span>
                        </td>
                        <td style={{padding:'16px 18px',borderBottom:i<screened.length-1?'1px solid var(--border)':'none'}}>
                          <div style={{display:'flex',gap:6,justifyContent:'flex-end'}}>
                            <button style={{padding:6,borderRadius:8,border:'none',background:'transparent',color:'var(--ink-3)',cursor:'pointer',fontSize:14}}>👁</button>
                            <button style={{padding:'5px 10px',borderRadius:8,fontSize:11,border:'none',background:'var(--brand)',color:'var(--bg-deep)',fontWeight:600,cursor:'pointer'}}>Invest</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
