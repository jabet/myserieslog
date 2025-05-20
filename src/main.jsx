import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./pages/App.jsx";
import "./index.css";
import "@radix-ui/themes/styles.css";
import { BrowserRouter, Routes, Route, HashRouter } from "react-router-dom";
import Detalle from "./pages/Detalle.jsx";
import Login from "./pages/Login.jsx";
import PreferenciasUsuario from "./pages/PreferenciasUsuario.jsx";
import React from "react";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/detalle/:id" element={<Detalle />} />
        <Route path="/preferencias" element={<PreferenciasUsuario />} />
      </Routes>
    </HashRouter>
  </StrictMode>
);
