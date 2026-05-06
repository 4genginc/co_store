import { FaStar } from "react-icons/fa";

type ProductRatingProps = {
  productId: string;
};

export default function ProductRating({ productId }: ProductRatingProps) {
  void productId;
  const rating = 4.2;
  const count = 12;
  return (
    <span className="flex gap-1 items-center text-md">
      <FaStar className="text-yellow-500" />
      {rating}
      <span className="text-muted-foreground ml-1">({count} reviews)</span>
    </span>
  );
}
