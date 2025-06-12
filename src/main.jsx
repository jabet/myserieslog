import { StrictMode, lazy } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import { HashRouter, Routes, Route } from "react-router-dom";

const App = lazy(() => import("./pages/App.jsx"));
const LandingPage = lazy(() => import("./pages/LandingPage.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const Detalle = lazy(() => import("./pages/Detalle.jsx"));
const PreferenciasUsuario = lazy(() => import("./pages/PreferenciasUsuario.jsx"));
const PerfilAmigo = lazy(() => import("./pages/PerfilAmigo.jsx"));
const AdminPanel = lazy(() => import("./pages/AdminPanel.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const RedSocial = lazy(() => import("./pages/RedSocial.jsx"));
const Perfil = lazy(() => import("./pages/Perfil.jsx"));
const Pro = lazy(() => import("./pages/Pro.jsx"));
const Privacidad = lazy(() => import("./pages/Privacidad.jsx"));
const Cookies = lazy(() => import("./pages/Cookies.jsx"));
const AvisoLegal = lazy(() => import("./pages/AvisoLegal.jsx"));
const Contacto = lazy(() => import("./pages/Contacto.jsx"));

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Theme appearance="light" accentColor="blue">
      <HashRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/catalogo" element={<App />} />
          <Route path="/login" element={<Login />} />
          <Route path="/detalle/:media_type/:id" element={<Detalle />} />
          <Route path="/preferencias" element={<PreferenciasUsuario />} />
          <Route path="/perfil/:nick" element={<PerfilAmigo />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/social" element={<RedSocial />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/pro" element={<Pro />} />
          <Route path="/privacidad" element={<Privacidad />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/aviso-legal" element={<AvisoLegal />} />
          <Route path="/contacto" element={<Contacto />} />
        </Routes>
      </HashRouter>
    </Theme>
  </StrictMode>
);
