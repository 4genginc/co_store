"use client";

import { useFormStatus } from "react-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import FormContainer from "@/components/form/FormContainer";
import { toggleFavoriteAction } from "@/utils/actions";

type FavoriteToggleFormProps = {
  productId: string;
  favoriteId: string | null;
};

export default function FavoriteToggleForm({
  productId,
  favoriteId,
}: FavoriteToggleFormProps) {
  const isFavorite = Boolean(favoriteId);
  return (
    <FormContainer action={toggleFavoriteAction}>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="favoriteId" value={favoriteId ?? ""} />
      <FavoriteSubmitButton isFavorite={isFavorite} />
    </FormContainer>
  );
}

function FavoriteSubmitButton({ isFavorite }: { isFavorite: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="icon"
      variant="outline"
      disabled={pending}
      aria-label={isFavorite ? "remove from favorites" : "add to favorites"}
      className="p-2 cursor-pointer"
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : isFavorite ? (
        <FaHeart className="text-red-500" />
      ) : (
        <FaRegHeart />
      )}
    </Button>
  );
}
