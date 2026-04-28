"use client"

import { useEffect, useMemo, useState } from "react"
import { analysePortfolio, money } from "@/lib/folioiq/decision-engine"

export default function Dashboard() {
const [holdings, setHoldings] = useState([])

useEffect(() => {
const data = localStorage.getItem("folioiq_h")
if (data) setHoldings(JSON.parse(data))
}, [])

const decision = useMemo(() => analysePortfolio(holdings), [holdings])

if (!holdings.length) {
return ( <div className="p-10"> <h1 className="text-4xl font-bold">Add your portfolio first</h1> </div>
)
}

return ( <div className="p-8 space-y-8 max-w-5xl mx-auto">

```
  {/* HERO */}
  <div className="p-8 rounded-3xl border bg-white">
    <h1 className="text-5xl font-black">
      {decision.plainEnglishVerdict}
    </h1>

    <p className="mt-4 text-gray-600">
      {decision.simpleSummary}
    </p>
  </div>

  {/* FIX NOW */}
  <Section
    title="🔴 Fix Now"
    items={decision.review}
  />

  {/* KEEP */}
  <Section
    title="🟢 Keep"
    items={decision.keep}
  />

  {/* EXPLORE */}
  <Section
    title="🟡 Explore"
    items={decision.add}
  />

</div>
```

)
}

function Section({ title, items }) {
if (!items?.length) return null

return ( <div> <h2 className="text-2xl font-bold mb-4">{title}</h2>

```
  <div className="space-y-4">
    {items.map((item, i) => (
      <div key={i} className="p-5 border rounded-2xl bg-white">

        <div className="font-bold text-lg">{item.name}</div>

        <div className="text-gray-600 mt-1">
          {item.reason}
        </div>

        <div className="mt-3 p-3 bg-gray-100 rounded-lg text-sm font-medium">
          👉 {item.action}
        </div>

        {item.impact && (
          <div className="text-xs mt-2 text-gray-500">
            Impact: {item.impact}
          </div>
        )}

      </div>
    ))}
  </div>
</div>
```

)
}
