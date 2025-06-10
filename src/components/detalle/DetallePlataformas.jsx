import SelectorEstado from "../SelectorEstado";
import SelectorPlataformas from "../SelectorPlataformas";
import { PLATAFORMAS_DISPONIBLES } from "../../constants/plataformas";
import { IconosPlataformas } from "../IconosPlataformas";

export default function DetallePlataformas({
  estadoCatalogo,
  cambiarEstado,
  plataformas,
  setPlataformas,
}) {
  return (
    <div className="mb-8 bg-gray-50 rounded-lg p-6 shadow-inner">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <label className="text-sm font-medium mr-2">Estado:</label>
          <SelectorEstado
            estado={estadoCatalogo?.estado}
            onChange={cambiarEstado}
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">
            Plataformas donde la ves:
          </label>
          <SelectorPlataformas
            plataformasSeleccionadas={plataformas}
            onChange={setPlataformas}
          />
          {plataformas.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {plataformas.map((plataformaId) => {
                const plataforma = PLATAFORMAS_DISPONIBLES.find(
                  (p) => p.id === plataformaId
                );
                const IconComponent = IconosPlataformas[plataformaId];
                return plataforma ? (
                  <span
                    key={plataforma.id}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-white text-gray-800 border"
                  >
                    {IconComponent && (
                      <div className="w-4 h-4">
                        <IconComponent />
                      </div>
                    )}
                    {plataforma.nombre}
                  </span>
                ) : null;
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}