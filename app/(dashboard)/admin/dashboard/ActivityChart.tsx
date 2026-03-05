"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Placeholder data — replace with real DB query
const data = Array.from({ length: 30 }, (_, i) => ({
  dia: i + 1,
  bitacoras: Math.floor(Math.random() * 15) + 1,
}));

export default function ActivityChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(120 12% 88% / 0.5)" vertical={false} />
        <XAxis
          dataKey="dia"
          tick={{ fontSize: 10, fill: "hsl(120 8% 46%)" }}
          axisLine={false}
          tickLine={false}
          interval={4}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "hsl(120 8% 46%)" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "hsl(0 0% 100%)",
            border: "1px solid hsl(120 12% 88%)",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          formatter={(v) => [v, "Bitácoras"]}
          labelFormatter={(l) => `Día ${l}`}
        />
        <Bar
          dataKey="bitacoras"
          fill="#621132"
          radius={[4, 4, 0, 0]}
          maxBarSize={20}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
