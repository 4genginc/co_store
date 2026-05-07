import Link from "next/link";
import { fetchUserReviews } from "@/utils/queries";
import SectionTitle from "@/components/global/SectionTitle";
import EmptyList from "@/components/global/EmptyList";
import ReviewCard from "@/components/reviews/ReviewCard";

export default async function ReviewsPage() {
  const reviews = await fetchUserReviews();

  return (
    <section>
      <SectionTitle text="your reviews" />
      {reviews.length === 0 ? (
        <EmptyList
          heading="You haven't written any reviews yet."
          className="mt-12"
        />
      ) : (
        <div className="mt-12 grid gap-4">
          {reviews.map((review) => (
            <div key={review.id} className="grid gap-2">
              <Link
                href={`/products/${review.productId}`}
                className="text-sm text-muted-foreground hover:underline capitalize"
              >
                {review.product.name}
              </Link>
              <ReviewCard review={review} showDelete />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
