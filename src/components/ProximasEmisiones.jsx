import React from "react";

export default function ProximasEmisiones({ emisiones = [] }) {
  if (!emisiones.length) {
    return (
      <p className="text-gray-500">No hay emisiones próximas registradas.</p>
    );
  }

  return (
    <div className="space-y-4 m-w-10">
      <h2>Próximas emisiones</h2>
      {emisiones.map((ep) => (
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
