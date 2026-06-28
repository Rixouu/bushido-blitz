# BUSHIDO BLITZ — Developer Docs

A 1v1 melee fighting game built with Three.js. Fast rounds, parry-and-punish,
FOOTSIES-style reads with health bars. Single self-contained `index.html` for
now; this doc covers how it works and how to keep building it in TRAE.

---

## 1. Run it

It's a single HTML file using Three.js from a CDN. No build step needed to test.

- **Quickest:** open `index.html` in a browser.
- **Recommended (avoids texture CORS issues once you add sprites):** serve it.
  ```bash
  npx serve .
  # or
  python3 -m http.server 8000
  ```
  Then open the printed URL.

When you fold this into your Vite + pnpm setup (like Pixel Olympics), the
`<script type="module">` block becomes your `src/` modules and Three.js moves
to a real `import` from `node_modules`. See section 8.

---

## 2. Controls

**Player 1** — `A`/`D` move · `W` jump · `Shift` run · `F` strike · `G` heavy · `S` parry
**Player 2** — `←`/`→` move · `↑` jump · `RShift` run · `.` strike · `/` heavy · `↓` parry
**Lunge (run+attack)** — hold run + a direction, then press strike.

vs-AI mode uses Player 1's controls; the AI drives Player 2.

---

## 3. The fight, in one paragraph

Two fighters, short range. You poke with **light** (fast) or commit to **heavy**
(slow, more damage). **Run+attack** is a lunging gap-closer that travels but is
punishable on whiff. **Shield** is the key skill: tap it the instant a strike
lands and you **parry** — the attacker is stunned for a punish window. Mistime it
and you merely **block** (chip damage, lose one of three stamina pips). Land
enough clean hits to drop the opponent's HP to zero. First to **2 rounds** wins.
Loser drinks (party-game sip count on the result screen).

---

## 4. File map (what lives where in `index.html`)

The script is organized top-to-bottom in clear sections. Search for these headers:

| Section | What it controls |
|---|---|
| `TUNING` (`CFG`) | All gameplay numbers: speeds, ranges, damage, parry windows, rounds-to-win. **Start here to change feel.** |
| `SPRITE MANIFEST` (`ANIMS`, `ASSET_MODE`) | Frame counts + fps per animation, and the placeholder/sheet switch. |
| `ROSTER` / `STAGES` | The three characters and four stages. |
| `GAME STATE` (`G`) | Current screen, mode, picks, scores, live round. |
| `THREE SETUP` | Renderer, scene, camera, lights, ground, sky, props. |
| `SPRITE LOADING` | `loadSheet()`, the placeholder maker, filename map. |
| `Fighter` class | Movement, attacks, parry, hit detection, animation stepping. **The core.** |
| `INPUT SOURCES` | `KeyboardSource`, `TouchSource`, `AISource`, and the `RemoteSource` seam. |
| `SCREENS` | Title / select / stage / online / result routing. |
| `FIGHT / ROUND` | `startFight`, `beginRound`, `endRound`, `endDuel`. |
| `recomputeArena` | Responsive walls (keeps fighters on-screen). |
| `tick()` | The main fixed-timestep loop. |

---

## 5. How the moveset maps to your sprites

Animation names match the CraftPix Shinobi reference rows 1:1:

| Sprite row | Anim id | Frames | Used for |
|---|---|---|---|
| Idle | `idle` | 6 | standing |
| Idle 2 | `idle2` | 8 | shield/guard pose (aliased) |
| Walk | `walk` | 8 | walking |
| Run | `run` | 8 | running |
| Run+Attack | `runattack` | 8 | the lunge |
| Jump | `jump` | 8 | jumping |
| Attack 1 | `attack1` | 4 | light strike |
| Attack 2 | `attack2` | 4 | heavy strike |
| Hurt | `hurt` | 3 | taking a hit |
| Dead | `dead` | 4 | KO |

The `Fighter.play(name)` method takes these ids. Gameplay states like `shield`,
`lunge`, `steady` are aliased onto sprite anims inside `play()` — so you can
remap which animation a state uses in one place.

---

## 6. Wiring the real sprites (the main next step)

Right now `ASSET_MODE = 'placeholder'` draws blocky figures so the game runs.
To use the CraftPix art:

### Step 1 — Pack each animation into a horizontal strip
The CraftPix pack ships individual frames. The loader expects **one PNG per
animation**, frames laid left→right, all equal width. Easiest ways:

```bash
# ImageMagick: turn frames into one horizontal strip
convert Idle_000.png Idle_001.png ... Idle_005.png +append Idle.png
```
or use TexturePacker / a tiny node script. Do this for every animation, for
each of the 3 characters.

### Step 2 — Lay out the folders
```
sprites/
  ronin/    Idle.png Idle2.png Walk.png Run.png Run_Attack.png
            Jump.png Attack1.png Attack2.png Hurt.png Dead.png
  reaper/   (same set)
  kaito/    (same set)
```
Filenames are controlled by the `ANIM_FILE` map in the `SPRITE LOADING` section —
rename there if your exports differ.

### Step 3 — Flip the switch
```js
const ASSET_MODE = 'sheet';
```

### How it renders a frame
Each strip is N frames wide. The loader sets `texture.repeat.x = 1/N`, and each
update sets `texture.offset.x = currentFrame / N`. That's the same source-rect
math as Pixel Olympics' `sprite-sheets.js` — you already know this pattern.

### If you keep separate frames instead of strips
Load an array of textures per anim and swap `material.map` by frame index in
`stepAnim()`. Strips are simpler and one draw call, so prefer them.

### Frame counts / fps
Live in the `ANIMS` object. If your packed strip has a different frame count
than the table, just update the number there — nothing else changes.

---

## 7. Tuning the feel (`CFG`)

Everything that affects game feel is in one object near the top:

```js
const CFG = {
  roundsToWin: 2,
  arenaHalf: 6.5,        // overwritten by recomputeArena() at runtime
  walkSpeed: 3.0, runSpeed: 6.2, jumpVel: 7.5, gravity: 22,
  light:  { range, startup, active, recover, dmg, push },
  heavy:  { ... },
  lunge:  { ..., dash },     // dash = lunge travel speed
  parryWindow: 0.18,         // perfect-parry timing window (seconds)
  parryStun:   0.55,         // attacker stun after being parried
  maxHP: 100, hitstun: 0.32,
  aiReact: 0.16,             // AI reaction time — RAISE to make AI easier
};
```

Common tweaks:
- **Rounds feel too long** → lower `maxHP` or raise damage.
- **Parry too hard/easy** → `parryWindow` up = more forgiving.
- **AI too tough** → raise `aiReact` (e.g. 0.25). Too easy → lower it.
- **Fighters drift apart** → they're walled by `recomputeArena()`; widen the
  margin in that function if you want more space.

---

## 8. Splitting into Vite modules (matching Pixel Olympics)

When you move this into your repo structure, a clean split:

```
src/
  main.js          # boot, resize, mounts renderer
  game/
    config.js      # CFG, ANIMS, ROSTER, STAGES
    scene.js       # renderer, camera, lights, ground, props, recomputeArena
    fighter.js     # Fighter class
    sprites.js     # loadSheet, placeholder, ANIM_FILE  (your sprite-sheets.js sibling)
    input.js       # KeyboardSource, TouchSource, AISource, RemoteSource
    screens.js     # show(), routing, roster/stage builders
    fight.js       # startFight, beginRound, endRound, endDuel
    loop.js        # tick()
```
Import Three.js from `node_modules` (`import * as THREE from 'three'`) instead of
the CDN importmap. The logic is already written to be source-agnostic, so the
split is mechanical — mostly moving blocks into files and adding imports/exports.

---

## 9. Online multiplayer (the architecture is ready)

**Why it needs a server:** browsers can't connect two phones directly — no
Bluetooth, no LAN trick. Even WebRTC on the same Wi-Fi needs a small signalling
server to introduce the peers. So phone-vs-phone always needs *some* backend.

**The good news — the seam already exists.** Every fighter reads from an
**InputSource** that returns a per-frame snapshot:
```js
{ left, right, jump, attack, heavy, shield, run }
```
The simulation never touches keys directly. To add online, implement one class:

```js
class RemoteSource {
  constructor(socket){ this.s = blankInput(); this.label = 'ONLINE';
    socket.on('input', snap => this.s = snap); }   // peer's inputs arrive here
  read(){ return { ...this.s }; }
}
```
Then in `setupSources()`, set `G.sources[2] = new RemoteSource(sock)` and each
frame send *your* `G.sources[1].read()` to the peer. Nothing in `Fighter` or the
round logic changes.

**Recommended path:**
1. **Join by code/QR** — host creates a room, gets a short code; the code (and a
   QR of the room URL) shows on a join screen. Guest enters code → both join the
   same room on the relay.
2. **Relay options that need almost no backend code:**
   - **PartyKit** — purpose-built for this, tiny server file, deploys easily.
   - **Supabase Realtime** — you may already use it; broadcast channel works.
   - **A 30-line WebSocket server** on Render/Fly/Railway.
3. **Determinism:** the loop already runs a **fixed timestep** (`STEP = 1/60`)
   and accumulator, which is what lockstep/rollback needs. Start with simple
   lockstep (works great on good connections / LAN); add rollback later only if
   you need it. This is the exact problem HiFight solved for FOOTSIES online —
   it's real work, but the structure here is built for it.

A reserved **"Play on separate phones"** screen already exists (`screen-online`)
— swap its placeholder copy for the room-code/QR UI when you build this.

---

## 10. Known simplifications (good first improvements)

- **Hit detection is 1D** (distance + facing + a vertical tolerance). Fine for
  this style; if you want air combos, add proper per-frame hitboxes.
- **AI is reaction-timer based**, not a real strategy. Easy to extend in
  `AISource.read()` — add spacing logic, bait detection, difficulty levels.
- **Touch controls are basic** (tap = strike, hold = shield, swipe up = jump,
  big swipe = heavy). Tune zones in `bindTouch()`.
- **No round timer** — add one in `tick()` under the `live` phase if you want
  time-outs to decide on remaining HP.
- **Sound** — none yet. Pixel Olympics' Web Audio SFX approach drops in cleanly.

---

## 11. Naming

Working title is **BUSHIDO BLITZ** (the `<title>` and the `h1.title` in the
header). Swap freely. The fight, fighters, and stages are all data — renaming
characters/stages is just editing the `ROSTER` / `STAGES` arrays.
