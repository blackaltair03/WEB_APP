"use client";

import dynamic from "next/dynamic";

// Lazy load de componentes pesados (charts)
const ActivityChart = dynamic(() => import("./ActivityChart"), {
  loading: () => <div className="h-64 bg-gray-50 rounded animate-pulse" />,
  ssr: false,
});

const SatisfactionChart = dynamic(() => import("./SatisfactionChart"), {
  loading: () => <div className="h-64 bg-gray-50 rounded animate-pulse" />,
  ssr: false,
});

export function ActivityChartClient() {
  return <ActivityChart />;
}

export function SatisfactionChartClient({ data }: { data: any }) {
  return <SatisfactionChart data={data} />;
}
