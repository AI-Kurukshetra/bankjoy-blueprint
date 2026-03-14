import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-64 w-full rounded-[32px]" />
      <div className="grid gap-5 lg:grid-cols-3">
        <Skeleton className="h-52 w-full" />
        <Skeleton className="h-52 w-full" />
        <Skeleton className="h-52 w-full" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    </div>
  );
}
