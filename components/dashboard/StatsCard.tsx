"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  change?: { value: number | string; label: string; type: "up" | "down" | "neutral" };
  icon: React.ReactNode;
  color?: "guinda" | "dorado" | "blue" | "red" | "purple";
  delay?: number;
  animated?: boolean;
}

const colorMap = {
  guinda:  { bg: "bg-white", border: "border-l-4 border-guinda-700", icon: "bg-guinda-50 text-guinda-700" },
  dorado:   { bg: "bg-white", border: "border-l-4 border-dorado-600", icon: "bg-dorado-50 text-dorado-600" },
  blue:   { bg: "bg-white", border: "border-l-4 border-blue-600", icon: "bg-blue-50 text-blue-600" },
  red:    { bg: "bg-white", border: "border-l-4 border-red-600", icon: "bg-red-50 text-red-600" },
  purple: { bg: "bg-white", border: "border-l-4 border-violet-600", icon: "bg-violet-50 text-violet-600" },
};

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = Date.now();
    const duration = 1000;

    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [value]);

  return <>{display.toLocaleString("es-MX")}</>;
}

export default function StatsCard({
  title, value, subtitle, change, icon, color = "guinda", delay = 0, animated = true,
}: StatsCardProps) {
  const colors = colorMap[color];
  const isNumeric = typeof value === "number";

  return (
    <div
      className={cn(
        "rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow card-lift",
        colors.bg, colors.border,
        "opacity-0 stat-value"
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 font-display">
            {title}
          </p>
          <p className="text-3xl font-bold text-guinda-700 tabular-nums font-display">
            {animated && isNumeric ? (
              <AnimatedNumber value={value as number} />
            ) : (
              isNumeric ? (value as number).toLocaleString("es-MX") : value
            )}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
          {change && (
            <div className={cn(
              "flex items-center gap-1 mt-2 text-xs font-medium",
              change.type === "up" && "text-green-600",
              change.type === "down" && "text-red-600",
              change.type === "neutral" && "text-gray-500"
            )}>
              {change.type === "up" && <TrendingUp className="w-3 h-3" />}
              {change.type === "down" && <TrendingDown className="w-3 h-3" />}
              {change.type === "neutral" && <Minus className="w-3 h-3" />}
              <span>{change.value} {change.label}</span>
            </div>
          )}
        </div>
        <div className={cn(
          "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 text-xl",
          colors.icon
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
}
