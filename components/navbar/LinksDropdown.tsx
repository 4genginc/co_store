import Link from "next/link";
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
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
import { isAdmin } from "@/utils/admin";
import UserIcon from "./UserIcon";
import SignOutLink from "./SignOutLink";

export default async function LinksDropdown() {
  const user = await currentUser();
  const showDashboard = isAdmin(user?.id);
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
          {showDashboard && (
            <DropdownMenuItem
              render={<Link href="/admin" />}
              className="capitalize"
            >
              dashboard
            </DropdownMenuItem>
          )}
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
