export default function MediaCard({
  nombre,
  imagen,
  anio,
  favorito,
  onEliminar,
  onVerDetalle,
}) {
  return (
    <div className="bg-white rounded shadow p-4 hover:shadow-md transition cursor-pointer">
      {imagen && (
        <img src={imagen} alt={nombre} className="w-full rounded mb-2" />
      )}
      <h3 className="text-lg font-semibold">{nombre}</h3>
      <p className="text-sm text-gray-600">{anio}</p>
      <div className="mt-2 flex justify-between">
        <button
          onClick={onVerDetalle}
          className="text-blue-600 hover:underline"
        >
          Ver más
        </button>
        <button onClick={onEliminar} className="text-red-600 hover:underline">
          Eliminar
        </button>
      </div>
    </div>
  );
}
