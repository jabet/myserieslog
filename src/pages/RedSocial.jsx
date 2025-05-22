// src/pages/RedSocial.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { Switch } from "@radix-ui/react-switch";
import Navbar from "../components/Navbar";

export default function RedSocial() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);

  // búsqueda de usuarios para invitar
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [msgBusqueda, setMsgBusqueda] = useState("");

  // solicitudes entrantes y salientes
  const [entrantes, setEntrantes] = useState([]);
  const [salientes, setSalientes] = useState([]);

  // lista de amigos aceptados
  const [amigos, setAmigos] = useState([]);

  // al montar, obtenemos usuario y cargamos datos
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUsuario(user);
      cargarSolicitudes(user.id);
      cargarAmigos(user.id);
    });
  }, []);

  // buscar usuarios para invitar
  useEffect(() => {
    if (!query || query.length < 2) {
      setResultados([]);
      return;
    }
    setBuscando(true);
    const timeout = setTimeout(async () => {
      const { data, error } = await supabase
        .from("usuarios")
        .select("id, nick")
        .ilike("nick", `%${query}%`)
        .neq("id", usuario.id)
        .limit(10);
      if (error) {
        console.error("Buscar usuarios:", error);
        setMsgBusqueda("Error al buscar");
      } else {
        setResultados(data);
        setMsgBusqueda("");
      }
      setBuscando(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, usuario]);

  // cargar solicitudes entrantes y salientes
  async function cargarSolicitudes(uid) {
    const [{ data: inReq }, { data: outReq }] = await Promise.all([
      supabase
        .from("amistades")
        .select("id, usuario1(id,nick)")
        .eq("usuario2", uid)
        .eq("estado", "pendiente"),
      supabase
        .from("amistades")
        .select("id, usuario2(id,nick)")
        .eq("usuario1", uid)
        .eq("estado", "pendiente"),
    ]);
    setEntrantes(inReq || []);
    setSalientes(outReq || []);
  }

  // cargar lista de amigos aceptados con su flag de compartición
  async function cargarAmigos(uid) {
    const { data, error } = await supabase
      .from("amistades")
      .select(
        `
        id,
        usuario1,
        usuario2,
        comparte_catalogo,
        usuarios1:usuarios!amistades_usuario1_fkey(id,nick),
        usuarios2:usuarios!amistades_usuario2_fkey(id,nick)
      `
      )
      .or(
        `and(usuario1.eq.${uid},estado.eq.aceptada),` +
          `and(usuario2.eq.${uid},estado.eq.aceptada)`
      );
    if (error) {
      console.error("Cargar amigos:", error);
      return;
    }
    const lista = (data || []).map((a) => {
      const esYo1 = a.usuario1 === uid;
      const arr = esYo1 ? a.usuarios2 : a.usuarios1;
      const amigo =
        Array.isArray(arr) && arr.length > 0
          ? arr[0]
          : { id: esYo1 ? a.usuario2 : a.usuario1, nick: "—" };
      return {
        amistadId: a.id,
        amigoId: amigo.id,
        nick: amigo.nick,
        comparte: a.comparte_catalogo,
      };
    });
    setAmigos(lista);
  }

  // enviar invitación (chequeo de duplicados)
  async function enviarInvitacion(destinoId) {
    if (!usuario) {
      setMsgBusqueda("Inicia sesión primero");
      return;
    }
    const { data: existente } = await supabase
      .from("amistades")
      .select("estado")
      .or(
        `and(usuario1.eq.${usuario.id},usuario2.eq.${destinoId}),` +
          `and(usuario1.eq.${destinoId},usuario2.eq.${usuario.id})`
      )
      .maybeSingle();
    if (existente) {
      const msgs = {
        pendiente: "Ya hay una solicitud pendiente.",
        aceptada: "Ya sois amigos.",
        rechazada: "Ya existe relación previa.",
      };
      setMsgBusqueda(msgs[existente.estado] || "Relación existente");
      return;
    }
    const { error } = await supabase.from("amistades").insert([
      {
        usuario1: usuario.id,
        usuario2: destinoId,
        estado: "pendiente",
        comparte_catalogo: false,
      },
    ]);
    if (error) {
      console.error("Invitar:", error);
      setMsgBusqueda("Error al enviar invitación");
    } else {
      setMsgBusqueda("Invitación enviada 🎉");
      cargarSolicitudes(usuario.id);
    }
    setTimeout(() => setMsgBusqueda(""), 2000);
  }

  // responder a solicitud entrante
  async function responder(id, aceptar) {
    await supabase
      .from("amistades")
      .update({ estado: aceptar ? "aceptada" : "rechazada" })
      .eq("id", id);
    cargarSolicitudes(usuario.id);
    cargarAmigos(usuario.id);
  }

  // cancelar invitación enviada
  async function cancelar(id) {
    await supabase
      .from("amistades")
      .delete()
      .eq("id", id)
      .eq("usuario1", usuario.id)
      .eq("estado", "pendiente");
    cargarSolicitudes(usuario.id);
  }

  // toggle compartir catálogo por amistad
  async function toggleCompartir(amistadId, actual) {
    const { error } = await supabase
      .from("amistades")
      .update({ comparte_catalogo: !actual })
      .eq("id", amistadId);
    if (error) console.error("Toggle compartir:", error);
    else
      setAmigos((prev) =>
        prev.map((a) =>
          a.amistadId === amistadId ? { ...a, comparte: !actual } : a
        )
      );
  }

  return (
    <>
      <Navbar />
      <div className="pt-20 px-4 max-w-3xl mx-auto space-y-8">
        {/* Buscar usuarios */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Buscar amigos</h2>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              className="flex-1 border px-3 py-2 rounded"
              placeholder="Nick..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {buscando && <p>Cargando...</p>}
          {msgBusqueda && <p className="text-sm text-red-600">{msgBusqueda}</p>}
          <ul className="space-y-2">
            {resultados.map((u) => (
              <li
                key={u.id}
                className="flex items-center justify-between bg-white p-2 rounded shadow"
              >
                <span>{u.nick}</span>
                <button
                  onClick={() => enviarInvitacion(u.id)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Invitar
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Solicitudes */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Solicitudes</h2>
          <div className="mb-4">
            <h3 className="font-medium mb-2">Entrantes</h3>
            {entrantes.length === 0 ? (
              <p className="text-gray-600">Ninguna</p>
            ) : (
              entrantes.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between bg-white p-2 rounded shadow mb-2"
                >
                  <span>{r.usuario1.nick}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => responder(r.id, true)}
                      className="px-2 py-1 bg-green-600 text-white rounded"
                    >
                      Aceptar
                    </button>
                    <button
                      onClick={() => responder(r.id, false)}
                      className="px-2 py-1 bg-red-600 text-white rounded"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div>
            <h3 className="font-medium mb-2">Enviadas</h3>
            {salientes.length === 0 ? (
              <p className="text-gray-600">Ninguna</p>
            ) : (
              salientes.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between bg-white p-2 rounded shadow mb-2"
                >
                  <span>{r.usuario2.nick}</span>
                  <button
                    onClick={() => cancelar(r.id)}
                    className="px-2 py-1 bg-gray-500 text-white rounded"
                  >
                    Cancelar
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Amigos */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Tus amigos</h2>
          {amigos.length === 0 ? (
            <p className="text-gray-600">Aún no tienes amigos.</p>
          ) : (
            <ul className="space-y-2">
              {amigos.map((a) => (
                <li
                  key={a.amistadId}
                  className="flex items-center justify-between bg-white p-2 rounded shadow"
                >
                  <span
                    onClick={() => navigate(`/perfil/${a.amigoId}`)}
                    className="cursor-pointer text-blue-600 hover:underline"
                  >
                    {a.nick}
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Compartir</label>
                    <Switch
                      checked={a.comparte}
                      onCheckedChange={() =>
                        toggleCompartir(a.amistadId, a.comparte)
                      }
                      className="w-12 h-6 bg-gray-200 rounded-full data-[state=checked]:bg-green-500"
                    >
                      <span className="block w-6 h-6 bg-white rounded-full shadow transition-transform data-[state=checked]:translate-x-6" />
                    </Switch>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
