"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type SubmitButtonProps = {
  text?: string;
  className?: string;
};

export function SubmitButton({ text = "submit", className }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className={className}>
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          please wait...
        </>
      ) : (
        <span className="capitalize">{text}</span>
      )}
    </Button>
  );
}
