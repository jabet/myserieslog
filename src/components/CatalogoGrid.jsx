// src/components/CatalogoGrid.jsx
import MediaCard from "./MediaCard";
import React from "react";

export default function CatalogoGrid({ catalogo, className = "" }) {
  if (!Array.isArray(catalogo)) return null;

  return (
    <div
      className={`
        flex flex-nowrap overflow-x-auto gap-4 items-start
        scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 m-auto
        sm:overflow-x-auto sm:flex-nowrap
        lg:grid-cols-5
        ${className}
      `}
    >
      {catalogo.map((item) => (
        <MediaCard
          key={item.id_catalogo || item.id}
          nombre={item.nombre}
          imagen={item.imagen}
          anio={item.anio}
          tipo={item.tipo}
          media_type={item.media_type}
          favorito={item.favorito}
          viendo={item.estado === "viendo"}
          conProximos={item.conProximos}
          proximoEpisodio={item.proximoEpisodio}
          onVerDetalle={() =>
            (window.location.href = `/#/detalle/${item.media_type}/${item.id}`)
          }
        />
      ))}
    </div>
  );
}
