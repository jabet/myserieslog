import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "../utils/supabaseClient";

const schema = z.object({
  email: z.string().email("Introduce un correo válido"),
  password: z
    .string()
    .min(10, "La contraseña debe tener al menos 10 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{10,}$/,
      "La contraseña debe tener al menos una mayúscula, una minúscula, un número y un carácter especial"
    ),
});

export default function Login() {
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ email, password }) => {
    setError("");
    setInfo("");
    setLoading(true);
    let result;
    if (isRegister) {
      result = await supabase.auth.signUp({ email, password });
      if (!result.error) {
        setInfo(
          "Se ha enviado un correo para verificar tu mail, es necesario que lo confirmes antes de continuar"
        );
      }
    } else {
      result = await supabase.auth.signInWithPassword({ email, password });
    }
    setLoading(false);
    if (result.error) setError(result.error.message);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      aria-describedby={error ? "login-error" : undefined}
    >
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
      {isRegister && (
        <span>
          La contraseña debe tener al menos 10 caracteres, una mayúscula, una
          minúscula, un número y un carácter especial
        </span>
      )}
      {errors.password && (
        <p id="password-error" style={{ color: "red" }}>
          {errors.password.message}
        </p>
      )}
      <button type="submit" disabled={loading}>
        {loading
          ? isRegister
            ? "Registrando..."
            : "Ingresando..."
          : isRegister
          ? "Registrarse"
          : "Iniciar sesión"}
      </button>
      <button
        type="button"
        onClick={() => {
          setError("");
          setInfo("");
          setIsRegister((v) => !v);
        }}
        style={{ marginLeft: 8 }}
      >
        {isRegister
          ? "¿Ya tienes cuenta? Inicia sesión"
          : "¿No tienes cuenta? Regístrate"}
      </button>
      {error && (
        <p id="login-error" style={{ color: "red" }}>
          {error}
        </p>
      )}
      {info && <p style={{ color: "green" }}>{info}</p>}
    </form>
  );
}
