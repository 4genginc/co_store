"use client";

import { useFormStatus } from "react-dom";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import FormContainer from "@/components/form/FormContainer";
import { deleteReviewAction } from "@/utils/actions";

function DeleteSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="ghost"
      size="icon"
      aria-label="delete review"
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

export default function DeleteReviewForm({ reviewId }: { reviewId: string }) {
  return (
    <FormContainer action={deleteReviewAction}>
      <input type="hidden" name="reviewId" value={reviewId} />
      <DeleteSubmitButton />
    </FormContainer>
  );
}
