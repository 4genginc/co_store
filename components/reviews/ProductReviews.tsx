import { auth } from "@clerk/nextjs/server";
import {
  fetchProductReviews,
  fetchUserProductReview,
} from "@/utils/queries";
import SectionTitle from "@/components/global/SectionTitle";
import EmptyList from "@/components/global/EmptyList";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";

type ProductReviewsProps = {
  productId: string;
};

export default async function ProductReviews({ productId }: ProductReviewsProps) {
  const { userId } = await auth();
  const [reviews, myReview] = await Promise.all([
    fetchProductReviews(productId),
    userId ? fetchUserProductReview(productId) : Promise.resolve(null),
  ]);
  const canSubmit = Boolean(userId) && !myReview;

  return (
    <section className="mt-16">
      <SectionTitle text="reviews" />
      {canSubmit && (
        <div className="mt-6">
          <ReviewForm productId={productId} />
        </div>
      )}
      <div className="mt-6 grid gap-4">
        {reviews.length === 0 ? (
          <EmptyList heading="No reviews yet — be the first to leave one." />
        ) : (
          reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              showDelete={review.clerkId === userId}
            />
          ))
        )}
      </div>
    </section>
  );
}
