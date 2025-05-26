import Navbar from "../components/Navbar";
import CatalogoGrid from "../components/CatalogoGrid";
import Footer from "../components/Footer";
import FiltrosCatalogo from "../components/FiltrosCatalogo";
import useCatalogoUsuario from "../hooks/useCatalogoUsuario";
import useProximasEmisiones from "../hooks/useProximasEmisiones";
import ProximasEmisiones from "../components/ProximasEmisiones";
import useUsuario from "../hooks/useUsuario";
import { Card } from "@radix-ui/themes";

export default function App() {
  const { usuario, idioma } = useUsuario();
  const {
    catalogo,
    eliminarItem,
    tiposDisponibles,
    aniosDisponibles,
    estadosDisponibles,
    aplicarFiltros,
    loading,
  } = useCatalogoUsuario(usuario, idioma);
  const { proximos, loading: loadingProximos } = useProximasEmisiones(usuario);

  // --- Agrupaciones ---
  // IDs de series con próximos capítulos
  const idsProximos = new Set(proximos.map((p) => p.contenido_id));
  // Series que estoy viendo (estado === "viendo")
  const viendo = catalogo.filter(
    (item) => item.estado === "viendo" && !idsProximos.has(item.id)
  );
  // Series con próximos capítulos
  const conProximos = catalogo.filter((item) => idsProximos.has(item.id));
  // El resto del catálogo (ni viendo ni próximos)
  const resto = catalogo.filter(
    (item) => !conProximos.includes(item) && !viendo.includes(item)
  );

  return (
    <div className="min-h-screen flex flex-col grid-rows-[auto_1fr_auto]">
      <Navbar />
      <main className="flex-1 pt-20 px-4">
        <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">
          {/* Columna principal: filtros y catálogo */}
          <div className="flex-1 min-w-0">
            <FiltrosCatalogo
              tipos={tiposDisponibles}
              anios={aniosDisponibles}
              estados={estadosDisponibles}
              onFiltrar={aplicarFiltros}
            />
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 justify-items-center">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="p-4">
                    <div className="w-full h-52 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-20 bg-gray-200 rounded animate-pulse mb-1" />
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                  </Card>
                ))}
              </div>
            ) : (
              <>
                <section className="mb-8">
                  <h2 className="text-xl font-bold mb-2">
                    Nuevos capítulos
                  </h2>
                  <CatalogoGrid
                    catalogo={conProximos}
                    onEliminar={eliminarItem}
                  />
                </section>
                <section className="mb-8">
                  <h2 className="text-xl font-bold mb-2">
                    Continuar viendo
                  </h2>
                  <CatalogoGrid catalogo={viendo} onEliminar={eliminarItem} />
                </section>
                <section className="sm:flex-nowrap sm:sm:overflow-x-visible sm:min-w-320">
                  <h2 className="text-xl font-bold mb-2">Mi catálogo</h2>
                  <CatalogoGrid catalogo={resto} onEliminar={eliminarItem} />
                </section>
              </>
            )}
          </div>
          {/* Columna lateral: próximas emisiones */}
          <aside className="w-full md:w-80 shrink-0">
            <ProximasEmisiones emisiones={proximos} loading={loadingProximos} />
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
