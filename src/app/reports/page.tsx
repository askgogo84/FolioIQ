'use client';
import { useState } from 'react';
import AppLayout from '@/components/AppLayout';

const fmtINR=(n:number,o:any={})=>{if(!n&&n!==0)return'—';const a=Math.abs(n);const s=n<0?'−':'';if(o.short){if(a>=1e7)return`${s}₹${(a/1e7).toFixed(2)} Cr`;if(a>=1e5)return`${s}₹${(a/1e5).toFixed(2)} L`;if(a>=1e3)return`${s}₹${(a/1e3).toFixed(1)}K`;return`${s}₹${a.toFixed(0)}`;}const p=a.toFixed(0);let l=p.slice(-3),r=p.slice(0,-3);if(r)r=r.replace(/\B(?=(\d{2})+(?!\d))/g,',');return`${s}₹${r?r+','+l:l}`;};

export default function ReportsPage(){
  const [year,setYear]=useState('FY 25-26');
  const s=(t:string)=>({padding:'28px 40px 80px'} as any);
  return(
    <AppLayout>
      <div style={{padding:'28px 40px 80px'}}>
        {/* Header */}
        <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:36,gap:20,flexWrap:'wrap'}}>
          <div>
            <div style={{fontSize:10.5,textTransform:'uppercase',letterSpacing:'0.14em',color:'var(--ink-3)',fontWeight:500,marginBottom:10}}>Reports & Tax</div>
            <h1 style={{fontFamily:'var(--font-serif)',fontSize:'clamp(32px,4.5vw,72px)',lineHeight:.98,letterSpacing:'-0.03em',fontWeight:400,margin:0,color:'var(--ink)'}}>
              Statements, capital gains,<br/>and IT-ready filings
            </h1>
            <div style={{marginTop:14,fontSize:15,color:'var(--ink-2)',lineHeight:1.55,maxWidth:600}}>Download official statements, see realised gains by year, and prep for tax season in two clicks.</div>
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <select value={year} onChange={e=>setYear(e.target.value)} style={{padding:'9px 14px',borderRadius:999,fontSize:13,border:'1px solid var(--border)',background:'var(--surface-2)',color:'var(--ink)',cursor:'pointer'}}>
              <option>FY 25-26</option><option>FY 24-25</option><option>FY 23-24</option>
            </select>
            <button style={{padding:'9px 18px',borderRadius:999,fontSize:13,fontWeight:600,border:'none',background:'var(--brand)',color:'var(--bg-deep)',cursor:'pointer'}}>↓ Download all</button>
          </div>
        </div>

        {/* Tax snapshot + 80C grid */}
        <div style={{display:'grid',gridTemplateColumns:'1.4fr 1fr',gap:20,marginBottom:24}}>
          {/* Tax snapshot */}
          <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:20,padding:24}}>
            <div style={{fontSize:10.5,textTransform:'uppercase',letterSpacing:'0.14em',color:'var(--ink-3)',fontWeight:500,marginBottom:6}}>Tax snapshot · FY 25-26</div>
            <h2 style={{fontFamily:'var(--font-serif)',fontSize:28,letterSpacing:'-0.02em',fontWeight:400,margin:'0 0 20px',color:'var(--ink)'}}>Estimated capital gains tax</h2>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:24}}>
              {/* LTCG */}
              <div>
                <div style={{fontSize:10.5,textTransform:'uppercase',letterSpacing:'0.12em',color:'var(--ink-3)',fontWeight:500,marginBottom:6}}>LTCG (held &gt; 1yr)</div>
                <div style={{fontFamily:'var(--font-serif)',fontSize:30,letterSpacing:'-0.02em',color:'var(--ink)'}}>₹2.18 L</div>
                <div style={{fontSize:11,color:'var(--ink-3)',marginTop:4}}>realised gain</div>
                <div style={{fontSize:12,color:'var(--ink-2)',marginTop:10,fontFamily:'var(--font-mono)'}}><span style={{color:'var(--ink-3)'}}>Exempt:</span> ₹1,25,000</div>
                <div style={{fontSize:12,color:'var(--ink-2)',fontFamily:'var(--font-mono)'}}><span style={{color:'var(--ink-3)'}}>Taxable:</span> ₹93,400 @ 10%</div>
                <div style={{marginTop:10,padding:'8px 12px',background:'var(--up-soft)',color:'var(--up)',borderRadius:8,fontSize:12,fontWeight:500}}>Tax due: ₹9,340</div>
              </div>
              {/* STCG */}
              <div>
                <div style={{fontSize:10.5,textTransform:'uppercase',letterSpacing:'0.12em',color:'var(--ink-3)',fontWeight:500,marginBottom:6}}>STCG (held &lt; 1yr)</div>
                <div style={{fontFamily:'var(--font-serif)',fontSize:30,letterSpacing:'-0.02em',color:'var(--ink)'}}>₹42.1K</div>
                <div style={{fontSize:11,color:'var(--ink-3)',marginTop:4}}>realised gain</div>
                <div style={{fontSize:12,color:'var(--ink-2)',marginTop:10,fontFamily:'var(--font-mono)'}}><span style={{color:'var(--ink-3)'}}>Rate:</span> 15%</div>
                <div style={{fontSize:12,color:'var(--ink-2)',fontFamily:'var(--font-mono)'}}><span style={{color:'var(--ink-3)'}}>Source:</span> 2 redemptions</div>
                <div style={{marginTop:10,padding:'8px 12px',background:'var(--down-soft)',color:'var(--down)',borderRadius:8,fontSize:12,fontWeight:500}}>Tax due: ₹6,315</div>
              </div>
              {/* Total */}
              <div>
                <div style={{fontSize:10.5,textTransform:'uppercase',letterSpacing:'0.12em',color:'var(--ink-3)',fontWeight:500,marginBottom:6}}>Total tax estimate</div>
                <div style={{fontFamily:'var(--font-serif)',fontSize:30,letterSpacing:'-0.02em',color:'var(--ink)'}}>₹15.7K</div>
                <div style={{fontSize:11,color:'var(--ink-3)',marginTop:4}}>before harvesting</div>
                <div style={{fontSize:12,color:'var(--ink-2)',marginTop:10,fontFamily:'var(--font-mono)'}}><span style={{color:'var(--ink-3)'}}>After harvest:</span> <span style={{color:'var(--up)'}}>₹0</span></div>
                <div style={{fontSize:12,color:'var(--ink-2)',fontFamily:'var(--font-mono)'}}><span style={{color:'var(--ink-3)'}}>Savings:</span> <span style={{color:'var(--up)'}}>₹15,655</span></div>
                <button style={{marginTop:10,width:'100%',padding:'8px 12px',borderRadius:8,border:'none',background:'var(--brand)',color:'var(--bg-deep)',fontSize:12,fontWeight:600,cursor:'pointer'}}>✦ Run harvest plan</button>
              </div>
            </div>
          </div>
          {/* 80C tracker */}
          <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:20,padding:24}}>
            <div style={{fontSize:10.5,textTransform:'uppercase',letterSpacing:'0.14em',color:'var(--ink-3)',fontWeight:500,marginBottom:6}}>80C tracker</div>
            <h2 style={{fontFamily:'var(--font-serif)',fontSize:28,letterSpacing:'-0.02em',fontWeight:400,margin:'0 0 8px',color:'var(--ink)'}}>Tax-saving slot</h2>
            <div style={{fontFamily:'var(--font-serif)',fontSize:36,letterSpacing:'-0.02em',color:'var(--ink)'}}>₹98.0K</div>
            <div style={{fontSize:12,color:'var(--ink-3)',marginBottom:14}}>of ₹1,50,000 used</div>
            <div style={{height:10,background:'var(--surface-3)',borderRadius:999,overflow:'hidden',marginBottom:18}}>
              <div style={{width:'65%',height:'100%',background:'var(--accent)',borderRadius:999}}/>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {[['ELSS Mutual Fund','₹60,000'],['PPF','₹30,000'],['Term Insurance','₹8,000']].map(([l,v],i)=>(
                <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'var(--ink-2)'}}>
                  <span>{l}</span><span style={{fontFamily:'var(--font-mono)',color:'var(--ink)'}}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{marginTop:18,padding:'12px 14px',background:'var(--brand-soft)',color:'var(--brand)',borderRadius:10,fontSize:12}}>
              ₹52,000 unused — invest in ELSS to save ~₹15,600 in tax.
            </div>
          </div>
        </div>

        {/* Reports library */}
        <div style={{fontSize:10.5,textTransform:'uppercase',letterSpacing:'0.14em',color:'var(--ink-3)',fontWeight:500,marginBottom:8}}>Statements</div>
        <h2 style={{fontFamily:'var(--font-serif)',fontSize:28,letterSpacing:'-0.02em',fontWeight:400,margin:'0 0 16px',color:'var(--ink)'}}>Reports library</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:24}}>
          {[
            {name:'Account statement',desc:'All transactions, units, NAVs',date:'Updated daily',icon:'📄'},
            {name:'Capital gains report',desc:'LTCG & STCG itemised for IT filing',date:'FY 25-26',icon:'📈'},
            {name:'P&L statement',desc:'Realised and unrealised gains',date:'YTD',icon:'💰'},
            {name:'Form 26AS reconciliation',desc:'Matches AIS / Form 26AS',date:'Quarterly',icon:'🛡'},
            {name:'ELSS lock-in tracker',desc:'When each ELSS unlocks',date:'5 plans',icon:'📅'},
            {name:'Dividend statement',desc:'Dividend received by fund',date:'YTD ₹3,640',icon:'✦'},
          ].map((r,i)=>(
            <div key={i} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,padding:20}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:14}}>
                <div style={{width:40,height:40,borderRadius:11,background:'var(--surface-3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{r.icon}</div>
                <button style={{padding:6,borderRadius:8,border:'none',background:'transparent',color:'var(--ink-3)',cursor:'pointer',fontSize:16}}>↓</button>
              </div>
              <div style={{fontSize:14,fontWeight:500,marginBottom:4,color:'var(--ink)'}}>{r.name}</div>
              <div style={{fontSize:12,color:'var(--ink-3)',marginBottom:14,lineHeight:1.5}}>{r.desc}</div>
              <div style={{fontSize:10.5,textTransform:'uppercase',letterSpacing:'0.12em',color:'var(--ink-3)',fontWeight:500}}>{r.date}</div>
            </div>
          ))}
        </div>

        {/* Realised gains history */}
        <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:20,overflow:'hidden'}}>
          <div style={{padding:'20px 24px',borderBottom:'1px solid var(--border)',background:'var(--surface-2)'}}>
            <div style={{fontSize:10.5,textTransform:'uppercase',letterSpacing:'0.14em',color:'var(--ink-3)',fontWeight:500,marginBottom:4}}>History</div>
            <h3 style={{fontFamily:'var(--font-serif)',fontSize:22,letterSpacing:'-0.02em',fontWeight:400,margin:0,color:'var(--ink)'}}>Realised gains by financial year</h3>
          </div>
          <table style={{width:'100%',borderCollapse:'separate',borderSpacing:0}}>
            <thead>
              <tr>
                {['Financial year','LTCG','STCG','Total gain','Tax paid',''].map((h,i)=>(
                  <th key={i} style={{padding:'14px 18px',fontSize:10.5,fontWeight:500,textTransform:'uppercase',letterSpacing:'0.12em',color:'var(--ink-3)',textAlign:i>0?'right':'left',borderBottom:'1px solid var(--border)',background:'var(--surface-2)'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                {fy:'FY 25-26 (current)',ltcg:218400,stcg:42100,tax:15655},
                {fy:'FY 24-25',ltcg:184200,stcg:0,tax:5920},
                {fy:'FY 23-24',ltcg:92400,stcg:18200,tax:2730},
                {fy:'FY 22-23',ltcg:0,stcg:0,tax:0},
              ].map((r,i,a)=>(
                <tr key={i}>
                  <td style={{padding:'16px 18px',fontWeight:500,fontSize:14,borderBottom:i<a.length-1?'1px solid var(--border)':'none',color:'var(--ink)'}}>{r.fy}</td>
                  <td style={{padding:'16px 18px',textAlign:'right',fontFamily:'var(--font-mono)',fontSize:13,borderBottom:i<a.length-1?'1px solid var(--border)':'none',color:'var(--ink)'}}>{fmtINR(r.ltcg)}</td>
                  <td style={{padding:'16px 18px',textAlign:'right',fontFamily:'var(--font-mono)',fontSize:13,borderBottom:i<a.length-1?'1px solid var(--border)':'none',color:'var(--ink)'}}>{fmtINR(r.stcg)}</td>
                  <td style={{padding:'16px 18px',textAlign:'right',fontFamily:'var(--font-mono)',fontSize:13,fontWeight:500,borderBottom:i<a.length-1?'1px solid var(--border)':'none',color:'var(--ink)'}}>{fmtINR(r.ltcg+r.stcg)}</td>
                  <td style={{padding:'16px 18px',textAlign:'right',fontFamily:'var(--font-mono)',fontSize:13,borderBottom:i<a.length-1?'1px solid var(--border)':'none',color:'var(--ink)'}}>{fmtINR(r.tax)}</td>
                  <td style={{padding:'16px 18px',borderBottom:i<a.length-1?'1px solid var(--border)':'none'}}>
                    <button style={{padding:'5px 12px',borderRadius:8,border:'1px solid var(--border)',background:'transparent',color:'var(--ink-2)',fontSize:12,cursor:'pointer'}}>Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
