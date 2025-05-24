// src/components/FiltrosCatalogo.jsx
import React, { useState, useEffect } from "react";

export default function FiltrosCatalogo({
  tipos = [],
  anios = [],
  estados = [],
  onFiltrar,
}) {
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroAnio, setFiltroAnio] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroTexto, setFiltroTexto] = useState("");

  useEffect(() => {
    if (onFiltrar) {
      onFiltrar({
        tipo: filtroTipo,
        anio: filtroAnio,
        estado: filtroEstado,
        texto: filtroTexto,
      });
    }
  }, [filtroTipo, filtroAnio, filtroEstado, filtroTexto]);

  return (
    <div className="mb-6 flex flex-col md:flex-row gap-4">
      <select
        className="border px-3 py-2 rounded"
        value={filtroTipo}
        onChange={(e) => setFiltroTipo(e.target.value)}
      >
        <option value="">Todos los tipos</option>
        {tipos.map((t) => (
          <option key={t} value={t}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </option>
        ))}
      </select>

      <select
        className="border px-3 py-2 rounded"
        value={filtroAnio}
        onChange={(e) => setFiltroAnio(e.target.value)}
      >
        <option value="">Todos los años</option>
        {anios.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>

      <select
        className="border px-3 py-2 rounded"
        value={filtroEstado}
        onChange={(e) => setFiltroEstado(e.target.value)}
      >
        <option value="">Todos los estados</option>
        {estados.map((e) => (
          <option key={e} value={e}>
            {e.charAt(0).toUpperCase() + e.slice(1)}
          </option>
        ))}
      </select>
         <input
        type="text"
        className="border px-3 py-2 rounded"
        placeholder="Buscar por nombre..."
        value={filtroTexto}
        onChange={(e) => setFiltroTexto(e.target.value)}
      />
    </div>
  );
}
