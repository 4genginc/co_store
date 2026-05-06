import Link from "next/link";
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { links } from "@/utils/links";
import UserIcon from "./UserIcon";
import SignOutLink from "./SignOutLink";

export default function LinksDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="open navigation"
        className={cn(buttonVariants({ variant: "outline", size: "icon" }))}
      >
        <UserIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44" sideOffset={10}>
        <Show when="signed-out">
          <DropdownMenuItem className="capitalize">
            <SignInButton mode="modal">
              <button type="button" className="w-full text-left">login</button>
            </SignInButton>
          </DropdownMenuItem>
          <DropdownMenuItem className="capitalize">
            <SignUpButton mode="modal">
              <button type="button" className="w-full text-left">register</button>
            </SignUpButton>
          </DropdownMenuItem>
        </Show>
        <Show when="signed-in">
          {links.map((link) => (
            <DropdownMenuItem
              key={link.href}
              render={<Link href={link.href} />}
              className="capitalize"
            >
              {link.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="capitalize">
            <SignOutLink />
          </DropdownMenuItem>
        </Show>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
