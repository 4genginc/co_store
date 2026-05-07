"use client";

import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

// Wraps Clerk's SignInButton in a client component so an async server
// component can render it without tripping `Children.only` (see L-009).
export default function AddToCartSignInPrompt() {
  return (
    <SignInButton mode="modal">
      <Button className="capitalize mt-8" size="lg">
        Sign in to add to cart
      </Button>
    </SignInButton>
  );
}
