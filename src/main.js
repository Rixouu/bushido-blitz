import "./styles/game.css";

import { boot } from "./game/app.js";

window.addEventListener("load", () => {
  window.setTimeout(boot, 300);
});
