import React from "react";

export default function LogroItem({
  emoji,
  nombre,
  fecha,
  categoria,
  color,
  descripcion,
}) {
  return (
    <div
      className={`p-4 rounded-lg border flex items-start gap-3 ${color}`}
      title={descripcion}
    >
      <span className="text-2xl">{emoji}</span>
      <div className="flex-1">
        <h5 className="font-medium">{nombre}</h5>
        <p className="text-xs text-gray-500 mb-1">{categoria}</p>
        {fecha && (
          <span className="text-xs text-gray-400 block">
            {new Date(fecha).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}
