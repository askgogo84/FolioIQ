"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Home, LayoutDashboard, Upload, Search, 
  User, Sparkles, Brain, TrendingUp, TrendingDown, AlertCircle,
  CheckCircle, XCircle, DollarSign, Shield, Zap
} from "lucide-react";
import Link from "next/link";

interface Message {
  id: number;
  type: "user" | "ai";
  text: string;
  timestamp: Date;
  data?: any;
}

const quickQuestions = [
  "Should I sell ICICI Pru Technology?",
  "Which fund has the highest returns?",
  "How much tax can I save?",
  "Is my portfolio too risky?",
  "Which funds should I buy more of?",
  "What is my portfolio health score?"
];

const portfolioData = {
  bestFund: { name: "Invesco India Gold ETF FoF", returns: 34.69 },
  worstFund: { name: "ICICI Pru Technology", returns: -14.15 },
  totalValue: 5532843,
  healthScore: 68,
  taxSavings: 28400,
  sellFunds: ["ICICI Pru Technology", "Invesco India Infrastructure", "PGIM India Flexi Cap", "HDFC Flexi Cap Fund"],
  buyFunds: ["Parag Parikh Flexi Cap", "Axis Multicap Fund", "Invesco India Gold ETF"]
};

function getAIResponse(question: string): string {
  const q = question.toLowerCase();
  
  if (q.includes("sell") && q.includes("icici") && q.includes("tech")) {
    return `**Yes, consider exiting ICICI Pru Technology.**\n\nHere's why:\n• Returns: **-14.15%** (worst in your portfolio)\n• Alpha: **-8.5%** (significantly underperforming benchmark)\n• Sharpe Ratio: **-0.5** (negative risk-adjusted returns)\n• Health Score: **25/100**\n\n**AI Recommendation: SELL**\n\n**Suggested replacements:**\n1. SBI Technology Opportunities (+9.5%)\n2. Tata Digital India Fund (+8.1%)\n\nYou can also harvest the ₹33,971 loss for tax savings.`;
  }
  
  if (q.includes("highest") || q.includes("best") || q.includes("top")) {
    return `**${portfolioData.bestFund.name}** is your best performing fund.\n\n• **1Y Returns: +${portfolioData.bestFund.returns}%**\n• Category: Gold\n• Health Score: 92/100\n• Alpha: +8.2%\n\nThis is an excellent hedge against equity volatility. Consider maintaining or slightly increasing allocation.`;
  }
  
  if (q.includes("tax") || q.includes("save")) {
    return `**You can save approximately ₹28,400 in taxes** through loss harvesting.\n\n**Harvestable losses:**\n• ICICI Pru Technology: **₹33,971** (STCG at 15% = ₹5,095 saved)\n• Nippon India Multi Cap: **₹324** (STCG at 15% = ₹48 saved)\n\n**Total tax saved: ₹5,143**\n\nPlus, you have **₹40,000 remaining** in your ₹1.25L LTCG exemption for the year.\n\n[Go to Tax Harvesting →](/tax-harvesting)`;
  }
  
  if (q.includes("risk") || q.includes("risky")) {
    return `**Your portfolio risk level is HIGH** ⚠️\n\n**Risk breakdown:**\n• Very High Risk: **₹2.06L** (ICICI Tech)\n• High Risk: **₹14.8L** (Small Cap + Sectoral)\n• Moderate Risk: **₹31.2L**\n• Low Risk: **₹7.9L** (Arbitrage)\n\n**Issues:**\n1. **34% concentration** in Flexi Cap\n2. **Missing Debt allocation** (0% vs recommended 15%)\n3. **Small Cap overexposure** (12.3% vs recommended 8%)\n\n**Recommendation:** Rebalance to reduce risk. [View Rebalance Plan →](/rebalance)`;
  }
  
  if (q.includes("buy") || q.includes("more") || q.includes("increase")) {
    return `**Top funds to increase allocation in:**\n\n**🟢 BUY-rated funds in your portfolio:**\n1. **Invesco India Gold ETF** - 34.69% returns, strong hedge\n2. **Parag Parikh Flexi Cap** - 16.81% returns, positive alpha\n3. **Axis Multicap Fund** - 21.21% returns, best multi-cap\n4. **Axis ELSS Tax Saver** - 11.76% returns, tax + growth\n\n**New funds to consider:**\n• Nippon India Index Fund (Nifty 50) - Low cost index exposure\n• SBI Magnum Gilt Fund - Debt stability\n\n[View full rebalance plan →](/rebalance)`;
  }
  
  if (q.includes("health") || q.includes("score")) {
    return `**Your Portfolio Health Score is 68/100** 📊\n\n**Breakdown:**\n• **Strong performers:** Invesco Gold (92), Parag Parikh (88), Axis Multicap (90)\n• **Underperformers:** ICICI Tech (25), Invesco Infra (38), Nippon Multi Cap (35)\n• **Average:** 7 funds rated HOLD\n\n**To improve to 85/100:**\n1. Exit 7 sell-rated funds\n2. Add Large Cap & Debt allocation\n3. Reduce Small Cap to 8%\n\n[View Rebalance Plan →](/rebalance)`;
  }
  
  if (q.includes("worst") || q.includes("bad")) {
    return `**Your worst performing funds:**\n\n1. **ICICI Pru Technology: -14.15%** 🔴\n   Health: 25/100 | Alpha: -8.5% | Action: SELL\n\n2. **Nippon India Multi Cap: -0.62%** 🔴\n   Health: 35/100 | Alpha: -3.8% | Action: SELL\n\n3. **Invesco India Infrastructure: +3.99%** 🟡\n   Health: 38/100 | Alpha: -3.2% | Action: SELL\n\n4. **Invesco India Smallcap: +2.09%** 🟡\n   Health: 40/100 | Alpha: -2.5% | Action: SELL\n\nTotal value in underperformers: **₹14.2L**\n\n[View AI Rebalance Plan →](/rebalance)`;
  }
  
  return `I analyzed your portfolio of **₹55.3L** across 17 funds. Here are some things I can help with:\n\n• **"Should I sell [fund name]?"** - Get AI buy/hold/sell rating\n• **"Which funds are underperforming?"** - See worst performers\n• **"How much tax can I save?"** - Tax loss harvesting calculator\n• **"Is my portfolio balanced?"** - Risk & allocation analysis\n• **"What should I buy?"** - Top fund recommendations\n\nWhat would you like to know?`;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      type: "ai",
      text: "Hi! I'm your FolioIQ AI Assistant. I have analyzed your ₹55.3L portfolio across 17 funds. Ask me anything about your investments!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    
    const userMsg: Message = {
      id: messages.length,
      type: "user",
      text,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    
    setTimeout(() => {
      const aiMsg: Message = {
        id: messages.length + 1,
        type: "ai",
        text: getAIResponse(text),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800);
  };

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Upload", href: "/upload", icon: Upload },
    { name: "Explore", href: "/explore", icon: Search },
    { name: "Profile", href: "/profile", icon: User },
    { name: "AI Insights", href: "/intelligence", icon: Brain },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900">FolioIQ</span>
              </Link>
            </div>
            <div className="flex items-center space-x-1">
              {navItems.map((item) => (
                <Link key={item.name} href={item.href} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">
                  <item.icon className="w-4 h-4" />{item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 flex flex-col">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-3">
            <Zap className="w-4 h-4" />
            AI Portfolio Assistant
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Ask FolioIQ AI</h1>
          <p className="text-slate-600 text-sm">Get instant, data-backed answers about your portfolio</p>
        </div>

        {/* Quick Questions */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {quickQuestions.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-full text-sm text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] ${msg.type === "user" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-900"} rounded-2xl px-4 py-3`}>
                  {msg.type === "ai" && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-purple-600" />
                      </div>
                      <span className="text-xs font-medium text-slate-500">FolioIQ AI</span>
                    </div>
                  )}
                  <div className="text-sm whitespace-pre-line leading-relaxed">
                    {msg.text}
                  </div>
                  <div className={`text-xs mt-2 ${msg.type === "user" ? "text-blue-200" : "text-slate-400"}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-100 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-purple-600 animate-pulse" />
                    </div>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-100 p-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder="Ask about your portfolio..."
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isTyping}
                className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">
              AI responses are based on your portfolio data. Not financial advice.
            </p>
          </div>
        </div>

        {/* Portfolio Quick Stats */}
        <div className="grid grid-cols-4 gap-3 mt-6">
          <div className="bg-white rounded-lg border border-slate-200 p-3 text-center">
            <p className="text-xs text-slate-500">Portfolio</p>
            <p className="text-sm font-bold text-slate-900">₹55.3L</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3 text-center">
            <p className="text-xs text-slate-500">Health</p>
            <p className="text-sm font-bold text-amber-600">68/100</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3 text-center">
            <p className="text-xs text-slate-500">Funds</p>
            <p className="text-sm font-bold text-slate-900">17</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3 text-center">
            <p className="text-xs text-slate-500">Tax Save</p>
            <p className="text-sm font-bold text-green-600">₹28.4K</p>
          </div>
        </div>
      </div>
    </div>
  );
}

