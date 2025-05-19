import MediaCard from "./MediaCard";
import React from "react";

export default function CatalogoGrid({ catalogo, onEliminar }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-6 gap-4 items-center justify-items-center relative ">
      {catalogo.map((item) => (
        <MediaCard
          key={item.id_catalogo}
          nombre={item.nombre}
          imagen={item.imagen}
          anio={item.anio}
          favorito={item.favorito}
          onEliminar={() => onEliminar(item.id_catalogo)}
          onVerDetalle={() => (window.location.href = `/detalle/${item.id}`)}
        />
      ))}
    </div>
  );
}
