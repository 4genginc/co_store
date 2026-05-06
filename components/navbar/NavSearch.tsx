"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "@/components/ui/input";

export default function NavSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = searchParams.get("search") ?? "";
  const [search, setSearch] = useState(initial);

  const handleSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    router.replace(`/products?${params.toString()}`);
  }, 300);

  useEffect(() => {
    if (!searchParams.get("search")) setSearch("");
  }, [searchParams]);

  return (
    <Input
      type="search"
      placeholder="search products..."
      className="max-w-xs dark:bg-muted"
      value={search}
      onChange={(event) => {
        const next = event.target.value;
        setSearch(next);
        handleSearch(next);
      }}
    />
  );
}
