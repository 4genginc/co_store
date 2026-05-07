"use client";

import { SignInButton } from "@clerk/nextjs";
import { FaRegHeart } from "react-icons/fa";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function FavoriteSignInPrompt() {
  return (
    <SignInButton mode="modal">
      <button
        type="button"
        aria-label="sign in to favorite"
        className={cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "p-2 cursor-pointer"
        )}
      >
        <FaRegHeart />
      </button>
    </SignInButton>
  );
}
