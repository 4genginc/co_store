import { Skeleton } from "@/components/ui/skeleton";

function LoadingProductCard() {
  return (
    <div className="flex flex-col gap-y-3">
      <Skeleton className="h-64 w-full rounded" />
      <Skeleton className="h-4 w-3/4 rounded" />
      <Skeleton className="h-4 w-1/2 rounded" />
    </div>
  );
}

export default function LoadingContainer() {
  return (
    <div className="pt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <LoadingProductCard />
      <LoadingProductCard />
      <LoadingProductCard />
    </div>
  );
}
