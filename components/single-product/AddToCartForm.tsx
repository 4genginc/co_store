"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import FormContainer from "@/components/form/FormContainer";
import { addToCartAction } from "@/utils/actions";

const MAX_AMOUNT = 10;

type AddToCartFormProps = {
  productId: string;
};

export default function AddToCartForm({ productId }: AddToCartFormProps) {
  const [amount, setAmount] = useState(1);
  return (
    <FormContainer action={addToCartAction} className="mt-8 flex items-end gap-x-4">
      <input type="hidden" name="productId" value={productId} />
      <div>
        <label
          htmlFor="amount"
          className="block text-sm font-medium capitalize mb-2"
        >
          amount
        </label>
        <select
          id="amount"
          name="amount"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          {Array.from({ length: MAX_AMOUNT }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
      <AddToCartSubmit />
    </FormContainer>
  );
}

function AddToCartSubmit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="capitalize" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin mr-2" />
          adding...
        </>
      ) : (
        "add to cart"
      )}
    </Button>
  );
}
