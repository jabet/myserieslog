// src/components/MediaCard.jsx
import React from "react";
import { EyeOpenIcon } from "@radix-ui/react-icons";

export default function MediaCard({
  nombre,
  imagen,
  anio,
  tipo,
  estado,       // ← nuevo prop: "pendiente" | "viendo" | "vista"
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
    case "Dorama":
      bgTipo = "bg-pink-500";
      break;
    case "K-Drama":
      bgTipo = "bg-yellow-600";
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
          {/* Icono de "viendo" */}
          {estado === "viendo" && (
            <EyeOpenIcon className="w-5 h-5 text-blue-600" />
          )}

          {/* Icono favorito */}
          {favorito && <span className="text-red-500">❤️</span>}

          {/* Botón eliminar */}
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
