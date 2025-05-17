export default function ProgresoTemporada({ total, vistos }) {
  const porcentaje = total > 0 ? Math.round((vistos / total) * 100) : 0;

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-1">
        <span>
          {vistos} / {total} episodios vistos
        </span>
        <span>{porcentaje}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-green-500 h-3 rounded-full transition-all duration-300"
          style={{ width: `${porcentaje}%` }}
        ></div>
      </div>
    </div>
  );
}
