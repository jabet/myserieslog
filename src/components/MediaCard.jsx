// src/components/MediaCard.jsx
import React from "react";
import { EyeOpenIcon } from "@radix-ui/react-icons";

export default function MediaCard({
  nombre,
  imagen,
  anio,
  tipo,
  media_type,
  favorito,
  viendo,
  conProximos,
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
    <article className="flex flex-wrap w-full min-w-30 max-w-60 bg-white m-1 shadow rounded overflow-hidden hover:shadow-lg transition duration-200 ease-in-out relative">
      {viendo && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-60 rounded-full p-1">
          <EyeOpenIcon className="text-white w-3 h-3" />
        </div>
      )}

      <button
        onClick={() => onVerDetalle(media_type)}
        className="focus:outline-none w-full text-left "
      >
        <div className="relative">
        <img
          src={imagen || "/placeholder.jpg"}
          alt={nombre}
          className="w-full max-h-[407px]"
        />
        {conProximos && (
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-auto bg-red-500 text-white text-xs font-semibold px-2 py-1 text-center">
            Próximos capítulos
          </span>
        )}
        </div>

        <div className="p-3">
          <h2 className="text-sm font-semibold line-clamp-1">{nombre}</h2>
          <p className="text-xs text-gray-600">{anio}</p>
        </div>
      </button>
      {tipo && (
        <span
          className={`inline-block text-white text-xs font-semibold px-2 py-0.5 rounded-b ${bgTipo} || "bg-gray-200 text-gray-700"}`}
        >
          {tipo}
        </span>
      )}
    </article>
  );
}
