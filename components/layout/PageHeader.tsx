import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}

export default function PageHeader({ title, subtitle, children, className }: PageHeaderProps) {
  return (
    <div className={cn(
      "flex items-start justify-between gap-4 px-8 py-5 border-b border-gray-200 bg-white shadow-sm",
      className
    )}>
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-guinda-900 tracking-tight font-display">{title}</h1>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-3 flex-shrink-0">
          {children}
        </div>
      )}
    </div>
  );
}
