import { auth } from "@clerk/nextjs/server";
import { fetchFavoriteId } from "@/utils/queries";
import FavoriteSignInPrompt from "./FavoriteSignInPrompt";
import FavoriteToggleForm from "./FavoriteToggleForm";

type FavoriteToggleButtonProps = {
  productId: string;
};

export default async function FavoriteToggleButton({
  productId,
}: FavoriteToggleButtonProps) {
  const { userId } = await auth();
  if (!userId) return <FavoriteSignInPrompt />;

  const favoriteId = await fetchFavoriteId(productId);
  return <FavoriteToggleForm productId={productId} favoriteId={favoriteId} />;
}
