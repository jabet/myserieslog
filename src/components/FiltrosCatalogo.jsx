import React, { useState, useEffect } from "react";

export default function FiltrosCatalogo({ catalogo, onFiltrar }) {
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroAnio, setFiltroAnio] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [listaAnios, setListaAnios] = useState([]);

  useEffect(() => {
    // Calcula años únicos para dropdown
    const anios = Array.from(new Set(catalogo.map((c) => c.anio))).sort();
    setListaAnios(anios);
    // Inicialmente, lanza filtro inicial (sin filtros)
    onFiltrar(catalogo);
  }, [catalogo]);

  useEffect(() => {
    let res = catalogo;

    if (filtroTipo) {
      res = res.filter((c) => c.tipo === filtroTipo);
    }
    if (filtroAnio) {
      res = res.filter((c) => c.anio === filtroAnio);
    }
    if (filtroEstado) {
      res = res.filter((c) => c.estado === filtroEstado);
    }

    onFiltrar(res);
  }, [filtroTipo, filtroAnio, filtroEstado, catalogo]);

  return (
    <div className="flex flex-wrap gap-4 mb-6 items-center">
      {/* Tipo */}
      <div>
        <label className="text-sm block mb-1">Tipo</label>
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="">Todos</option>
          <option value="Serie">Serie</option>
          <option value="Película">Película</option>
          <option value="Anime">Anime</option>
          <option value="K-Drama">K-Drama</option>
        </select>
      </div>

      {/* Año */}
      <div>
        <label className="text-sm block mb-1">Año</label>
        <select
          value={filtroAnio}
          onChange={(e) => setFiltroAnio(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="">Todos</option>
          {listaAnios.map((ay) => (
            <option key={ay} value={ay}>
              {ay}
            </option>
          ))}
        </select>
      </div>

      {/* Estado */}
      <div>
        <label className="text-sm block mb-1">Estado</label>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="">Todos</option>
          <option value="pendiente">Quiero verla</option>
          <option value="viendo">Viéndola</option>
          <option value="vista">Ya la he visto</option>
        </select>
      </div>
    </div>
  );
}
