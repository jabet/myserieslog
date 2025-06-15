import React from "react";

export default function LogroItem({
  emoji,
  nombre,
  fecha,
  categoria,
  color,
  descripcion,
  porcentaje = 0, // <-- nuevo prop
  conseguido = false,
}) {
  return (
    <div className={`p-4 rounded-lg border ${color}`}>
      <div className="flex items-center justify-between">
        <div className="text-2xl">{emoji}</div>
        {fecha && <div className="text-xs text-gray-500">{fecha}</div>}
      </div>
      <h3 className="mt-2 text-lg font-semibold">{nombre}</h3>
      <p className="text-sm text-gray-600">{descripcion}</p>
      {/* MUESTRA EL PORCENTAJE */}
      <div className="mt-2 text-sm">
        Progreso: <span className="font-medium">{porcentaje}%</span>
      </div>
    </div>
  );
}
