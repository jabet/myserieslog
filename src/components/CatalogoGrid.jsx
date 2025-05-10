import MediaCard from "./MediaCard";

export default function CatalogoGrid({ catalogo, onEliminar }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
