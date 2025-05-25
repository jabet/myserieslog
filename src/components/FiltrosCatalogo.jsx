import React, { useState, useEffect } from "react";
import * as Select from "@radix-ui/react-select";

function RadixSelect({ value, onValueChange, options, placeholder }) {
  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger className="border pr-1 pl-1 rounded bg-white justify-between  shadow-sm focus:ring-2 focus:ring-blue-400 inline-flex items-center text-sm">
        <Select.Value placeholder={placeholder} />
        <Select.Icon className="ml-2 text-gray-400">▼</Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          className="bg-white border bordered shadow-lg z-50 mt-2"
          position="popper"
        >
          <Select.Viewport>
            {options.map((opt) => (
              <Select.Item
                key={opt.value}
                value={opt.value}
                className="px-3 py-2 cursor-pointer hover:bg-blue-100 data-[state=checked]:bg-blue-200 data-[highlighted]:bg-blue-50 outline-none"
              >
                <Select.ItemText>{opt.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

export default function FiltrosCatalogo({
  tipos = [],
  anios = [],
  estados = [],
  onFiltrar,
}) {
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroAnio, setFiltroAnio] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroTexto, setFiltroTexto] = useState("");

  useEffect(() => {
    if (onFiltrar) {
      onFiltrar({
        tipo: filtroTipo,
        anio: filtroAnio,
        estado: filtroEstado,
        texto: filtroTexto,
      });
    }
  }, [filtroTipo, filtroAnio, filtroEstado, filtroTexto]);

  return (
    <div className="mb-6 flex flex-col md:flex-row gap-4 text-md">
      <RadixSelect
        value={filtroTipo}
        onValueChange={setFiltroTipo}
        options={tipos.map((t) => ({
          value: t,
          label: t.charAt(0).toUpperCase() + t.slice(1),
        }))}
        placeholder="Todos los tipos"
      />
      <RadixSelect
        value={filtroAnio}
        onValueChange={setFiltroAnio}
        options={anios.map((a) => ({
          value: a,
          label: a,
        }))}
        placeholder="Todos los años"
      />
      <RadixSelect
        value={filtroEstado}
        onValueChange={setFiltroEstado}
        options={estados.map((e) => ({
          value: e,
          label: e.charAt(0).toUpperCase() + e.slice(1),
        }))}
        placeholder="Todos los estados"
      />
      <input
        type="text"
        className="border px-3 py-2 rounded shadow-sm focus:ring-2 focus:ring-blue-400"
        placeholder="Buscar por nombre..."
        value={filtroTexto}
        onChange={(e) => setFiltroTexto(e.target.value)}
      />
    </div>
  );
}
