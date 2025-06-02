import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useBusquedaContenido from "../hooks/useBusquedaContenido";
import useUsuario from "../hooks/useUsuario";

export default function Buscador() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { usuario, idioma, esAdmin } = useUsuario();

  // Ahora el hook acepta idioma como argumento
  const { resultados, loading, error } = useBusquedaContenido(query, idioma);

  const seleccionar = (item) => {
    if (!item?.id || !item.media_type) return;
    navigate(`/detalle/${item.media_type}/${item.id}`);
  };

  return (
    <div className="relative">
      <input
        type="text"
        className="border rounded px-3 py-1 w-full"
        placeholder="Buscar series, películas o animes..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Buscar contenido"
      />

      {loading && (
        <div className="absolute left-0 right-0 text-center py-2">Buscando...</div>
      )}
      {error && (
        <div className="absolute left-0 right-0 text-center py-2 text-red-600">{error}</div>
      )}

      {resultados.length > 0 && (
        <ul className="absolute z-10 bg-white border rounded w-full max-h-80 overflow-y-auto shadow-lg">
          {resultados.map((item, index) => (
            <li
              key={`${item.media_type}-${item.id}-${index}`}
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => seleccionar(item)}
            >
              {item.imagen ? (
                <img
                  src={item.imagen}
                  alt={item.nombre}
                  className="w-12 h-18 rounded object-cover"
                />
              ) : (
                <div className="w-12 h-18 bg-gray-300 rounded flex items-center justify-center text-xs text-gray-500">
                  Sin imagen
                </div>
              )}

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-black">
                    {item.nombre}
                  </p>
                  {esAdmin && item.fromSupabase && (
                    <span className="px-1 py-0.5 text-xs bg-green-100 text-green-800 rounded">
                      Guardado
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{item.anio || ""}</span>
                  <span className="uppercase">{item.tipo}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
