import { Button } from "@/components/ui/button";

type AddToCartProps = {
  productId: string;
};

export default function AddToCart({ productId }: AddToCartProps) {
  void productId;
  return (
    <Button className="capitalize mt-8" size="lg">
      Add to cart
    </Button>
  );
}
