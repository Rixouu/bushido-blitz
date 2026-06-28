import { CFG, ROSTER, SPRITE_BASE, STAGES, getAnimDef, getAnimFile } from "./config.js";
import {
  hud,
  hudRefs,
  loadingEl,
  pickLabel,
  rosterEl,
  screens,
  sipCallEl,
  stagesEl,
  verdictEl,
} from "./dom.js";
import { Fighter } from "./fighter.js";
import { AISource, KeyboardSource, TouchSource, blankInput } from "./input.js";
import { applyStage, punch, recomputeArena, renderScene, renderer, resizeScene, stepCamera } from "./scene.js";
import { F, G, makeEdge } from "./state.js";

const STEP = 1 / 60;
let acc = 0;
let lastFrame = performance.now();

function show(name) {
  G.screen = name;
  Object.values(screens).forEach((screen) => screen.classList.remove("active"));
  hud.classList.remove("active");
  if (screens[name]) {
    screens[name].classList.add("active");
  }
  if (name === "fight") {
    hud.classList.add("active");
  }
}

function goTitle() {
  G.scores = { 1: 0, 2: 0 };
  G.picks = { 1: null, 2: null };
  G.selecting = 1;
  show("title");
}

function renderPips() {
  [
    ["p1pips", 1],
    ["p2pips", 2],
  ].forEach(([key, player]) => {
    const bucket = hudRefs[key];
    bucket.innerHTML = "";
    for (let i = 0; i < CFG.roundsToWin; i += 1) {
      const pip = document.createElement("div");
      pip.className = `pip${i < G.scores[player] ? " won" : ""}`;
      bucket.appendChild(pip);
    }
  });
}

function renderStam() {
  [
    ["p1stam", 1],
    ["p2stam", 2],
  ].forEach(([key, player]) => {
    const bucket = hudRefs[key];
    bucket.innerHTML = "";
    const fighter = F[player];
    for (let i = 0; i < 3; i += 1) {
      const block = document.createElement("div");
      block.className = `blk${i >= fighter.stam ? " spent" : ""}`;
      bucket.appendChild(block);
    }
  });
}

function updateHP() {
  hudRefs.p1hp.style.width = `${(F[1].hp / CFG.maxHP) * 100}%`;
  hudRefs.p2hp.style.width = `${(F[2].hp / CFG.maxHP) * 100}%`;
}

function call(text, cls, opacity) {
  hudRefs.center.textContent = text;
  hudRefs.center.className = `center-call ${cls || ""}`.trim();
  hudRefs.center.style.opacity = opacity;
}

function fade() {
  let opacity = 0.9;
  const id = window.setInterval(() => {
    opacity -= 0.08;
    hudRefs.center.style.opacity = Math.max(0, opacity);
    if (opacity <= 0 || !G.round || G.round.phase !== "live") {
      window.clearInterval(id);
    }
  }, 40);
}

function flash(ms) {
  window.setTimeout(() => {
    if (G.round && G.round.phase === "live") {
      hudRefs.center.style.opacity = 0;
    }
  }, ms);
}

function callClash(big) {
  call(big ? "HIT!" : "•", "clash", 1);
  flash(160);
}

function callBlock() {
  call("BLOCK", "parry", 1);
  flash(120);
}

function callParry() {
  call("PARRY!", "parry", 1);
  flash(200);
  punch(0.45);
}

function setupSources() {
  G.sources[1]?.dispose?.();
  G.sources[2]?.dispose?.();

  const touchDevice = window.matchMedia("(pointer: coarse)").matches && navigator.maxTouchPoints > 0;

  if (touchDevice && G.mode === "local") {
    G.sources[1] = new TouchSource(1);
    G.sources[2] = new TouchSource(2);
  } else {
    G.sources[1] = new KeyboardSource({
      left: "KeyA",
      right: "KeyD",
      jump: "KeyW",
      attack: "KeyF",
      heavy: "KeyG",
      shield: "KeyS",
      run: "ShiftLeft",
    });

    if (G.mode === "ai") {
      G.sources[2] = new AISource(() => F[2], () => F[1], 1);
    } else {
      G.sources[2] = new KeyboardSource({
        left: "ArrowLeft",
        right: "ArrowRight",
        jump: "ArrowUp",
        attack: "Period",
        heavy: "Slash",
        shield: "ArrowDown",
        run: "ShiftRight",
      });
    }
  }

  hudRefs.p1src.textContent = G.sources[1].label;
  hudRefs.p2src.textContent = G.sources[2].label;

  if (G.mode === "ai") {
    hudRefs.hint.innerHTML =
      "Move <b>A D</b> · Jump <b>W</b> · Run <b>Shift</b> · Strike <b>F</b> · Heavy <b>G</b> · Parry <b>S</b>";
  } else if (G.sources[1] instanceof TouchSource) {
    hudRefs.hint.innerHTML =
      "Touch: tap to strike · hold to parry · swipe up to jump · swipe wide for heavy";
  } else {
    hudRefs.hint.innerHTML =
      "P1: <b>A D</b> move · <b>W</b> jump · <b>F</b> strike · <b>G</b> heavy · <b>S</b> parry &nbsp;&nbsp;|&nbsp;&nbsp; P2: <b>← →</b> move · <b>↑</b> jump · <b>.</b> strike · <b>/</b> heavy · <b>↓</b> parry";
  }
}

function beginRound() {
  F[1].reset(-CFG.spawnX);
  F[2].reset(CFG.spawnX);
  renderStam();
  updateHP();

  G.round = { phase: "intro", t: 0, resolved: false };
  call("READY", "", 1);
  window.setTimeout(() => {
    if (!G.round) {
      return;
    }
    call("FIGHT!", "clash", 1);
    window.setTimeout(() => {
      if (!G.round) {
        return;
      }
      G.round.phase = "live";
      fade();
    }, 350);
  }, 650);
}

function endDuel() {
  const p1Won = G.scores[1] > G.scores[2];
  const winner = (p1Won ? F[1] : F[2]).r.name;
  const loser = (p1Won ? F[2] : F[1]).r.name;
  const margin = Math.abs(G.scores[1] - G.scores[2]);
  const sips = margin * 2;
  const vsAI = G.mode === "ai";

  verdictEl.textContent = `${winner} stands`;
  sipCallEl.innerHTML = vsAI
    ? `You ${p1Won ? "won" : "lost"} ${G.scores[1]}–${G.scores[2]}.${p1Won ? " Clean." : " The blade was faster."} Run it back?`
    : `${loser} falls — and drinks <b>${sips}</b> ${sips === 1 ? "sip" : "sips"}.<br>Final ${G.scores[1]}–${G.scores[2]}. Again?`;
  show("result");
}

function endRound(winner) {
  if (G.round.resolved) {
    return;
  }

  G.round.resolved = true;
  G.round.phase = "over";
  if (winner) {
    G.scores[winner] += 1;
  }
  renderPips();

  const name = winner ? F[winner].r.name : null;
  call(name ? `${name} takes it` : "DRAW", "ko", 1);
  punch(0.5);

  window.setTimeout(() => {
    if (G.scores[1] >= CFG.roundsToWin || G.scores[2] >= CFG.roundsToWin) {
      endDuel();
    } else {
      beginRound();
    }
  }, 1600);
}

function startFight(isRematch) {
  if (isRematch) {
    G.scores = { 1: 0, 2: 0 };
  }

  Object.values(F).forEach((fighter) => fighter?.dispose?.());

  const roster1 = ROSTER.find((entry) => entry.id === G.picks[1]) || ROSTER[0];
  const roster2 = ROSTER.find((entry) => entry.id === G.picks[2]) || ROSTER[1];
  const fx = {
    onParry: callParry,
    onBlock: callBlock,
    onClash: callClash,
    onPunch: punch,
  };

  F[1] = new Fighter(roster1, 1, fx);
  F[2] = new Fighter(roster2, -1, fx);
  const stage = G.stage || STAGES[0];
  F[1].setGroundOffset(CFG.fighterGroundOffset);
  F[2].setGroundOffset(CFG.fighterGroundOffset);

  hudRefs.p1name.textContent = roster1.name;
  hudRefs.p2name.textContent = roster2.name;

  applyStage(stage);
  setupSources();
  G.edges = { 1: makeEdge(), 2: makeEdge() };
  renderPips();
  show("fight");
  beginRound();
}

function buildStage() {
  stagesEl.innerHTML = "";

  STAGES.forEach((stage) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = `stage-card stage-card--${stage.id}`;
    card.setAttribute("aria-label", stage.name);
    const previewMarkup = stage.background
      ? `<img class="stage-card__image" src="${stage.background}" alt="" aria-hidden="true" />`
      : "";
    const previewStyle = stage.background
      ? ""
      : `background:linear-gradient(180deg,#${stage.sky.toString(16).padStart(6, "0")},#${stage.ground.toString(16).padStart(6, "0")});`;
    card.innerHTML = `
      <img class="stage-card__frame stage-card__frame--idle" src="/elements/frame-scene.png" alt="" aria-hidden="true" />
      <img class="stage-card__frame stage-card__frame--active" src="/elements/frame-scene-select.png" alt="" aria-hidden="true" />
      <div class="stage-card__panel">
        <div class="stage-card__preview" style="${previewStyle}">
          ${previewMarkup}
        </div>
        <div class="stage-card__nameplate">
          <div class="stage-name">${stage.name}</div>
        </div>
      </div>
    `;
    card.addEventListener("click", () => {
      G.stage = stage;
      [...stagesEl.children].forEach((child) => child.classList.remove("selected"));
      card.classList.add("selected");
      window.setTimeout(() => startFight(false), 240);
    });
    stagesEl.appendChild(card);
  });

  show("stage");
}

function pick(id, card) {
  const player = G.selecting;
  G.picks[player] = id;

  const playerClass = player === 1 ? "selected-p1" : "selected-p2";
  [...rosterEl.children].forEach((child) => child.classList.remove(playerClass));
  card.classList.add(playerClass);

  if (G.mode === "ai") {
    const others = ROSTER.filter((entry) => entry.id !== id);
    G.picks[2] = others[Math.floor(Math.random() * others.length)].id;
    window.setTimeout(buildStage, 200);
    return;
  }

  if (player === 1) {
    G.selecting = 2;
    pickLabel.textContent = "Player 2 - pick your fighter";
    return;
  }

  window.setTimeout(buildStage, 200);
}

function buildRoster() {
  rosterEl.innerHTML = "";
  ROSTER.forEach((fighter) => {
    const portraitFile = getAnimFile(fighter, "idle");
    const portraitDef = getAnimDef(fighter, "idle");
    const card = document.createElement("button");
    card.type = "button";
    card.className = "fighter-card";
    card.setAttribute("aria-label", `${fighter.name}, ${fighter.archetype}`);
    card.innerHTML = `
      <img class="fighter-card__frame fighter-card__frame--idle" src="/elements/frame-non-active.png" alt="" aria-hidden="true" />
      <img class="fighter-card__frame fighter-card__frame--active" src="/elements/frame-active.png" alt="" aria-hidden="true" />
      <div class="fighter-card__panel">
        <div class="fighter-card__top">
          <div
            class="fighter-portrait"
            style="
              --portrait-frames:${portraitDef.frames};
              --portrait-accent:#${fighter.tint.toString(16).padStart(6, "0")};
              background-image:url('${SPRITE_BASE}/${fighter.spriteFolder}/${portraitFile}.png');
            "
          ></div>
        </div>
        <div class="fighter-card__bottom">
          <div class="fighter-name">${fighter.name}</div>
          <div class="fighter-role" style="color:#${fighter.tint.toString(16).padStart(6, "0")}">${fighter.archetype}</div>
          <div class="fighter-blurb">${fighter.blurb}</div>
        </div>
      </div>
    `;
    card.addEventListener("click", () => pick(fighter.id, card));
    rosterEl.appendChild(card);
  });
}

function startSelect() {
  G.selecting = 1;
  G.picks = { 1: null, 2: null };
  pickLabel.textContent = G.mode === "ai" ? "Pick your fighter" : "Player 1 - pick your fighter";
  [...rosterEl.children].forEach((child) => child.classList.remove("selected-p1", "selected-p2"));
  show("select");
}

function bindUi() {
  document.querySelectorAll("[data-go]").forEach((button) => {
    button.addEventListener("click", () => {
      const { go } = button.dataset;
      if (go === "title") {
        goTitle();
      } else if (go === "select") {
        startSelect();
      } else if (go === "rematch") {
        startFight(true);
      } else {
        show(go);
      }
    });
  });

  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      const { mode } = button.dataset;
      if (mode === "online") {
        show("online");
        return;
      }
      G.mode = mode;
      startSelect();
    });
  });
}

function bindTouch() {
  const touches = {};

  renderer.domElement.addEventListener(
    "touchstart",
    (event) => {
      for (const touch of event.changedTouches) {
        const side = touch.clientX < window.innerWidth / 2 ? 1 : 2;
        if (G.sources[side] instanceof KeyboardSource) {
          continue;
        }
        touches[touch.identifier] = {
          side,
          x0: touch.clientX,
          y0: touch.clientY,
          t0: performance.now(),
        };
      }
    },
    { passive: true },
  );

  renderer.domElement.addEventListener(
    "touchmove",
    (event) => {
      for (const touch of event.changedTouches) {
        const origin = touches[touch.identifier];
        if (!origin) {
          continue;
        }

        const source = G.sources[origin.side];
        if (!(source instanceof TouchSource)) {
          continue;
        }

        const dx = touch.clientX - origin.x0;
        const dy = touch.clientY - origin.y0;
        source.set({
          left: dx < -12,
          right: dx > 12,
          shield: Math.abs(dx) < 12 && Math.abs(dy) < 12,
          run: Math.abs(dx) > 60,
          jump: dy < -40,
        });
      }
    },
    { passive: true },
  );

  renderer.domElement.addEventListener(
    "touchend",
    (event) => {
      for (const touch of event.changedTouches) {
        const origin = touches[touch.identifier];
        if (!origin) {
          continue;
        }

        const source = G.sources[origin.side];
        const dt = performance.now() - origin.t0;
        const dx = touch.clientX - origin.x0;
        const dy = touch.clientY - origin.y0;

        if (source instanceof TouchSource) {
          if (dt < 220 && Math.abs(dx) < 16 && Math.abs(dy) < 16) {
            source.set({ attack: true });
          } else if (Math.abs(dx) > 80) {
            source.set({ heavy: true });
          }
          source.set({ left: false, right: false, shield: false, run: false });
        }

        delete touches[touch.identifier];
      }
    },
    { passive: true },
  );
}

function drive(player, dt) {
  const fighter = F[player];
  const source = G.sources[player];
  const edge = G.edges[player];
  const raw = source.read();
  const input = {
    left: raw.left,
    right: raw.right,
    run: raw.run,
    jump: false,
    shield: raw.shield,
  };

  if (raw.shield && fighter.state !== "shield" && fighter.canAct()) {
    fighter.startShield();
  }

  const jumpPress = raw.jump && !edge.prev.jump;
  const attackPress = raw.attack && !edge.prev.attack;
  const heavyPress = raw.heavy && !edge.prev.heavy;

  if (jumpPress) {
    input.jump = true;
  }
  if (attackPress) {
    if (raw.run && (raw.left || raw.right)) {
      fighter.startAttack("lunge");
    } else {
      fighter.startAttack("light");
    }
  }
  if (heavyPress) {
    fighter.startAttack("heavy");
  }

  edge.prev = {
    jump: raw.jump,
    attack: raw.attack,
    heavy: raw.heavy,
  };

  fighter.update(dt, input, F[player === 1 ? 2 : 1]);
}

function resolveFighterSpacing() {
  const fighters = [F[1], F[2]];
  if (!fighters[0] || !fighters[1]) {
    return;
  }

  const [left, right] = fighters[0].x <= fighters[1].x ? fighters : [fighters[1], fighters[0]];
  const minGap = left.collisionRadius + right.collisionRadius;
  const gap = right.x - left.x;
  if (gap >= minGap) {
    return;
  }

  const overlap = minGap - gap;
  left.x -= overlap / 2;
  right.x += overlap / 2;

  left.x = Math.max(-CFG.arenaHalf, left.x);
  right.x = Math.min(CFG.arenaHalf, right.x);

  const correctedGap = right.x - left.x;
  if (correctedGap >= minGap) {
    return;
  }

  if (Math.abs(left.x + CFG.arenaHalf) < 0.001) {
    right.x = Math.min(CFG.arenaHalf, left.x + minGap);
    return;
  }

  if (Math.abs(right.x - CFG.arenaHalf) < 0.001) {
    left.x = Math.max(-CFG.arenaHalf, right.x - minGap);
    return;
  }

  const mid = (left.x + right.x) / 2;
  left.x = mid - minGap / 2;
  right.x = mid + minGap / 2;
}

function tick(now = performance.now()) {
  const dt = Math.min((now - lastFrame) / 1000, 0.05);
  lastFrame = now;

  if (G.screen === "fight" && G.round) {
    acc += dt;
    while (acc >= STEP) {
      if (G.round.phase === "live") {
        drive(1, STEP);
        drive(2, STEP);
        resolveFighterSpacing();

        F[1].x = Math.max(-CFG.arenaHalf, Math.min(CFG.arenaHalf, F[1].x));
        F[2].x = Math.max(-CFG.arenaHalf, Math.min(CFG.arenaHalf, F[2].x));
        F[1].sync();
        F[2].sync();

        updateHP();
        renderStam();

        if (F[1].dead || F[2].dead) {
          const winner = F[1].dead && F[2].dead ? 0 : (F[1].dead ? 2 : 1);
          G.round.phase = "dying";
          G.round.dieT = 0;
          G.round._w = winner;
        }
      } else if (G.round.phase === "dying") {
        drive(1, STEP);
        drive(2, STEP);
        G.round.dieT += STEP;
        if (G.round.dieT > 0.7) {
          endRound(G.round._w);
        }
      } else {
        F[1]?.update(STEP, blankInput(), F[2]);
        F[2]?.update(STEP, blankInput(), F[1]);
      }

      acc -= STEP;
    }

    stepCamera((F[1].x + F[2].x) / 2);
  } else {
    stepCamera(0);
  }

  renderScene();
  window.requestAnimationFrame(tick);
}

export function boot() {
  lastFrame = performance.now();
  bindUi();
  bindTouch();
  buildRoster();
  applyStage(STAGES[0]);
  recomputeArena();
  loadingEl.classList.add("hidden");
  show("title");
  tick();
}

window.addEventListener("resize", resizeScene);
