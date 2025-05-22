// src/components/MediaCard.jsx
import React from "react";

export default function MediaCard({
  nombre,
  imagen,
  anio,
  tipo,
  favorito,
  onEliminar,
  onVerDetalle,
}) {
  // Determina el color del badge según el tipo
  let bgTipo;
  switch (tipo) {
    case "Serie":
      bgTipo = "bg-blue-500";
      break;
    case "Película":
      bgTipo = "bg-green-500";
      break;
    case "Anime":
      bgTipo = "bg-purple-500";
      break;
    default:
      bgTipo = "bg-gray-500";
  }

  return (
    <div className="relative w-40 bg-white rounded shadow hover:shadow-md transition cursor-pointer">
      {/* Badge de tipo */}
      <span
        className={`${bgTipo} text-white text-xs font-semibold px-2 py-0.5 rounded-br`}
      >
        {tipo}
      </span>

      {/* Imagen */}
      <img
        src={imagen}
        alt={nombre}
        className="w-full h-56 object-cover rounded-t"
        onClick={onVerDetalle}
      />

      {/* Contenido */}
      <div className="p-2">
        <h3
          className="text-sm font-medium mb-1 hover:underline"
          onClick={onVerDetalle}
        >
          {nombre}
        </h3>
        <p className="text-xs text-gray-500 mb-2">{anio}</p>

        <div className="flex justify-between items-center">
          {favorito && <span className="text-red-500">❤️</span>}
          {onEliminar && (
            <button
              onClick={onEliminar}
              className="text-xs text-gray-400 hover:text-red-500"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
