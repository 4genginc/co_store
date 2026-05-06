"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminLinks } from "@/utils/links";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside>
      <ul className="flex flex-col gap-2">
        {adminLinks.map((link) => {
          const active = pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  buttonVariants({
                    variant: active ? "default" : "ghost",
                    size: "sm",
                  }),
                  "w-full justify-start capitalize"
                )}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
