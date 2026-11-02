import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { LanguageProvider } from "./i18n";
import "./styles.css";
import "./social.css";

const buildSha = String(import.meta.env.VITE_BUILD_SHA ?? "").trim();

async function checkForNewBuild() {
  if (!buildSha) return;

  try {
    const base = import.meta.env.BASE_URL || "/";
    const response = await fetch(`${base}version.json?t=${Date.now()}`, {
      cache: "no-store",
    });
    if (!response.ok) return;

    const payload = await response.json();
    const latestSha = String(payload?.sha ?? "").trim();
    if (!latestSha || latestSha === buildSha) return;

    const url = new URL(window.location.href);
    url.searchParams.set("_v", latestSha.slice(0, 12));
    window.location.replace(url.toString());
  } catch {
    // Version checks must never interfere with the site itself.
  }
}

if (buildSha) {
  window.setTimeout(() => void checkForNewBuild(), 5000);
  window.setInterval(() => void checkForNewBuild(), 60000);
}


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>,
);