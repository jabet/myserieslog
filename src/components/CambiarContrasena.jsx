import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "../utils/supabaseClient";

const schema = z
  .object({
    password: z.string().min(6, "Mínimo 6 caracteres"),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Las contraseñas no coinciden",
    path: ["confirm"],
  });

export default function CambiarContrasena() {
  const [message, setMessage] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ password }) => {
    setMessage("");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setMessage(error.message);
    else {
      setMessage("Contraseña actualizada correctamente");
      reset();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        type="password"
        {...register("password")}
        placeholder="Nueva contraseña"
      />
      {errors.password && <p>{errors.password.message}</p>}

      <input
        type="password"
        {...register("confirm")}
        placeholder="Confirmar nueva contraseña"
      />
      {errors.confirm && <p>{errors.confirm.message}</p>}

      <button type="submit">Cambiar contraseña</button>
      {message && <p>{message}</p>}
    </form>
  );
}
