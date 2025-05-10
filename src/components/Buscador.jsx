import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

export default function Buscador() {
  const [query, setQuery] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const navigate = useNavigate();

  const manejarCambio = async (e) => {
    const valor = e.target.value;
    setQuery(valor);

    if (valor.length < 3) return setSugerencias([]);

    const res = await fetch(
      `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(valor)}&language=es-ES`
    );
    const data = await res.json();
    setSugerencias(data.results?.slice(0, 5) || []);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={manejarCambio}
        className="w-full p-2 rounded text-black"
        placeholder="Buscar..."
      />
      {sugerencias.length > 0 && (
        <ul className="absolute bg-white w-full text-black rounded shadow z-10 max-h-60 overflow-y-auto">
          {sugerencias.map((s) => (
            <li
              key={s.id}
              onClick={() => navigate(`/detalle/${s.id}`)}
              className="p-2 cursor-pointer hover:bg-gray-200"
            >
              {s.title || s.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
