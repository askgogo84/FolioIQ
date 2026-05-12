
"use client";
import { useState, useRef, useEffect } from "react";
import AppLayout from "@/components/AppLayout";

const SUGGESTIONS = [
  { icon: "🛑", text: "Should I stop my SIP in ICICI Technology fund?" },
  { icon: "💰", text: "How can I save tax on my mutual funds?" },
  { icon: "📊", text: "Is my portfolio too risky?" },
  { icon: "🔄", text: "How do I rebalance my portfolio?" },
  { icon: "🎯", text: "Which funds should I add for stability?" },
  { icon: "📈", text: "What is XIRR and is 13% good?" },
  { icon: "💡", text: "Explain LTCG tax in simple words" },
  { icon: "🏠", text: "I want to buy a house in 5 years — how should I invest?" },
];

type Msg = { role: "user" | "assistant"; content: string; searching?: boolean };

const WELCOME: Msg = {
  role: "assistant",
  content: `Hi! I'm your FolioIQ AI advisor 👋

I have access to your actual portfolio — 19 funds, ₹55.33L current value, 13.3% XIRR. I search the web for the latest expert opinions before answering, so you get real, current information — not guesswork.

**Ask me anything in plain language:**
- "Should I stop my SIP in fund X?"
- "How can I save tax this year?"
- "Is my portfolio too aggressive?"
- "Explain what alpha means"

I'll answer like a friend who happens to be a financial expert — clear, honest, and jargon-free.`
};

function MarkdownText({ text }: { text: string }) {
  const html = text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul class="list-disc pl-4 space-y-1 my-2">$1</ul>')
    .replace(/\n\n/g, '</p><p class="mt-3">')
    .replace(/\n/g, '<br/>');
  return (
    <div className="text-[14px] leading-relaxed text-gray-700 prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: `<p>${html}</p>` }}/>
  );
}

export default function Chat() {
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchingWeb, setSearchingWeb] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;
    setInput("");
    setLoading(true);
    setSearchingWeb(true);

    const userMsg: Msg = { role: "user", content: q };
    setMessages(m => [...m, userMsg]);

    // Add searching indicator
    setMessages(m => [...m, { role: "assistant", content: "", searching: true }]);

    try {
      const res = await fetch("/api/intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      const answer = data.answer || "I couldn't get a response right now. Please try again.";

      setMessages(m => {
        const msgs = m.filter(x => !x.searching);
        return [...msgs, { role: "assistant", content: answer }];
      });
    } catch {
      setMessages(m => {
        const msgs = m.filter(x => !x.searching);
        return [...msgs, { role: "assistant", content: "Sorry, I hit an error. Please try again in a moment." }];
      });
    } finally {
      setLoading(false);
      setSearchingWeb(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  return (
    <AppLayout title="AI Chat" subtitle="Ask anything about your portfolio — powered by Claude + live web search">
      <div className="flex flex-col h-[calc(100vh-116px)]">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-6 space-y-5">

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-3`}>
              {msg.role === "assistant" && (
                <div className="w-9 h-9 bg-gray-900 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <span className="text-white text-[13px] font-black">F</span>
                </div>
              )}
              <div className={`max-w-[80%] sm:max-w-[72%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                {msg.searching ? (
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
                    <div className="flex items-center gap-3 text-gray-500">
                      <div className="flex gap-1">
                        {[0,1,2].map(i=><div key={i} className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay:`${i*0.15}s`}}/>)}
                      </div>
                      <span className="text-[13px] font-medium">Searching the web for current data...</span>
                    </div>
                  </div>
                ) : msg.role === "assistant" ? (
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
                    <MarkdownText text={msg.content}/>
                  </div>
                ) : (
                  <div className="bg-gray-900 text-white rounded-2xl rounded-tr-sm px-5 py-3.5">
                    <p className="text-[14px] leading-relaxed">{msg.content}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={endRef}/>
        </div>

        {/* Suggestion chips — only show at start */}
        {messages.length === 1 && (
          <div className="px-5 sm:px-8 pb-3">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Suggested questions</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => send(s.text)}
                  className="flex items-center gap-2 text-left px-3 py-2.5 bg-white border border-gray-100 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm text-[12px] font-medium text-gray-700">
                  <span className="text-base flex-shrink-0">{s.icon}</span>
                  <span className="truncate">{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-gray-100 bg-white px-5 sm:px-8 py-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-gray-900 focus-within:bg-white transition-all">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask anything about your portfolio, mutual funds, or investing..."
                rows={1}
                className="w-full bg-transparent text-[14px] text-gray-900 placeholder-gray-400 resize-none focus:outline-none leading-relaxed"
                style={{ minHeight: 24, maxHeight: 120 }}
              />
            </div>
            <button onClick={() => send(input)} disabled={loading || !input.trim()}
              className="flex-shrink-0 w-11 h-11 bg-gray-900 text-white rounded-2xl flex items-center justify-center hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2.5">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"/>
            <p className="text-[11px] text-gray-400">Searches the web · Not SEBI-registered advice · Always verify with a qualified advisor</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
