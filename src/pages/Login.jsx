import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "../utils/supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Esquemas Zod
const schemaLogin = z.object({
  email: z.string().email("Introduce un correo válido"),
  password: z
    .string()
    .min(10, "La contraseña debe tener al menos 10 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{10,}$/,
      "La contraseña debe tener al menos una mayúscula, una minúscula, un número y un carácter especial"
    ),
});
const schemaRegistro = schemaLogin
  .extend({
    nick: z.string().min(3, "El nick debe tener al menos 3 caracteres"),
    password2: z.string(),
  })
  .refine((data) => data.password === data.password2, {
    message: "Las contraseñas no coinciden",
    path: ["password2"],
  });

export default function Login() {
  const location = useLocation();
  const [modo, setModo] = useState(
    location.state?.modo === "registro" ? "registro" : "login"
  );
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const [isRecovery, setIsRecovery] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [changeMsg, setChangeMsg] = useState("");
  const [passwordValue, setPasswordValue] = useState(""); // Para ayuda visual
  const navigate = useNavigate();

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(modo === "login" ? schemaLogin : schemaRegistro),
  });

  // Si ya está logueado, redirigir
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) navigate("/#");
    });
  }, [navigate]);

  // Detectar modo recuperación por el hash de la URL
  useEffect(() => {
    if (window.location.hash.includes("access_token")) {
      setIsRecovery(true);
    }
  }, []);

  // Handler para login
  const onLogin = async ({ email, password }) => {
    setErrorMsg("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg("Correo o contraseña incorrectos.");
    } else {
      navigate("/");
    }
    setLoading(false);
  };

  // Handler para registro
  const onRegistro = async ({ email, password, nick }) => {
    setErrorMsg("");
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMsg("Error al registrar usuario.");
      setLoading(false);
      return;
    }

    // Guardar solo el user_id y el nick en la tabla usuarios
    if (data?.user) {
      const { error: userError } = await supabase.from("usuarios").insert([
        {
          user_id: data.user.id,
          nick,
        },
      ]);
      if (userError) {
        setErrorMsg(
          "Usuario creado pero error guardando el nick: " + userError.message
        );
        setLoading(false);
        return;
      }
    }

    setModo("login");
    setLoading(false);
    setErrorMsg(
      "Se ha enviado un correo de verificación. Confírmalo antes de iniciar sesión."
    );
  };

  // Handler para recuperación de contraseña
  const onResetPassword = async (e) => {
    e.preventDefault();
    setResetMsg("");
    if (!resetEmail) {
      setResetMsg("Introduce tu correo electrónico.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: window.location.origin + "/#/reset-password", // Cambia si tienes una ruta específica
    });
    if (error) {
      setResetMsg("Error al enviar el correo de recuperación.");
    } else {
      setResetMsg(
        "Si el correo existe, recibirás un enlace para restablecer tu contraseña."
      );
    }
  };

  // Cambiar contraseña en modo recuperación
  const onChangePassword = async (e) => {
    e.preventDefault();
    setChangeMsg("");
    if (newPassword.length < 10) {
      setChangeMsg("La contraseña debe tener al menos 10 caracteres.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setChangeMsg("Error al cambiar la contraseña.");
    } else {
      setChangeMsg("Contraseña cambiada correctamente. Ya puedes usar la app.");
      setTimeout(() => {
        setIsRecovery(false);
        window.location.hash = ""; // Limpia el hash
        window.location.reload(); // Recarga para salir del modo recovery
      }, 2000);
    }
  };

  // Si está en modo recuperación, solo muestra el formulario de cambio de contraseña
  if (isRecovery) {
    return (
      <div className="min-h-screen grid-rows-[auto_1fr_auto] flex flex-col items-center justify-center bg-gray-100 px-4">
        <div className="bg-white shadow p-6 rounded w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-center">
            Cambia tu contraseña
          </h2>
          <form onSubmit={onChangePassword}>
            <label className="block mb-2 text-sm">Nueva contraseña</label>
            <input
              type="password"
              className="w-full p-2 border rounded mb-2"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={10}
              autoFocus
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 mt-2"
            >
              Cambiar contraseña
            </button>
            {changeMsg && (
              <p
                className="text-sm mt-2"
                style={{
                  color: changeMsg.startsWith("Error") ? "red" : "green",
                }}
              >
                {changeMsg}
              </p>
            )}
          </form>
        </div>
      </div>
    );
  }

  // Función para comprobar requisitos
  const requisitos = [
    {
      label: "Al menos 10 caracteres",
      test: (v) => v.length >= 10,
    },
    {
      label: "Una mayúscula",
      test: (v) => /[A-Z]/.test(v),
    },
    {
      label: "Una minúscula",
      test: (v) => /[a-z]/.test(v),
    },
    {
      label: "Un número",
      test: (v) => /\d/.test(v),
    },
    {
      label: "Un carácter especial",
      test: (v) => /[\W_]/.test(v),
    },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white shadow p-6 rounded w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-center">
            {showReset
              ? "Recuperar contraseña"
              : modo === "login"
                ? "Iniciar sesión"
                : "Registrarse"}
          </h2>

          {showReset ? (
            <form onSubmit={onResetPassword}>
              <label className="block mb-2 text-sm">Correo electrónico</label>
              <input
                type="email"
                className="w-full p-2 border rounded mb-2"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                autoComplete="username"
                required
              />
              {resetMsg && (
                <p
                  className="text-sm mb-2"
                  style={{
                    color: resetMsg.startsWith("Error") ? "red" : "green",
                  }}
                >
                  {resetMsg}
                </p>
              )}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 mt-2"
              >
                Enviar enlace de recuperación
              </button>
              <button
                type="button"
                className="w-full text-blue-600 underline mt-2"
                onClick={() => {
                  setShowReset(false);
                  setResetMsg("");
                  setResetEmail("");
                }}
              >
                Volver al login
              </button>
            </form>
          ) : (
            <>
              <form
                onSubmit={handleSubmit(modo === "login" ? onLogin : onRegistro)}
                autoComplete="on"
              >
                <label className="block mb-2 text-sm">Correo electrónico</label>
                <input
                  type="email"
                  className="w-full p-2 border rounded mb-1"
                  {...register("email")}
                  autoComplete="username"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mb-2">
                    {errors.email.message}
                  </p>
                )}

                <label className="block mb-2 text-sm">Contraseña</label>
                <input
                  type="password"
                  className="w-full p-2 border rounded mb-1"
                  {...register("password")}
                  minLength={10}
                  autoComplete={
                    modo === "login" ? "current-password" : "new-password"
                  }
                  value={passwordValue}
                  onChange={(e) => {
                    setPasswordValue(e.target.value);
                    // Si usas react-hook-form, propaga el cambio:
                    if (register("password").onChange)
                      register("password").onChange(e);
                  }}
                />
                {/* Ayuda visual de requisitos */}
                {modo !== "login" && (
                  <ul className="mb-2 text-xs">
                    {requisitos.map((req) => (
                      <li
                        key={req.label}
                        className={
                          req.test(passwordValue)
                            ? "text-green-600"
                            : "text-gray-500"
                        }
                      >
                        {req.test(passwordValue) ? "✔️" : "❌"} {req.label}
                      </li>
                    ))}
                  </ul>
                )}
                {errors.password && (
                  <p className="text-red-500 text-xs mb-2">
                    {errors.password.message}
                  </p>
                )}

                {modo === "registro" && (
                  <>
                    <label className="block mb-2 text-sm">
                      Repite la contraseña
                    </label>
                    <input
                      type="password"
                      className="w-full p-2 border rounded mb-1"
                      {...register("password2")}
                      minLength={10}
                      autoComplete="new-password"
                    />
                    {errors.password2 && (
                      <p className="text-red-500 text-xs mb-2">
                        {errors.password2.message}
                      </p>
                    )}

                    <label className="block mb-2 text-sm">Nick</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded mb-1"
                      {...register("nick")}
                      minLength={3}
                      autoComplete="nickname"
                    />
                    {errors.nick && (
                      <p className="text-red-500 text-xs mb-2">
                        {errors.nick.message}
                      </p>
                    )}
                    <span className="block text-xs text-gray-500 mb-2">
                      La contraseña debe tener al menos 10 caracteres, una
                      mayúscula, una minúscula, un número y un carácter especial
                    </span>
                  </>
                )}

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 mt-2"
                  disabled={loading}
                >
                  {loading
                    ? modo === "login"
                      ? "Entrando..."
                      : "Registrando..."
                    : modo === "login"
                      ? "Entrar"
                      : "Registrarse"}
                </button>
              </form>
              <button
                type="button"
                className="w-full text-blue-600 underline mt-2"
                onClick={() => setShowReset(true)}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </>
          )}

          <p className="mt-4 text-center text-sm">
            {modo === "login" ? (
              <>
                ¿No tienes cuenta?{" "}
                <button
                  onClick={() => {
                    setModo("registro");
                    setErrorMsg("");
                    reset();
                  }}
                  className="text-blue-600 underline"
                >
                  Regístrate
                </button>
              </>
            ) : (
              <>
                ¿Ya tienes cuenta?{" "}
                <button
                  onClick={() => {
                    setModo("login");
                    setErrorMsg("");
                    reset();
                  }}
                  className="text-blue-600 underline"
                >
                  Inicia sesión
                </button>
              </>
            )}
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
