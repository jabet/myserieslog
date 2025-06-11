import { StarIcon, StarFilledIcon } from "@radix-ui/react-icons";
import Estrellas from "../Estrella";
import PuntuacionTMDb from "../PuntuacionTMDb";

export default function DetalleHeader({
  item,
  enCatalogo,
  favorito,
  toggleFavorito,
  estadoCatalogo,
  cambiarPuntuacion,
}) {
  return (
    <div className="flex flex-col md:flex-row gap-8 bg-white rounded-xl shadow-lg p-6 mb-8">
      {item.imagen && (
        <img
          src={item.imagen}
          alt={item.nombre}
          className="w-64 h-96 object-cover rounded-lg shadow-md mx-auto md:mx-0"
        />
      )}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{item.nombre}</h1>
            {enCatalogo && (
              <button
                onClick={toggleFavorito}
                className="ml-2"
                aria-label={favorito ? "Quitar de favoritos" : "Añadir a favoritos"}
              >
                {favorito ? (
                  <StarFilledIcon className="w-7 h-7 text-yellow-500" />
                ) : (
                  <StarIcon className="w-7 h-7 text-gray-400" />
                )}
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-4 mb-4 text-gray-700 text-sm">
            <span className="bg-gray-100 px-3 py-1 rounded-full">
              <strong>Año:</strong> {item.anio || "Desconocido"}
            </span>
            <span className="bg-gray-100 px-3 py-1 rounded-full">
              <strong>Tipo:</strong>{" "}
              {item.tipo ||
                (item.media_type === "tv" ? "Serie" : "Película")}
            </span>
            {item.finalizada !== undefined && (
              <span className="bg-gray-100 px-3 py-1 rounded-full">
                <strong>Estado:</strong>{" "}
                {item.finalizada ? "Finalizada" : "En emisión"}
              </span>
            )}
          </div>
          <p className="mb-4 text-gray-800">
            <strong>Sinopsis:</strong> {item.sinopsis}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Estrellas
            valor={estadoCatalogo?.puntuacion || 0}
            onChange={cambiarPuntuacion}
          />
          <span className="text-sm text-gray-700">
            {estadoCatalogo?.puntuacion || 0} / 5
          </span>
          <PuntuacionTMDb puntuacion={item.puntuacion} />
        </div>
      </div>
    </div>
  );
}