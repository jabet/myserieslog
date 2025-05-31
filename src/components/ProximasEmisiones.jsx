import React from "react";

export default function ProximasEmisiones({ emisiones = [] }) {
  if (!emisiones.length) {
    return (
      <p className="text-gray-500">No hay emisiones próximas registradas.</p>
    );
  }

  // Agrupar por serie y mostrar solo el próximo episodio de cada una
  const proximosPorSerie = emisiones.reduce((acc, ep) => {
    if (!acc[ep.contenido_id] || ep.fecha_emision < acc[ep.contenido_id].fecha_emision) {
      acc[ep.contenido_id] = ep;
    }
    return acc;
  }, {});

  const episodiosUnicos = Object.values(proximosPorSerie)
    .sort((a, b) => a.fecha_emision.localeCompare(b.fecha_emision));

  return (
    <div className="space-y-4 m-w-10 max-h-270 overflow-y-auto">
      <h2>Próximas emisiones</h2>
      {episodiosUnicos.map((ep) => (
        <div
          key={ep.id}
          className="flex items-start gap-4 p-4 bg-white rounded shadow hover:shadow-md transition"
        >
          {ep.imagen ? (
            <img
              src={ep.imagen}
              alt={ep.nombre}
              className="w-24 h-14 object-cover rounded"
            />
          ) : (
            <div className="w-24 h-14 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
              Sin imagen
            </div>
          )}

          <div className="flex-1">
            <p className="text-sm font-semibold">
              {ep.contenido_nombre} — T{ep.temporada}E{ep.episodio}
            </p>
            <p className="text-sm text-gray-700">{ep.nombre}</p>
            <p className="text-xs text-gray-500">{ep.fecha_emision}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
