'use client';
import { useState, useRef, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';

const CHAT_HISTORY=[
  {date:'Today',items:['Why did my portfolio drop?','Compare PPFC vs Quant','Tax harvest options']},
  {date:'Yesterday',items:['Best small cap funds 2026','Retirement projection']},
  {date:'Last week',items:['ELSS recommendations','SIP vs lumpsum']},
];
const PROMPT_CATS=[
  {label:'Performance',color:'var(--brand)',prompts:['Why is my portfolio underperforming the Nifty?','Which funds drove my returns this year?','Show me my Sharpe ratio over 3 years.']},
  {label:'Tax',color:'var(--gold)',prompts:['How much LTCG can I harvest tax-free?',"What's my STCG liability for FY 25-26?",'Optimise my 80C investments.']},
  {label:'Risk',color:'var(--accent)',prompts:["What's my portfolio beta?",'Stress test against 2008-style crash.','Reduce drawdown risk by 5%.']},
  {label:'Planning',color:'var(--violet)',prompts:['How much for ₹2 Cr retirement at 60?',"Plan for my kid's higher education.",'Build me a 70/20/10 portfolio.']},
];
const INIT=[
  {role:'assistant',content:'Hello, Aarav! I\'ve analysed your portfolio — 8 funds, ₹48.47 L, XIRR 18.4%. Yesterday you were down −0.24% while the Nifty fell −0.41%. Two main drivers:\n\n1. **Axis Small Cap** fell 1.22% on SEBI\'s tightened small-cap disclosure norms.\n2. **HDFC Mid-Cap** dropped 0.35% on a profit-taking day in mid caps.\n\nYour large-cap and flexi-cap holdings cushioned the fall — PPFC was +0.42%. Net: you out-performed the index by 17bp.',time:'Now'},
];

export default function ChatPage(){
  const [thread,setThread]=useState(INIT);
  const [input,setInput]=useState('');
  const [loading,setLoading]=useState(false);
  const bottomRef=useRef<HTMLDivElement>(null);

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:'smooth'});},[thread]);

  const send=async(msg:string)=>{
    if(!msg.trim()||loading)return;
    const userMsg={role:'user',content:msg,time:'Now'};
    setThread(t=>[...t,userMsg]);
    setInput('');
    setLoading(true);
    try{
      const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:msg,history:thread})});
      const data=await res.json();
      setThread(t=>[...t,{role:'assistant',content:data.response||'I couldn\'t process that request.',time:'Now'}]);
    }catch{
      setThread(t=>[...t,{role:'assistant',content:'Sorry, I ran into an error. Please try again.',time:'Now'}]);
    }
    setLoading(false);
  };

  return(
    <AppLayout>
      <div style={{padding:'28px 40px 40px'}}>
        <div style={{marginBottom:28}}>
          <div style={{fontSize:10.5,textTransform:'uppercase',letterSpacing:'0.14em',color:'var(--ink-3)',fontWeight:500,marginBottom:10}}>✦ Folio AI · v2.1</div>
          <h1 style={{fontFamily:'var(--font-serif)',fontSize:'clamp(40px,5.5vw,80px)',lineHeight:.98,letterSpacing:'-0.03em',fontWeight:400,margin:0,color:'var(--ink)'}}>Ask anything about your money.</h1>
          <div style={{marginTop:14,fontSize:15,color:'var(--ink-2)',lineHeight:1.55,maxWidth:600}}>A purpose-built model trained on your transactions, holdings, and the Indian mutual fund universe. Speaks your goals.</div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'260px 1fr',gap:24,minHeight:'70vh'}}>
          {/* History sidebar */}
          <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:20,padding:18,display:'flex',flexDirection:'column'}}>
            <button onClick={()=>{setThread(INIT);}} style={{marginBottom:18,padding:'10px',borderRadius:12,border:'none',background:'var(--brand)',color:'var(--bg-deep)',fontWeight:600,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:7}}>
              + New chat
            </button>
            <div style={{display:'flex',flexDirection:'column',gap:18,flex:1,overflow:'auto'}}>
              {CHAT_HISTORY.map((g,i)=>(
                <div key={i}>
                  <div style={{fontSize:10.5,textTransform:'uppercase',letterSpacing:'0.12em',color:'var(--ink-3)',fontWeight:500,marginBottom:8,padding:'0 6px'}}>{g.date}</div>
                  <div style={{display:'flex',flexDirection:'column',gap:2}}>
                    {g.items.map((p,k)=>(
                      <button key={k} onClick={()=>send(p)} style={{padding:'9px 10px',borderRadius:9,textAlign:'left',fontSize:12.5,color:'var(--ink-2)',border:'none',background:'transparent',cursor:'pointer',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}
                        onMouseEnter={e=>(e.currentTarget.style.background='var(--surface-2)')}
                        onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat area */}
          <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:20,display:'flex',flexDirection:'column',overflow:'hidden'}}>
            <div style={{flex:1,padding:'24px 32px',overflow:'auto',display:'flex',flexDirection:'column',gap:24,maxHeight:'calc(70vh - 80px)'}}>
              {thread.map((m,i)=>(
                <div key={i} style={{display:'flex',flexDirection:'column',gap:8,maxWidth:'72%',alignSelf:m.role==='user'?'flex-end':'flex-start'}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    {m.role!=='user'&&<div style={{width:24,height:24,borderRadius:8,background:'var(--brand)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11}}>✦</div>}
                    <div style={{fontSize:10.5,textTransform:'uppercase',letterSpacing:'0.12em',color:'var(--ink-3)',fontWeight:500}}>{m.role==='user'?'You':'Folio AI'} · {m.time}</div>
                  </div>
                  <div style={{padding:'14px 18px',borderRadius:m.role==='user'?'20px 20px 6px 20px':'20px 20px 20px 6px',background:m.role==='user'?'var(--brand)':'var(--surface-2)',color:m.role==='user'?'var(--bg-deep)':'var(--ink)',fontSize:14,lineHeight:1.6,border:m.role==='user'?'none':'1px solid var(--border)',whiteSpace:'pre-wrap'}}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading&&(
                <div style={{display:'flex',flexDirection:'column',gap:8,maxWidth:'72%',alignSelf:'flex-start'}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <div style={{width:24,height:24,borderRadius:8,background:'var(--brand)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11}}>✦</div>
                    <div style={{fontSize:10.5,textTransform:'uppercase',letterSpacing:'0.12em',color:'var(--ink-3)',fontWeight:500}}>Folio AI · thinking…</div>
                  </div>
                  <div style={{padding:'14px 18px',borderRadius:'20px 20px 20px 6px',background:'var(--surface-2)',border:'1px solid var(--border)',display:'flex',gap:6,alignItems:'center'}}>
                    {[0,1,2].map(i=><span key={i} style={{width:6,height:6,borderRadius:99,background:'var(--ink-3)',animation:'pulse-dot 1.2s infinite',animationDelay:`${i*.2}s`,display:'inline-block'}}/>)}
                  </div>
                </div>
              )}
              {/* Prompt suggestions when fresh */}
              {thread.length<=2&&(
                <div style={{marginTop:14}}>
                  <div style={{fontSize:10.5,textTransform:'uppercase',letterSpacing:'0.12em',color:'var(--ink-3)',fontWeight:500,marginBottom:14}}>Or explore by topic</div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:14}}>
                    {PROMPT_CATS.map((c,i)=>(
                      <div key={i} style={{padding:18,borderRadius:14,background:'var(--surface-2)',border:'1px solid var(--border)'}}>
                        <div style={{fontSize:10.5,textTransform:'uppercase',letterSpacing:'0.12em',fontWeight:500,marginBottom:10,color:c.color}}>{c.label}</div>
                        <div style={{display:'flex',flexDirection:'column',gap:4}}>
                          {c.prompts.map((p,k)=>(
                            <button key={k} onClick={()=>send(p)} style={{padding:'6px 8px',borderRadius:7,textAlign:'left',fontSize:12,color:'var(--ink-2)',border:'none',background:'transparent',cursor:'pointer',transition:'background .1s'}}
                              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='var(--surface-3)';(e.currentTarget as HTMLElement).style.color='var(--ink)';}}
                              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='transparent';(e.currentTarget as HTMLElement).style.color='var(--ink-2)';}}>
                              <span style={{color:c.color,marginRight:6}}>→</span>{p}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef}/>
            </div>

            {/* Composer */}
            <div style={{padding:18,borderTop:'1px solid var(--border)'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,padding:'6px 6px 6px 16px',borderRadius:18,background:'var(--surface-2)',border:'1px solid var(--border)'}}>
                <span style={{color:'var(--brand)',fontSize:16}}>✦</span>
                <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&send(input)}
                  placeholder="Ask Folio AI…  e.g.  Should I switch to direct funds?"
                  style={{flex:1,border:'none',outline:'none',background:'transparent',fontSize:14,padding:'12px 4px',color:'var(--ink)'}}/>
                <button onClick={()=>send(input)} disabled={!input.trim()||loading} style={{padding:'10px 14px',borderRadius:14,border:'none',background:'var(--brand)',color:'var(--bg-deep)',fontWeight:600,fontSize:13,cursor:'pointer',opacity:input.trim()&&!loading?1:0.5}}>
                  Send
                </button>
              </div>
              <div style={{fontSize:10.5,color:'var(--ink-4)',marginTop:10,textAlign:'center'}}>
                Folio AI may produce inaccurate information. Not investment advice. Trained on data up to May 2026.
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
