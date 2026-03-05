"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

export interface SatisfactionData {
  nivel: string;
  cantidad: number;
  porcentaje: number;
}

interface SatisfactionChartProps {
  data: SatisfactionData[];
}

const COLORS = {
  EXCELENTE: "#B91C3F", // guinda
  BUENO: "#D4A044",      // dorado
  REGULAR: "#F59E0B",    // amber
  MALO: "#EF4444",       // red
};

export default function SatisfactionChart({ data }: SatisfactionChartProps) {
  const chartData = data.map((item) => ({
    name: item.nivel,
    count: item.cantidad,
    percentage: item.porcentaje,
  }));

  const getColor = (nivel: string) => {
    return COLORS[nivel as keyof typeof COLORS] || "#6B7280";
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
        <YAxis stroke="#6B7280" fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: "6px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
          formatter={(value: any) => [
            `${value.count} bitácoras`,
            "Cantidad",
          ]}
          labelFormatter={(label) => `Nivel: ${label}`}
          cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
        />
        <Bar dataKey="count" radius={[8, 8, 0, 0]}>
          {data.map((item, index) => (
            <Cell key={`cell-${index}`} fill={getColor(item.nivel)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
