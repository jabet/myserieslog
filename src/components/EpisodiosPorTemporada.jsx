export default function EpisodiosPorTemporada({ datos, vistos, toggle }) {
  return Object.entries(datos).map(([temp, episodios]) => {
    const vistosTemp = vistos.filter(v => v.temporada === parseInt(temp));
    return (
      <div key={temp}>
        <h2 className="text-lg font-bold mb-2">
          Temporada {temp} ({vistosTemp.length}/{episodios.length} vistos)
        </h2>
        <ul className="space-y-2">
          {episodios.map(ep => (
            <li key={ep.id} className="flex gap-3 items-start">
              {ep.imagen && <img src={ep.imagen} className="w-24 h-auto rounded" />}
              <div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={vistos.some(v => v.episodio_id === ep.id)}
                    onChange={() => toggle(ep.id)}
                  />
                  <strong>{ep.episodio}. {ep.nombre}</strong>
                </div>
                <p className="text-sm text-gray-500">{ep.fecha_emision}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  });
}
