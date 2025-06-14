import { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { BellIcon } from "@radix-ui/react-icons";
import useNotificacionesUsuario from "../hooks/useNotificacionesUsuario";
import * as Popover from "@radix-ui/react-popover";

export default function NotificacionesBell({ usuario }) {
  const { notificaciones: initialNotificaciones, refetch } =
    useNotificacionesUsuario(usuario);
  const [open, setOpen] = useState(false);
  const [loadingBorrar, setLoadingBorrar] = useState(false);
  const [errorBorrar, setErrorBorrar] = useState("");
  const [notificaciones, setNotificaciones] = useState(initialNotificaciones);

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

  const borrarTodasNotificaciones = async () => {
    if (!window.confirm("¿Seguro que quieres borrar todas las notificaciones?"))
      return;
    setLoadingBorrar(true);
    setErrorBorrar("");
    try {
      const user = await supabase.auth.getUser();
      const user_id = user.data?.user?.id;
      if (!user_id) {
        setErrorBorrar("No se ha encontrado el usuario.");
        setLoadingBorrar(false);
        return;
      }
      const { error } = await supabase
        .from("notificaciones_usuario")
        .delete()
        .eq("user_id", user_id);

      if (error) {
        setErrorBorrar("Error al borrar las notificaciones.");
      } else {
        setNotificaciones([]);
      }
    } catch (err) {
      setErrorBorrar("Error inesperado al borrar las notificaciones.");
    }
    setLoadingBorrar(false);
  };

  const marcarTodasLeidas = async () => {
    const ids = noLeidas.map((n) => n.id);
    if (ids.length > 0) {
      await supabase
        .from("notificaciones_usuario")
        .update({ leida: true })
        .in("id", ids);
      refetch();
    }
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button className="relative" aria-label="Notificaciones">
          <BellIcon className="w-5 h-5" />
          {noLeidas.length > 0 && (
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="end"
          className="w-80 bg-white shadow-lg rounded p-2 z-50"
          sideOffset={8}
        >
          <h3 className="font-bold mb-2 text-black">Notificaciones</h3>
          {/* Botón para marcar todas como leídas */}
          {noLeidas.length > 0 && (
            <button
              className="mb-2 text-xs text-blue-700 underline"
              onClick={async () => {
                const ids = noLeidas.map((n) => n.id);
                if (ids.length > 0) {
                  await supabase
                    .from("notificaciones_usuario")
                    .update({ leida: true })
                    .in("id", ids);
                  refetch();
                }
              }}
            >
              Marcar todas como leídas
            </button>
          )}
          <div className="flex gap-2 mb-2">
            <a
              href="#"
              className="text-gray-500 cursor-pointer text-xs hover:text-blue-600"
              onClick={(e) => {
                e.preventDefault();
                marcarTodasLeidas();
              }}
            >
              Leer todas
            </a>
            <a
              href="#"
              className="text-gray-500 cursor-pointer text-xs hover:text-red-600"
              onClick={(e) => {
                e.preventDefault();
                borrarTodasNotificaciones();
              }}
            >
              Borrar todas
            </a>
          </div>
          {errorBorrar && <p className="text-red-500 text-xs">{errorBorrar}</p>}
          <div className="max-h-96 overflow-y-auto">
            {notificaciones.length === 0 ? (
              <p className="text-gray-500 text-sm">No tienes notificaciones.</p>
            ) : (
              <ul>
                {notificaciones.map((n) => (
                  <li
                    key={n.id}
                    className={`mb-2 flex items-start gap-2 rounded transition-all bg-white ${
                      !n.leida ? "border-l-4 border-red-500" : "border-l-0"
                    }`}
                    style={{ borderLeftWidth: !n.leida ? 3 : 0 }}
                  >
                    {/* Imagen a la izquierda */}
                    <img
                      src={
                        n.imagen &&
                        (n.imagen.startsWith("http") ||
                          n.imagen.startsWith("/"))
                          ? n.imagen
                          : undefined
                      }
                      alt="Notificación"
                      className="w-10 h-auto object-cover rounded mr-2 flex-shrink-0"
                      style={{
                        display:
                          n.imagen &&
                          (n.imagen.startsWith("http") ||
                            n.imagen.startsWith("/"))
                            ? "block"
                            : "none",
                      }}
                    />
                    {n.imagen &&
                      !(
                        n.imagen.startsWith("http") || n.imagen.startsWith("/")
                      ) && (
                        <span className="w-10 h-10 flex items-center justify-center text-3xl mr-2">
                          {n.imagen}
                        </span>
                      )}
                    <div className="flex-1">
                      <a
                        href={n.url}
                        className={`block ${
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
                      <div className="flex gap-2 mt-1">
                        {!n.leida && (
                          <button
                            className="text-xs text-blue-600 underline"
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
                          className="text-xs text-red-600 underline"
                          title="Borrar notificación"
                          onClick={async (e) => {
                            e.preventDefault();
                            await borrarNotificacion(n.id);
                          }}
                        >
                          Borrar
                        </button>
                      </div>
                    </div>
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
