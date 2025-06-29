import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import { Provider } from "./provider.tsx";
import { LanguageProvider } from "./context/languageContext";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </Provider>
    </BrowserRouter>
  </React.StrictMode>,
);
