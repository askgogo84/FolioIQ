
"use client";
import { useState, useRef, useEffect } from "react";
import AppLayout from "@/components/AppLayout";

const SUGGESTIONS = [
  "Should I stop my ICICI Technology SIP?",
  "Which funds can I redeem for tax harvesting?",
  "Is my portfolio too concentrated?",
  "What's the best fund to add for stability?",
  "How do I rebalance my gold allocation?",
];

const INITIAL = [
  { role:"assistant", content:"Hi! I'm your FolioIQ AI advisor. I have access to your actual portfolio — 19 funds, ₹55.33L portfolio value, 13.3% XIRR.\n\nAsk me anything about your portfolio — which funds to exit, tax planning, rebalancing, or fund recommendations." }
];

export default function Chat() {
  const [messages, setMessages] = useState<any[]>(INITIAL);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({behavior:"smooth"}); }, [messages]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const userMsg = { role:"user", content:text };
    setMessages(m=>[...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/claude", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ messages:[...messages, userMsg].map(m=>({role:m.role,content:m.content})),
          systemPrompt:`You are FolioIQ, an expert Indian mutual fund advisor. The user has a portfolio of 19 funds worth ₹55.33L invested ₹39.11L (XIRR 13.3%). Key holdings: Invesco Gold ETF (+119%), Parag Parikh Flexi Cap (+69%), ICICI Technology (-14.2%, SELL), PGIM Flexi Cap (-4%, SELL). Monthly SIP ₹91,000. Give specific, actionable advice. Mention exact fund names, percentage changes, and rupee amounts. Keep responses concise but helpful. Budget 2024: LTCG 12.5% above ₹1.25L.` })
      });
      const data = await res.json();
      setMessages(m=>[...m, { role:"assistant", content:data.response||data.content||"I encountered an error. Please try again." }]);
    } catch {
      setMessages(m=>[...m, { role:"assistant", content:"Sorry, I couldn't connect right now. Please try again in a moment." }]);
    }
    setLoading(false);
  };

  return (
    <AppLayout title="AI Chat" subtitle="Ask anything about your portfolio — powered by Claude AI">
      <div className="flex flex-col h-[calc(100vh-120px)]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((m,i)=>(
              <div key={i} className={`flex ${m.role==="user"?"justify-end":""}`}>
                {m.role==="assistant"&&(
                  <div className="w-7 h-7 bg-gray-900 rounded-xl flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    <span className="text-white text-[11px] font-black">F</span>
                  </div>
                )}
                <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${
                  m.role==="user"?"bg-gray-900 text-white rounded-tr-sm":"bg-white border border-gray-100 text-gray-900 rounded-tl-sm shadow-sm"}`}>
                  <div className="text-[13px] leading-relaxed whitespace-pre-wrap">{m.content}</div>
                </div>
              </div>
            ))}
            {loading&&(
              <div className="flex">
                <div className="w-7 h-7 bg-gray-900 rounded-xl flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                  <span className="text-white text-[11px] font-black">F</span>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    {[0,1,2].map(i=><div key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:`${i*0.15}s`}}/>)}
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef}/>
          </div>
        </div>

        {/* Suggestions (only show at start) */}
        {messages.length===1&&(
          <div className="px-4 sm:px-6 pb-2">
            <div className="max-w-3xl mx-auto">
              <div className="flex gap-2 flex-wrap">
                {SUGGESTIONS.map((s,i)=>(
                  <button key={i} onClick={()=>send(s)}
                    className="text-[12px] px-3 py-1.5 bg-white border border-gray-200 rounded-full text-gray-600 hover:border-gray-900 hover:text-gray-900 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="px-4 sm:px-6 py-4 border-t border-gray-100 bg-white">
          <div className="max-w-3xl mx-auto flex gap-3">
            <input value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send(input);}}}
              placeholder="Ask about your portfolio..."
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:border-gray-900 focus:bg-white transition-all"/>
            <button onClick={()=>send(input)} disabled={loading||!input.trim()}
              className="px-5 py-3 bg-gray-900 text-white rounded-xl font-semibold text-[13px] hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
          <div className="text-[10px] text-gray-400 text-center mt-2">Claude AI · Not SEBI-registered advice</div>
        </div>
      </div>
    </AppLayout>
  );
}
