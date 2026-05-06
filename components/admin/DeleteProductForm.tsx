"use client";

import { useFormStatus } from "react-dom";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import FormContainer from "@/components/form/FormContainer";
import { deleteProductAction } from "@/utils/actions";

function DeleteSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="outline"
      size="icon"
      aria-label="delete product"
      disabled={pending}
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Trash2 className="size-4" />
      )}
    </Button>
  );
}

export default function DeleteProductForm({ productId }: { productId: string }) {
  return (
    <FormContainer action={deleteProductAction}>
      <input type="hidden" name="productId" value={productId} />
      <DeleteSubmitButton />
    </FormContainer>
  );
}
