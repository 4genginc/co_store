"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import FormContainer from "@/components/form/FormContainer";
import { createOrderAction } from "@/utils/actions";

export default function PlaceOrderButton() {
  return (
    <FormContainer action={createOrderAction} className="mt-6">
      <SubmitButton />
    </FormContainer>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full capitalize" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin mr-2" />
          placing order...
        </>
      ) : (
        "place order"
      )}
    </Button>
  );
}
