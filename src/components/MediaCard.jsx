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
  proximoEpisodio,
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
        <div className="absolute top-2 right-2 bg-black bg-opacity-60 rounded-full p-1 z-50">
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
              Nuevos capítulos
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
          className={`inline-block text-white text-xs font-semibold px-2 py-0.5 rounded-b ${bgTipo || "bg-gray-500"}`}
        >
          {tipo}
        </span>
      )}
      {proximoEpisodio && (
        <div className="absolute mt-2 pr-2 pb-1 bottom-0 grid w-full">
          <span className="text-xs text-gray-700 font-semibold text-right w-full">
            T{proximoEpisodio.temporada}E{proximoEpisodio.episodio}{" "}
          </span>
          <span className=" inlien-block  text-xs text-gray-700 font-semibold text-right w-full line-clamp-1">
            {proximoEpisodio.nombre}
          </span>
        </div>
      )}
    </article>
  );
}
