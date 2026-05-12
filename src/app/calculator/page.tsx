
"use client";
import { useState, useMemo } from "react";
import AppLayout from "@/components/AppLayout";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const fmt = (v: number) => v>=10000000?`₹${(v/10000000).toFixed(2)}Cr`:v>=100000?`₹${(v/100000).toFixed(2)}L`:`₹${Math.round(v).toLocaleString()}`;

export default function Calculator() {
  const [sip, setSip] = useState(10000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(15);
  const [mode, setMode] = useState<"sip"|"lumpsum">("sip");
  const [lump, setLump] = useState(100000);

  const data = useMemo(()=>{
    const pts = [];
    for (let y=1; y<=years; y++) {
      let corpus, invested;
      if (mode==="sip") {
        const n = y*12; const r = rate/12/100;
        corpus = sip * (Math.pow(1+r,n)-1)/r * (1+r);
        invested = sip * n;
      } else {
        corpus = lump * Math.pow(1+rate/100,y);
        invested = lump;
      }
      pts.push({ year:`Y${y}`, corpus:Math.round(corpus), invested:Math.round(invested), gain:Math.round(corpus-invested) });
    }
    return pts;
  },[sip,rate,years,mode,lump]);

  const final = data[data.length-1];
  const invested = mode==="sip"?sip*years*12:lump;

  return (
    <AppLayout title="SIP Calculator" subtitle="Project your wealth with different SIP and lumpsum scenarios">
      <div className="px-5 sm:px-6 py-6 space-y-5">

        {/* Result */}
        <div className="bg-gray-900 rounded-2xl p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { l:"Invested", v:fmt(invested), c:"text-white" },
              { l:"Est. Corpus", v:fmt(final?.corpus||0), c:"text-emerald-400" },
              { l:"Wealth Gain", v:fmt((final?.gain)||0), c:"text-emerald-400" },
            ].map((k,i)=>(
              <div key={i}>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">{k.l}</div>
                <div className={`text-[18px] sm:text-[24px] font-black tracking-tight ${k.c}`}>{k.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Controls */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 space-y-5">
            {/* Mode toggle */}
            <div className="flex bg-gray-100 rounded-xl p-1">
              {["sip","lumpsum"].map(m=>(
                <button key={m} onClick={()=>setMode(m as any)}
                  className={`flex-1 py-2 text-[12px] font-semibold rounded-lg transition-all capitalize ${mode===m?"bg-white shadow-sm text-gray-900":"text-gray-400 hover:text-gray-600"}`}>
                  {m==="sip"?"SIP":"Lumpsum"}
                </button>
              ))}
            </div>

            {[
              ...(mode==="sip"?[{ label:"Monthly SIP", val:sip, set:setSip, min:500, max:200000, step:500, fmt:"₹" }]:[
                { label:"Lumpsum Amount", val:lump, set:setLump, min:1000, max:10000000, step:1000, fmt:"₹" }
              ]),
              { label:"Expected Return (XIRR %)", val:rate, set:setRate, min:4, max:30, step:0.5, fmt:"%" },
              { label:"Time Horizon (years)", val:years, set:setYears, min:1, max:40, step:1, fmt:"yr" },
            ].map((s,i)=>(
              <div key={i}>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[12px] font-semibold text-gray-700">{s.label}</label>
                  <span className="text-[13px] font-black text-gray-900">{s.fmt==="₹"?`₹${s.val.toLocaleString()}`:s.val+s.fmt}</span>
                </div>
                <input type="range" min={s.min} max={s.max} step={s.step} value={s.val}
                  onChange={e=>s.set(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-gray-900"/>
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>{s.fmt==="₹"?`₹${s.min.toLocaleString()}`:s.min+s.fmt}</span>
                  <span>{s.fmt==="₹"?`₹${s.max.toLocaleString()}`:s.max+s.fmt}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-5">
            <div className="text-[13px] font-bold text-gray-900 mb-4">Growth Projection</div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={data} margin={{top:4,right:4,bottom:0,left:-20}}>
                <defs>
                  <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#16a34a" stopOpacity={0.2}/><stop offset="100%" stopColor="#16a34a" stopOpacity={0}/></linearGradient>
                  <linearGradient id="gI" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#94a3b8" stopOpacity={0.15}/><stop offset="100%" stopColor="#94a3b8" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                <XAxis dataKey="year" fontSize={10} tick={{fill:"#94a3b8"}} tickLine={false} axisLine={false}/>
                <YAxis fontSize={10} tick={{fill:"#94a3b8"}} tickLine={false} axisLine={false} tickFormatter={v=>v>=100000?`${(v/100000).toFixed(0)}L`:`${v}`}/>
                <Tooltip contentStyle={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,fontSize:12}} formatter={(v:number,n:string)=>[fmt(v),n==="corpus"?"Corpus":"Invested"]}/>
                <Area type="monotone" dataKey="corpus" stroke="#16a34a" fill="url(#gC)" strokeWidth={2} name="corpus" dot={false}/>
                <Area type="monotone" dataKey="invested" stroke="#cbd5e1" fill="url(#gI)" strokeWidth={1.5} name="invested" dot={false} strokeDasharray="4 4"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
