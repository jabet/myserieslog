import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./pages/App.jsx";
import "./index.css";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import { BrowserRouter, Routes, Route, HashRouter } from "react-router-dom";
import Detalle from "./pages/Detalle.jsx";
import Login from "./pages/Login.jsx";
import Amigos from "./pages/Amigos.jsx";
import PerfilAmigo from "./pages/PerfilAmigo.jsx";
import PreferenciasUsuario from "./pages/PreferenciasUsuario.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import RedSocial from "./pages/RedSocial.jsx";
import React from "react";
import Perfil from "./pages/Perfil.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Theme appearance="light" accentColor="blue">
      <HashRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Login />} />
          <Route path="/detalle/:media_type/:id" element={<Detalle />} />
          <Route path="/preferencias" element={<PreferenciasUsuario />} />
          <Route path="/perfil/:nick" element={<PerfilAmigo />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/social" element={<RedSocial />} />
          <Route path="/perfil" element={<Perfil />} />
        </Routes>
      </HashRouter>
     </Theme>
  </StrictMode>
);
