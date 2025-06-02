// src/components/MediaCard.jsx
import React from "react";
import PropTypes from "prop-types";
import { EyeOpenIcon } from "@radix-ui/react-icons";
import { getTipoColor } from "../utils/colors";

export default function MediaCard({
  id,
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
  const bgTipo = getTipoColor(tipo);

  return (
    <article className="flex flex-wrap w-full min-w-30 max-w-60 bg-white m-1 shadow rounded overflow-hidden hover:shadow-lg transition duration-200 ease-in-out relative">
      {viendo && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-60 rounded-full p-1 z-50">
          <EyeOpenIcon className="text-white w-3 h-3" />
        </div>
      )}

      <button
        onClick={() => onVerDetalle({ id, media_type })}
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
          <span className="inline-block text-xs text-gray-700 font-semibold text-right w-full line-clamp-1">
            {proximoEpisodio.nombre}
          </span>
        </div>
      )}
    </article>
  );
}

MediaCard.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  nombre: PropTypes.string.isRequired,
  imagen: PropTypes.string,
  anio: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tipo: PropTypes.string,
  media_type: PropTypes.string.isRequired,
  favorito: PropTypes.bool,
  viendo: PropTypes.bool,
  conProximos: PropTypes.bool,
  onVerDetalle: PropTypes.func.isRequired,
  proximoEpisodio: PropTypes.shape({
    temporada: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    episodio: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    nombre: PropTypes.string,
  }),
};
