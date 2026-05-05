import Link from "next/link";
import { LuAlignLeft } from "react-icons/lu";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { links } from "@/utils/links";

export default function LinksDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="open navigation"
        className={cn(buttonVariants({ variant: "outline", size: "icon" }))}
      >
        <LuAlignLeft />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40" sideOffset={10}>
        {links.map((link) => (
          <DropdownMenuItem
            key={link.href}
            render={<Link href={link.href} />}
            className="capitalize"
          >
            {link.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
