import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./pages/App.jsx";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Detalle from "./pages/Detalle.jsx";
import Login from "./pages/Login.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/detalle/:id" element={<Detalle />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Login />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
