'use client';
import { useState } from 'react';
import AppLayout from '@/components/AppLayout';

const fmtINR=(n:number,o:any={})=>{if(!n&&n!==0)return'—';const a=Math.abs(n);const s=n<0?'−':'';if(o.short){if(a>=1e7)return`${s}₹${(a/1e7).toFixed(2)} Cr`;if(a>=1e5)return`${s}₹${(a/1e5).toFixed(2)} L`;if(a>=1e3)return`${s}₹${(a/1e3).toFixed(1)}K`;return`${s}₹${a.toFixed(0)}`;}const p=a.toFixed(0);let l=p.slice(-3),r=p.slice(0,-3);if(r)r=r.replace(/\B(?=(\d{2})+(?!\d))/g,',');return`${s}₹${r?r+','+l:l}`;};

const TX=[
  {date:'2026-05-12',kind:'SIP',fund:'Parag Parikh Flexi Cap',amount:15000,units:191.3,nav:78.42,status:'Completed',logo:'PP',tone:'#0f3d2e'},
  {date:'2026-05-10',kind:'SIP',fund:'Mirae Asset Large Cap',amount:10000,units:96.1,nav:104.10,status:'Completed',logo:'MA',tone:'#c89a3a'},
  {date:'2026-05-08',kind:'Buy',fund:'HDFC Mid-Cap Opportunities',amount:25000,units:175.8,nav:142.20,status:'Completed',logo:'HD',tone:'#2952ff'},
  {date:'2026-05-03',kind:'Dividend',fund:'SBI Bluechip',amount:1820,units:0,nav:88.32,status:'Credited',logo:'SB',tone:'#0d4a7d'},
  {date:'2026-04-22',kind:'Switch',fund:'Axis Bluechip → Axis Small Cap',amount:40000,units:449.9,nav:88.91,status:'Completed',logo:'AX',tone:'#c1392b'},
  {date:'2026-04-15',kind:'Redeem',fund:'ICICI Pru Nifty 50 Index',amount:30000,units:481.2,nav:62.34,status:'Settled',logo:'IC',tone:'#1f6b50'},
  {date:'2026-04-05',kind:'SIP',fund:'Parag Parikh Flexi Cap',amount:15000,units:194.2,nav:77.22,status:'Completed',logo:'PP',tone:'#0f3d2e'},
  {date:'2026-04-01',kind:'Buy',fund:'Kotak Emerging Equity',amount:20000,units:142.4,nav:140.40,status:'Completed',logo:'KO',tone:'#7a3ec1'},
];

const KIND_COLOR:any={
  SIP:{bg:'var(--brand-soft)',fg:'var(--brand)'},
  Buy:{bg:'var(--up-soft)',fg:'var(--up)'},
  Redeem:{bg:'var(--down-soft)',fg:'var(--down)'},
  Switch:{bg:'color-mix(in oklab,var(--accent) 14%,var(--surface))',fg:'var(--accent)'},
  Dividend:{bg:'color-mix(in oklab,var(--cyan) 14%,var(--surface))',fg:'var(--cyan)'},
};

function Logo({logo,tone,size=36}:{logo:string;tone:string;size?:number}){
  return <div style={{width:size,height:size,borderRadius:size*.3,background:tone,display:'inline-flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:size*.33,color:'white',flexShrink:0}}>{logo}</div>;
}

export default function TransactionsPage(){
  const [filter,setFilter]=useState('all');
  const filters=['all','SIP','Buy','Redeem','Switch','Dividend'];
  const visible=TX.filter(t=>filter==='all'||t.kind===filter);
  const groups:any={};
  visible.forEach(t=>{const k=t.date.slice(0,7);(groups[k]??=[]).push(t);});
  const totalIn=TX.filter(t=>['SIP','Buy'].includes(t.kind)).reduce((s,t)=>s+t.amount,0);
  const totalOut=TX.filter(t=>t.kind==='Redeem').reduce((s,t)=>s+t.amount,0);
  return(
    <AppLayout>
      <div style={{padding:'28px 40px 80px'}}>
        <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:36,gap:20,flexWrap:'wrap'}}>
          <div>
            <div style={{fontSize:10.5,textTransform:'uppercase',letterSpacing:'0.14em',color:'var(--ink-3)',fontWeight:500,marginBottom:10}}>Activity</div>
            <h1 style={{fontFamily:'var(--font-serif)',fontSize:'clamp(40px,5.5vw,80px)',lineHeight:.98,letterSpacing:'-0.03em',fontWeight:400,margin:0,color:'var(--ink)'}}>Transactions</h1>
            <div style={{marginTop:14,fontSize:15,color:'var(--ink-2)',lineHeight:1.55,maxWidth:600}}>Every buy, sell, SIP, switch, and dividend. Filter, export, or trace a single rupee.</div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button style={{padding:'9px 14px',borderRadius:999,fontSize:13,border:'1px solid var(--border)',background:'var(--surface-2)',color:'var(--ink)',cursor:'pointer'}}>⊞ Filter</button>
            <button style={{padding:'9px 14px',borderRadius:999,fontSize:13,border:'1px solid var(--border)',background:'var(--surface-2)',color:'var(--ink)',cursor:'pointer'}}>↓ Export</button>
          </div>
        </div>
        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
          {[
            {l:'Money in (this month)',v:fmtINR(totalIn,{short:true}),s:'SIPs + lumpsums'},
            {l:'Money out',v:fmtINR(totalOut,{short:true}),s:'redemptions'},
            {l:'Dividends YTD',v:'₹3.6K',s:'across 6 funds'},
            {l:'Total transactions',v:'117',s:'lifetime'},
          ].map((s,i)=>(
            <div key={i} style={{padding:20,background:'var(--surface)',border:'1px solid var(--border)',borderRadius:20}}>
              <div style={{fontSize:10.5,textTransform:'uppercase',letterSpacing:'0.14em',color:'var(--ink-3)',fontWeight:500,marginBottom:8}}>{s.l}</div>
              <div style={{fontFamily:'var(--font-serif)',fontSize:28,lineHeight:1,letterSpacing:'-0.02em',color:'var(--ink)'}}>{s.v}</div>
              <div style={{fontSize:12,color:'var(--ink-3)',marginTop:4}}>{s.s}</div>
            </div>
          ))}
        </div>
        {/* Filter pills */}
        <div style={{display:'flex',gap:6,marginBottom:16,flexWrap:'wrap'}}>
          {filters.map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{padding:'7px 14px',borderRadius:999,fontSize:13,border:'1px solid var(--border)',background:filter===f?'var(--brand)':'var(--surface)',color:filter===f?'var(--bg-deep)':'var(--ink-2)',fontWeight:filter===f?600:400,cursor:'pointer'}}>
              {f==='all'?`All (${TX.length})`:f}
            </button>
          ))}
        </div>
        {/* Timeline */}
        {Object.entries(groups).map(([month,txs]:any)=>{
          const [y,m]=month.split('-');
          const mName=new Date(`${y}-${m}-01`).toLocaleDateString('en-IN',{month:'long',year:'numeric'});
          return(
            <div key={month} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:20,overflow:'hidden',marginBottom:20}}>
              <div style={{padding:'14px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid var(--border)',background:'var(--surface-2)'}}>
                <div style={{fontSize:13,fontWeight:500,color:'var(--ink)'}}>{mName}</div>
                <div style={{fontSize:11,color:'var(--ink-3)',fontFamily:'var(--font-mono)'}}>{txs.length} transactions · {fmtINR(txs.reduce((s:number,t:any)=>s+t.amount,0),{short:true})}</div>
              </div>
              <table style={{width:'100%',borderCollapse:'separate',borderSpacing:0}}>
                <tbody>
                  {txs.map((t:any,i:number)=>{
                    const c=KIND_COLOR[t.kind]||KIND_COLOR.Buy;
                    return(
                      <tr key={i}>
                        <td style={{padding:'16px 20px',width:80,borderBottom:i<txs.length-1?'1px solid var(--border)':'none'}}>
                          <div style={{fontFamily:'var(--font-mono)',fontSize:12,fontWeight:500,color:'var(--ink)'}}>{new Date(t.date).getDate()}</div>
                          <div style={{fontSize:10.5,color:'var(--ink-3)'}}>{new Date(t.date).toLocaleDateString('en-IN',{weekday:'short'})}</div>
                        </td>
                        <td style={{padding:'16px 20px',borderBottom:i<txs.length-1?'1px solid var(--border)':'none'}}>
                          <div style={{display:'flex',alignItems:'center',gap:12}}>
                            <Logo logo={t.logo} tone={t.tone}/>
                            <div>
                              <div style={{fontWeight:500,fontSize:14,color:'var(--ink)'}}>{t.fund}</div>
                              <div style={{display:'flex',gap:8,alignItems:'center',marginTop:4}}>
                                <span style={{display:'inline-flex',alignItems:'center',padding:'3px 8px',borderRadius:999,background:c.bg,color:c.fg,fontSize:10,fontWeight:500}}>{t.kind}</span>
                                <span style={{fontSize:11,color:'var(--ink-3)'}}>NAV ₹{t.nav.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{padding:'16px 20px',textAlign:'right',borderBottom:i<txs.length-1?'1px solid var(--border)':'none',fontFamily:'var(--font-mono)',fontSize:13}}>
                          <div style={{fontWeight:600,color:'var(--ink)'}}>{fmtINR(t.amount)}</div>
                          {t.units>0&&<div style={{fontSize:11,color:'var(--ink-3)'}}>{t.units.toFixed(2)} units</div>}
                        </td>
                        <td style={{padding:'16px 20px',width:130,borderBottom:i<txs.length-1?'1px solid var(--border)':'none'}}>
                          <span style={{display:'inline-flex',alignItems:'center',gap:5,padding:'4px 10px',borderRadius:999,background:'var(--up-soft)',color:'var(--up)',fontSize:10,fontWeight:500}}>✓ {t.status}</span>
                        </td>
                        <td style={{padding:'16px 20px',width:50,borderBottom:i<txs.length-1?'1px solid var(--border)':'none',textAlign:'center'}}>
                          <button style={{padding:6,borderRadius:8,border:'none',background:'transparent',color:'var(--ink-3)',cursor:'pointer',fontSize:14}}>›</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}
