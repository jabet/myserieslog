import { useState } from "react";
import { supabase } from "../../utils/supabaseClient";

const LOGRO_DEMO = {
  emoji: "🏆",
  nombre: "Logro de Ejemplo",
  descripcion: "Has desbloqueado un logro de prueba.",
};

export default function AdminEnviarNotificacion({
  usuarios,
  onNotificacionEnviada,
  series = [],
}) {
  const [notiUserId, setNotiUserId] = useState("");
  const [notiTitulo, setNotiTitulo] = useState("");
  const [notiMensaje, setNotiMensaje] = useState("");
  const [notiUrl, setNotiUrl] = useState("");
  const [notiSerieId, setNotiSerieId] = useState("");
  const [notiStatus, setNotiStatus] = useState("");

  const userOptions = (usuarios || []).map((u) => (
    <option key={u.user_id} value={u.user_id}>
      {u.nick ? u.nick : u.user_id} {u.rol ? `(${u.rol})` : ""}
    </option>
  ));

  const serieOptions = [
    <option key="" value="">
      Sin imagen de serie
    </option>,
    ...(series || []).map((s) => (
      <option key={s.id} value={s.id}>
        {s.nombre} ({s.id})
      </option>
    )),
  ];

  const enviarNotificacion = async (e) => {
    e.preventDefault();
    if (!notiUserId) {
      setNotiStatus("Debes seleccionar un usuario.");
      return;
    }
    setNotiStatus("Enviando...");

    let imagen = null;
    if (notiSerieId) {
      // Busca la serie seleccionada y usa su imagen
      const serie = series.find((s) => String(s.id) === String(notiSerieId));
      imagen = serie?.imagen || null;
    }

    const { error } = await supabase.from("notificaciones_usuario").insert([
      {
        user_id: notiUserId,
        titulo: notiTitulo,
        mensaje: notiMensaje,
        url: notiUrl,
        imagen,
      },
    ]);
    if (error) {
      setNotiStatus("Error al enviar: " + error.message);
    } else {
      setNotiStatus("¡Notificación enviada!");
      setNotiTitulo("");
      setNotiMensaje("");
      setNotiUrl("");
      setNotiUserId("");
      setNotiSerieId("");
      if (onNotificacionEnviada) onNotificacionEnviada();
    }
  };

  // NUEVO: Simular notificación de logro
  const simularNotificacionLogro = async () => {
    if (!notiUserId) {
      setNotiStatus("Selecciona un usuario para simular el logro.");
      return;
    }
    setNotiStatus("Enviando notificación de logro...");
    const { error } = await supabase.from("notificaciones_usuario").insert([
      {
        user_id: notiUserId,
        titulo: "¡Nuevo logro desbloqueado!",
        mensaje: `${LOGRO_DEMO.emoji} ${LOGRO_DEMO.nombre}: ${LOGRO_DEMO.descripcion}`,
        url: "/perfil#logros",
        imagen: "🎉",
      },
    ]);
    if (error) {
      setNotiStatus("Error al enviar: " + error.message);
    } else {
      setNotiStatus("¡Notificación de logro enviada!");
      if (onNotificacionEnviada) onNotificacionEnviada();
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 p-4 bg-white rounded shadow">
      <h2 className="font-bold mb-2">Enviar notificación</h2>
      <form onSubmit={enviarNotificacion} className="flex flex-col gap-2">
        <select
          value={notiUserId}
          onChange={(e) => setNotiUserId(e.target.value)}
          className="border px-2 py-1 rounded"
          required
        >
          <option value="">Selecciona usuario</option>
          {userOptions}
        </select>
        <input
          type="text"
          placeholder="Título"
          value={notiTitulo}
          onChange={(e) => setNotiTitulo(e.target.value)}
          className="border px-2 py-1 rounded"
          required
        />
        <input
          type="text"
          placeholder="Mensaje"
          value={notiMensaje}
          onChange={(e) => setNotiMensaje(e.target.value)}
          className="border px-2 py-1 rounded"
          required
        />
        <input
          type="text"
          placeholder="URL destino (opcional)"
          value={notiUrl}
          onChange={(e) => setNotiUrl(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <select
          value={notiSerieId}
          onChange={(e) => setNotiSerieId(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          {serieOptions}
        </select>
        <button
          type="submit"
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          Enviar notificación
        </button>
      </form>
      <button
        className="mt-3 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 w-full"
        onClick={simularNotificacionLogro}
        type="button"
      >
        Simular notificación de logro
      </button>
      {notiStatus && <div className="mt-2 text-sm">{notiStatus}</div>}
    </div>
  );
}
