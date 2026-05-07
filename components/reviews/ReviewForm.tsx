"use client";

import { Card, CardContent } from "@/components/ui/card";
import FormContainer from "@/components/form/FormContainer";
import TextAreaInput from "@/components/form/TextAreaInput";
import { SubmitButton } from "@/components/form/Buttons";
import RatingInput from "./RatingInput";
import { createReviewAction } from "@/utils/actions";

type ReviewFormProps = {
  productId: string;
};

export default function ReviewForm({ productId }: ReviewFormProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <FormContainer action={createReviewAction} className="grid gap-4">
          <input type="hidden" name="productId" value={productId} />
          <RatingInput name="rating" />
          <TextAreaInput
            name="comment"
            placeholder="What did you think of this product?"
            rows={4}
            required
          />
          <SubmitButton text="submit review" className="w-fit" />
        </FormContainer>
      </CardContent>
    </Card>
  );
}
