import { FaStar, FaRegStar } from "react-icons/fa";

type RatingProps = {
  rating: number;
  size?: "sm" | "md";
};

// Static 5-star display. Rounds to the nearest whole star — half-stars
// would need a third icon, and the design here is intentionally simple
// (mirrors how single-product page surfaces a product-level average).
export default function Rating({ rating, size = "md" }: RatingProps) {
  const filled = Math.round(rating);
  const sizeClass = size === "sm" ? "text-sm" : "text-base";
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-yellow-500 ${sizeClass}`}
      aria-label={`${rating.toFixed(1)} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((n) =>
        n <= filled ? <FaStar key={n} /> : <FaRegStar key={n} />
      )}
    </span>
  );
}
