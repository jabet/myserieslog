import { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { BellIcon } from "@radix-ui/react-icons";
import useNotificacionesUsuario from "../hooks/useNotificacionesUsuario";
import * as Popover from "@radix-ui/react-popover";

export default function NotificacionesBell({ usuario }) {
  const { notificaciones, refetch } = useNotificacionesUsuario(usuario);
  const [open, setOpen] = useState(false);

  const noLeidas = notificaciones.filter((n) => !n.leida);

  const marcarComoLeida = async (id) => {
    await supabase
      .from("notificaciones_usuario")
      .update({ leida: true })
      .eq("id", id);
    refetch();
  };

  const borrarNotificacion = async (id) => {
    await supabase.from("notificaciones_usuario").delete().eq("id", id);
    refetch();
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button className="relative" aria-label="Notificaciones">
          <BellIcon className="w-6 h-6" />
          {noLeidas.length > 0 && (
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="end"
          className="w-80 bg-white shadow-lg rounded p-4 z-50"
          sideOffset={8}
        >
          <h3 className="font-bold mb-2 text-black">Notificaciones</h3>
          <div className="max-h-96 overflow-y-auto">
            {notificaciones.length === 0 ? (
              <p className="text-gray-500">No tienes notificaciones.</p>
            ) : (
              <ul>
                {notificaciones.map((n) => (
                  <li key={n.id} className="mb-2 flex items-start gap-2">
                    <a
                      href={n.url}
                      className={`flex-1 block ${
                        n.leida ? "text-gray-400" : "font-semibold"
                      }`}
                      onClick={async () => {
                        await marcarComoLeida(n.id);
                        setOpen(false);
                      }}
                    >
                      <div>{n.titulo}</div>
                      <div className="text-xs text-gray-500">{n.mensaje}</div>
                    </a>
                    {!n.leida && (
                      <button
                        className="text-xs text-blue-600 underline ml-2"
                        title="Marcar como leído"
                        onClick={async (e) => {
                          e.preventDefault();
                          await marcarComoLeida(n.id);
                        }}
                      >
                        Marcar como leído
                      </button>
                    )}
                    <button
                      className="text-xs text-red-600 underline ml-2"
                      title="Borrar notificación"
                      onClick={async (e) => {
                        e.preventDefault();
                        await borrarNotificacion(n.id);
                      }}
                    >
                      Borrar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
