"use client";

import { SignOutButton } from "@clerk/nextjs";
import { toast } from "sonner";

export default function SignOutLink() {
  return (
    <SignOutButton>
      <button
        type="button"
        className="w-full text-left capitalize"
        onClick={() => toast.success("Signed out")}
      >
        sign out
      </button>
    </SignOutButton>
  );
}
