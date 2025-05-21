import { useEffect, useState } from "react";

export default function FiltrosCatalogo({ catalogo, onFiltrar }) {
  const [tipo, setTipo] = useState("");
  const [anio, setAnio] = useState("");
  const [favoritos, setFavoritos] = useState(false);
  const [finalizadas, setFinalizadas] = useState(false);
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [aniosDisponibles, setAniosDisponibles] = useState([]);
  const [tiposDisponibles, setTiposDisponibles] = useState([]);

  useEffect(() => {
    setTiposDisponibles(
      Array.from(new Set(catalogo.map((c) => c.tipo))).sort()
    );
    setAniosDisponibles(
      Array.from(new Set(catalogo.map((c) => c.anio))).sort((a, b) => b - a)
    );
  }, [catalogo]);

  useEffect(() => {
    let filtrado = [...catalogo];
    if (tipo) filtrado = filtrado.filter((c) => c.tipo === tipo);
    if (anio) filtrado = filtrado.filter((c) => c.anio === anio);
    if (favoritos) filtrado = filtrado.filter((c) => c.favorito);
    if (finalizadas) filtrado = filtrado.filter((c) => c.finalizada);
    if (estadoFiltro)
      filtrado = filtrado.filter((c) => c.estado === estadoFiltro);
    onFiltrar(filtrado);
  }, [tipo, anio, favoritos, finalizadas, estadoFiltro, catalogo, onFiltrar]);

  return (
    <section className="w-full flex justify-center">
      <div className="flex flex-wrap gap-4 items-end mb-6">
        <div>
          <label className="block text-sm mb-1">Tipo</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="px-2 py-1 border rounded"
          >
            <option value="">Todos</option>
            {tiposDisponibles.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Año</label>
          <select
            value={anio}
            onChange={(e) => setAnio(e.target.value)}
            className="px-2 py-1 border rounded"
          >
            <option value="">Todos</option>
            {aniosDisponibles.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="favoritos"
            checked={favoritos}
            onChange={(e) => setFavoritos(e.target.checked)}
          />
          <label htmlFor="favoritos" className="text-sm">
            Solo favoritos
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="finalizadas"
            checked={finalizadas}
            onChange={(e) => setFinalizadas(e.target.checked)}
          />
          <label htmlFor="finalizadas" className="text-sm">
            Finalizadas
          </label>
        </div>
        <div>
          <label className="block text-sm mb-1">Mi estado</label>
          <select
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
            className="px-2 py-1 border rounded"
          >
            <option value="">Todos</option>
            <option value="pendiente">Quiero verla</option>
            <option value="viendo">Viéndola</option>
            <option value="vista">Ya la he visto</option>
          </select>
        </div>
        <button
          onClick={() => {
            setTipo("");
            setAnio("");
            setFavoritos(false);
            setFinalizadas(false);
            setEstadoFiltro("");
          }}
          className="ml-auto text-sm text-blue-600 hover:underline"
        >
          Limpiar filtros
        </button>
      </div>
    </section>
  );
}
