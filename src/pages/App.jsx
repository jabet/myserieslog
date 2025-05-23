import { useState } from "react";
import Navbar from "../components/Navbar";
import CatalogoGrid from "../components/CatalogoGrid";
import Footer from "../components/Footer";
import FiltrosCatalogo from "../components/FiltrosCatalogo";
import useCatalogoUsuario from "../hooks/useCatalogoUsuario";
import useIdiomaPreferido from "../hooks/useIdiomaPreferido";
import useUsuario from "../hooks/useUsuario";
import { Card } from "@radix-ui/themes";

export default function App() {
  const { usuario } = useUsuario();
  const {
    catalogo,
    eliminarItem,
    tiposDisponibles,
    aniosDisponibles,
    estadosDisponibles,
    aplicarFiltros,
    loading, // <-- asegúrate de exportar esto en tu hook
  } = useCatalogoUsuario(usuario, useIdiomaPreferido);

  return (
    <div className="min-h-screen flex flex-col min-h-screem[100dvh] grid-rows-[auto_1fr_auto]">
      <Navbar />
      <main className="flex-1 pt-20 px-4">
        <FiltrosCatalogo
          tipos={tiposDisponibles}
          anios={aniosDisponibles}
          estados={estadosDisponibles}
          onFiltrar={aplicarFiltros}
        />
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-4">
                <div className="w-full h-40 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-1" />
                <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
              </Card>
            ))}
          </div>
        ) : (
          <CatalogoGrid catalogo={catalogo} onEliminar={eliminarItem} />
        )}
      </main>
      <Footer />
    </div>
  );
}
