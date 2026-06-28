import "./styles/game.css";

import { boot } from "./game/app.js";

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  try {
    await navigator.serviceWorker.register("/sw.js");
  } catch (error) {
    console.error("Service worker registration failed", error);
  }
}

window.addEventListener("load", () => {
  window.setTimeout(() => {
    boot();
    void registerServiceWorker();
  }, 300);
});
