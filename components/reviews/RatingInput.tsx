"use client";

import { useState } from "react";
import { FaStar, FaRegStar } from "react-icons/fa";
import { Label } from "@/components/ui/label";

type RatingInputProps = {
  name: string;
  label?: string;
  defaultValue?: number;
};

export default function RatingInput({
  name,
  label = "rating",
  defaultValue = 0,
}: RatingInputProps) {
  const [rating, setRating] = useState(defaultValue);
  const [hovered, setHovered] = useState(0);
  const display = hovered || rating;

  return (
    <div className="grid gap-2">
      <Label htmlFor={name} className="capitalize">
        {label}
      </Label>
      <input type="hidden" name={name} value={rating} />
      <div
        className="flex items-center gap-1 text-2xl text-yellow-500"
        onMouseLeave={() => setHovered(0)}
      >
        {[1, 2, 3, 4, 5].map((n) => {
          const Icon = n <= display ? FaStar : FaRegStar;
          return (
            <button
              key={n}
              type="button"
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHovered(n)}
              className="cursor-pointer"
            >
              <Icon />
            </button>
          );
        })}
      </div>
    </div>
  );
}
