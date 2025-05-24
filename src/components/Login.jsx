import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "../utils/supabaseClient";

const schema = z.object({
  email: z.string().email("Introduce un correo válido"),
  password: z.string().min(1, "Introduce tu contraseña"),
});

export default function Login() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ email, password }) => {
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) setError(error.message);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} aria-describedby={error ? "login-error" : undefined}>
      <input
        {...register("email")}
        placeholder="Correo electrónico"
        autoFocus
        autoComplete="username"
        aria-invalid={!!errors.email}
        aria-describedby={errors.email ? "email-error" : undefined}
      />
      {errors.email && <p id="email-error">{errors.email.message}</p>}

      <input
        type="password"
        {...register("password")}
        placeholder="Contraseña"
        autoComplete="current-password"
        aria-invalid={!!errors.password}
        aria-describedby={errors.password ? "password-error" : undefined}
      />
      {errors.password && <p id="password-error">{errors.password.message}</p>}

      <button type="submit" disabled={loading}>
        {loading ? "Ingresando..." : "Iniciar sesión"}
      </button>
      {error && <p id="login-error" style={{ color: "red" }}>{error}</p>}
    </form>
  );
}