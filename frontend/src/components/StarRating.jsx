// src/components/StarRating.jsx
import { useState } from "react";

export default function StarRating({ value = 0, onChange, readOnly = false }) {
  const [hover, setHover] = useState(0);
  const current = hover || value;

  return (
    <div style={{ display: "inline-flex", gap: 6 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          style={{
            cursor: readOnly ? "default" : "pointer",
            fontSize: 20,
            lineHeight: 1,
          }}
          onMouseEnter={() => !readOnly && setHover(n)}
          onMouseLeave={() => !readOnly && setHover(0)}
          onClick={() => !readOnly && onChange?.(n)}
          aria-label={`${n} star`}
          role={readOnly ? undefined : "button"}
        >
          {current >= n ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
}
