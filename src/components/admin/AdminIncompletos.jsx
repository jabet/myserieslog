import React from "react";

export default function AdminIncompletos({
  contenidos,
  onActualizarIncompletos,
}) {
  // Detectar contenidos incompletos
  const contenidosIncompletos = contenidos.filter((c) => {
    if (
      !c.sinopsis ||
      !c.imagen ||
      !c.generos ||
      (Array.isArray(c.generos) && c.generos.length === 0)
    ) {
      return true;
    }
    if (c.media_type === "movie") {
      return !c.duracion || c.duracion === 0;
    }
    if (c.media_type === "tv") {
      return (
        !c.temporadas ||
        c.temporadas === 0 ||
        !c.episodios_totales ||
        c.episodios_totales === 0
      );
    }
    return false;
  });

  // Devuelve el primer campo relevante que falta para mostrarlo en la lista
  function campoFaltante(c) {
    if (!c.sinopsis) return "sinopsis";
    if (!c.imagen) return "imagen";
    if (!c.generos || (Array.isArray(c.generos) && c.generos.length === 0))
      return "géneros";
    if (c.media_type === "movie" && (!c.duracion || c.duracion === 0))
      return "duración";
    if (c.media_type === "tv") {
      if (!c.temporadas || c.temporadas === 0) return "temporadas";
      if (!c.episodios_totales || c.episodios_totales === 0) return "episodios";
    }
    return "dato desconocido";
  }

  if (contenidosIncompletos.length === 0) return null;

  return (
    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-yellow-800">
          Contenidos incompletos detectados: {contenidosIncompletos.length}
        </span>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={onActualizarIncompletos}
        >
          Actualizar desde TMDb
        </button>
      </div>
      <ul className="list-disc ml-6 text-yellow-900 text-sm max-h-32 overflow-y-auto">
        {contenidosIncompletos.slice(0, 10).map((c) => (
          <li key={c.id}>
            #{c.id} -{" "}
            {c.nombre || (
              <span className="italic text-gray-400">Sin nombre</span>
            )}
            <span className="ml-2 text-xs text-yellow-700">
              (falta: <strong>{campoFaltante(c)}</strong>)
            </span>
          </li>
        ))}
        {contenidosIncompletos.length > 10 && (
          <li className="italic text-gray-500">
            ...y {contenidosIncompletos.length - 10} más
          </li>
        )}
      </ul>
    </div>
  );
}
