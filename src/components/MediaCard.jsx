// src/components/MediaCard.jsx
import React from "react";
import { EyeOpenIcon } from "@radix-ui/react-icons";

export default function MediaCard({
  nombre,
  imagen,
  anio,
  tipo,
  favorito,
  viendo,
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
    <div className="relative w-full max-w-xs bg-white shadow rounded overflow-hidden hover:shadow-lg transition">
      {viendo && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-60 rounded-full p-1">
          <EyeOpenIcon className="text-white w-4 h-4" />
        </div>
      )}
      <button
        onClick={onVerDetalle}
        className="focus:outline-none w-full text-left"
      >
        <img
          src={imagen || "/placeholder.jpg"}
          alt={nombre}
          className="w-full max-h-[407px]"
        />
        <div className="p-3">
          <h2 className="text-md font-semibold line-clamp-1">{nombre}</h2>
          <p className="text-sm text-gray-600">{anio}</p>
          {tipo && (
            <span
              className={`inline-block text-white text-xs font-semibold px-2 py-0.5 rounded-b ${bgTipo} || "bg-gray-200 text-gray-700"}`}
            >
              {tipo}
            </span>
          )}
        </div>
      </button>
      {onEliminar && (
        <button
          onClick={onEliminar}
          className="absolute bottom-2 right-2 text-xs text-red-600 hover:underline"
        >
          Eliminar
        </button>
      )}
    </div>
  );
}
