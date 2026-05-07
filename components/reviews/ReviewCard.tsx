import Image from "next/image";
import type { Review } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import Rating from "./Rating";
import DeleteReviewForm from "./DeleteReviewForm";

type ReviewCardProps = {
  review: Review;
  showDelete?: boolean;
};

export default function ReviewCard({ review, showDelete }: ReviewCardProps) {
  return (
    <Card>
      <CardContent className="p-4 grid gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {review.authorImageUrl ? (
              <Image
                src={review.authorImageUrl}
                alt={review.authorName}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            ) : (
              <div
                aria-hidden="true"
                className="h-10 w-10 rounded-full bg-muted"
              />
            )}
            <div>
              <p className="font-medium">{review.authorName}</p>
              <Rating rating={review.rating} size="sm" />
            </div>
          </div>
          {showDelete && <DeleteReviewForm reviewId={review.id} />}
        </div>
        <p className="text-muted-foreground leading-7 whitespace-pre-line">
          {review.comment}
        </p>
      </CardContent>
    </Card>
  );
}
