import { auth } from "@clerk/nextjs/server";
import AddToCartSignInPrompt from "./AddToCartSignInPrompt";
import AddToCartForm from "./AddToCartForm";

type AddToCartProps = {
  productId: string;
};

export default async function AddToCart({ productId }: AddToCartProps) {
  const { userId } = await auth();
  if (!userId) return <AddToCartSignInPrompt />;
  return <AddToCartForm productId={productId} />;
}
