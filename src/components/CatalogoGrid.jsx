// src/components/CatalogoGrid.jsx
import MediaCard from "./MediaCard";
import React from "react";

export default function CatalogoGrid({ catalogo, onEliminar }) {
  if (!Array.isArray(catalogo)) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start justify-items-center max-w-7xl m-auto">
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
          onEliminar={() => item.id_catalogo && onEliminar(item.id_catalogo)}
          onVerDetalle={() =>
            (window.location.href = `/#/detalle/${item.media_type}/${item.id}`)
          }
        />
      ))}
    </div>
  );
}
