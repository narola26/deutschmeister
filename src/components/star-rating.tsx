import { Star } from "lucide-react";
import type { Stars } from "@/lib/types";

export default function StarRating({
  stars,
  size = 20,
  className = "",
}: {
  stars: Stars;
  size?: number;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-1 ${className}`} aria-label={`${stars} of 3 stars`}>
      {[1, 2, 3].map((n) => (
        <Star
          key={n}
          width={size}
          height={size}
          className={n <= stars ? "fill-amber-400 text-amber-400" : "text-border"}
        />
      ))}
    </div>
  );
}
