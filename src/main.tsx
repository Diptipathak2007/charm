import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const view = new URLSearchParams(window.location.search).get("view");
document.documentElement.dataset.view = view === "charm" ? "charm" : "customizer";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
