import { cn } from "@/lib/utils";

type EmptyListProps = {
  heading?: string;
  className?: string;
};

export default function EmptyList({
  heading = "No items in the list.",
  className,
}: EmptyListProps) {
  return (
    <h2
      className={cn(
        "text-xl text-muted-foreground bg-muted py-8 text-center rounded",
        className,
      )}
    >
      {heading}
    </h2>
  );
}
