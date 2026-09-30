import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { LanguageProvider } from "./i18n/LanguageContext";
import { AdminAuthProvider } from "./admin/AuthContext";
import "./styles/style.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <AdminAuthProvider>
          <App />
        </AdminAuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
);
