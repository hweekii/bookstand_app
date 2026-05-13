import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StarRating({ rating, onRate }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onRate(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={cn(
              "w-8 h-8 transition-colors",
              (hovered || rating) >= star
                ? "fill-accent text-accent"
                : "text-muted-foreground"
            )}
          />
        </button>
      ))}
    </div>
  );
}
