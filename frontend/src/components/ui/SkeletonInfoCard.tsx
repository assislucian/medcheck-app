import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonInfoCardProps {
  className?: string;
}

// Placeholder card matching InfoCard layout while data is loading
export const SkeletonInfoCard = ({ className }: SkeletonInfoCardProps) => (
  <div
    className={cn(
      "w-full rounded-xl border p-4 shadow-sm bg-muted/20 animate-pulse flex flex-col gap-4",
      className
    )}
    aria-busy="true"
    aria-label="Carregando métrica"
  >
    <div className="flex items-center justify-between">
      <Skeleton className="h-10 w-10 rounded-lg" />
      <Skeleton className="h-4 w-12 rounded-full" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  </div>
); 