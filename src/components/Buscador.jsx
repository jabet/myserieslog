import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

export default function Buscador() {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [idiomaPreferido, setIdiomaPreferido] = useState("es");
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

  // Cargar usuario y preferencia
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUsuario(user);
      if (user) {
        const { data } = await supabase
          .from("preferencias_usuario")
          .select("idioma_preferido")
          .eq("user_id", user.id)
          .single();
        if (data?.idioma_preferido) setIdiomaPreferido(data.idioma_preferido);
      }
    });
  }, []);

  // Buscar con debounce
  useEffect(() => {
    if (query.length < 2) {
      setResultados([]);
      return;
    }
    const timeout = setTimeout(async () => {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&language=${idiomaPreferido}&query=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setResultados(data.results || []);
      setShowDropdown(true);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, idiomaPreferido]);

  // Cerrar dropdown al clicar fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onChange = (e) => {
    setQuery(e.target.value);
  };

  const seleccionar = async (item) => {
    setShowDropdown(false);
    setQuery("");
    // Asegurar contenido en BD
    if (usuario && item.id) {
      const { data: existente } = await supabase
        .from("contenido")
        .select("id")
        .eq("id", item.id)
        .maybeSingle();
      if (!existente) {
        await supabase
          .from("contenido")
          .upsert([
            {
              id: item.id,
              tipo: item.media_type === "tv" ? "Serie" : "Película",
              anio:
                item.first_air_date?.slice(0, 4) ||
                item.release_date?.slice(0, 4),
              imagen: item.poster_path
                ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                : null,
            },
          ]);
      }
    }
    navigate(`/detalle/${item.id}`);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <input
        type="text"
        className="border rounded px-3 py-1 w-full"
        placeholder="Buscar series o películas..."
        value={query}
        onChange={onChange}
        onFocus={() => query.length >= 2 && setShowDropdown(true)}
      />
      {showDropdown && resultados.length > 0 && (
        <ul className="absolute z-10 bg-white border rounded w-full max-h-80 overflow-y-auto shadow">
          {resultados.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onMouseDown={() => seleccionar(item)}
            >
              {item.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                  alt={item.name || item.title}
                  className="w-12 h-18 rounded object-cover"
                />
              ) : (
                <div className="w-12 h-18 bg-gray-300 rounded" />
              )}
              <div>
                <p className="text-sm font-medium text-black">
                  {item.name || item.title}
                </p>
                <p className="text-xs text-gray-500">
                  {(item.first_air_date || item.release_date || "").slice(0, 4)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
