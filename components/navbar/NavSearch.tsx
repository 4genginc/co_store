import { Input } from "@/components/ui/input";

export default function NavSearch() {
  return (
    <Input
      type="search"
      placeholder="search products..."
      className="max-w-xs dark:bg-muted"
    />
  );
}
