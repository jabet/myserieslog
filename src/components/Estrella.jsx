// src/components/Estrellas.jsx
import { useState } from "react";

export default function Estrellas({ valor = 0, onChange }) {
  const [hover, setHover] = useState(null);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(null)}
          className={`
            text-xl
            ${n <= (hover || valor) ? "text-yellow-400" : "text-gray-300"}
          `}
        >
          ★
        </button>
      ))}
    </div>
  );
}
