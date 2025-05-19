import React from "react";

export default function MediaCard({
  nombre,
  imagen,
  anio,
  onEliminar,
  onVerDetalle,
}) {
  return (
    <div className="bg-white rounded shadow p-4 hover:shadow-md transition cursor-pointer align-top">
      {imagen && (
        <img
          src={imagen}
          alt={nombre}
          onClick={onVerDetalle}
          className="w-full rounded mb-2"
        />
      )}
      <h3 className="text-md font-semibold line-clamp-1">{nombre}</h3>
      <p className="text-sm text-gray-600">{anio}</p>
      <div className="mt-2 flex justify-between">
        <button
          onClick={onVerDetalle}
          className="text-blue-600 hover:underline"
        >
          Ver más
        </button>
        <button onClick={onEliminar} className="cursor-pointer ">
          🗑 Eliminar
        </button>
      </div>
    </div>
  );
}
