import { FaStar } from "react-icons/fa";
import { fetchProductRating } from "@/utils/queries";

type ProductRatingProps = {
  productId: string;
};

export default async function ProductRating({ productId }: ProductRatingProps) {
  const { rating, count } = await fetchProductRating(productId);
  const display = count === 0 ? "—" : rating.toFixed(1);
  return (
    <span className="flex gap-1 items-center text-md">
      <FaStar className="text-yellow-500" />
      {display}
      <span className="text-muted-foreground ml-1">
        ({count} review{count === 1 ? "" : "s"})
      </span>
    </span>
  );
}
