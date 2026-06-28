# Bushido Blitz

**Bushido Blitz** is a browser fighting game featuring pixel-art samurai duels, a 12-character roster, 8 selectable arenas, local versus and versus-AI play modes, parries, lunging attacks, and best-of-three rounds where the loser drinks after every match.

[![Three.js](https://img.shields.io/badge/Three.js-WebGL-black?style=flat&logo=three.js)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646cff?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES%20Modules-f7df1e?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

## Key Features

### 1v1 pixel-art duels

- Fast melee matches built around spacing, reads, and punish windows.
- Light, heavy, parry, and run-attack options give each round a simple but sharp moveset.
- Best-of-three rounds decide the winner.

### Roster and stages

- 12 playable fighters in `public/sprites/`, split across guard and runner animation profiles.
- 8 playable stages backed by painted PNG arena art in `public/background/`.
- Each fighter has a distinct archetype, tint, and character blurb.
- Selection screens and HUD overlays use dedicated PNG UI assets from `public/elements/`.

### Local and solo play

- Local versus works on one keyboard.
- Solo play lets Player 1 fight an AI opponent.
- A phone-to-phone online flow is planned and already has an input-source seam reserved in the codebase.

### Party-game finish

- The result screen calls out the loser and assigns drinks after the set.
- Bushido Blitz keeps the same playful party-game tone as the wider Rixouu browser-game lineup.

## Tech Stack

- **Vite** for local development and production builds
- **Three.js** for the duel scene, camera, lighting, and arena rendering
- **Vanilla JavaScript ES modules** under `src/`
- **Packed sprite strips** loaded from `public/sprites/`
- **PNG background and UI art assets** loaded from `public/background/` and `public/elements/`

## Quick Start

### Develop locally

```bash
corepack enable
pnpm install
pnpm dev
```

Open `http://localhost:5173` or the local URL printed by Vite.

### Production build

```bash
pnpm build
pnpm preview
```

### Pack sprite strips

If you want to rebuild the animation sheets from a CraftPix export:

```bash
pnpm pack:sprites -- --src /absolute/path/to/craftpix-export
```

## How to Play

1. Choose **2 Players** for local versus or **1 Player** for a duel against AI.
2. Pick a fighter for each side.
3. Choose the stage.
4. Fight through a best-of-three set.
5. Use parries, spacing, and lunges to win exchanges.
6. The loser drinks when the duel ends.

## Controls

### Player 1

- `A` / `D` move
- `W` jump
- `Shift` run
- `F` strike
- `G` heavy
- `S` parry

### Player 2

- `Left` / `Right` move
- `Up` jump
- `Right Shift` run
- `.` strike
- `/` heavy
- `Down` parry

### Lunge

- Hold run plus a direction, then press strike.

## Current Game Content

### Playable fighters

The live roster in `src/game/config.js` currently includes:

- **Oni** - Vanguard - armored wall with crushing pressure and stubborn defense
- **Yurei** - Phantom - evasive spirit blade built for feints and slippery spacing
- **Ronin** - Duelist - disciplined swordsman who wins clean exchanges in neutral
- **Hana** - Duelist - fast lunge specialist with sharp burst offense
- **Kasumi** - Assassin - punishes hesitation with fast entries and fast exits
- **Suzu** - Assassin - balanced rushdown pick with steady pressure and control
- **Shogun** - Vanguard - heavy commander who holds ground and punishes overcommitment
- **Kenji** - Duelist - clean step-in striker with efficient chase tools
- **Jiro** - Phantom - low-commitment trickster who thrives on awkward timing
- **Takeshi** - Phantom - scrappy mid-range fighter built around unpredictable tempo
- **Musashi** - Vanguard - classic powerhouse with dominant presence and sturdy guard
- **Kage** - Assassin - shadow assassin who turns one read into a full momentum swing

### Stage backgrounds

Current selectable stages and their source art:

- **Crimson Gate** - `public/background/01-crimson-gate.png`
- **Neon Dusk** - `public/background/02-neon-dusk.png`
- **Silent Dojo** - `public/background/03-silent-dojo.png`
- **Moon Garden** - `public/background/04-moonlight-garden.png`
- **Temple Steps** - `public/background/05-temple-steps.png`
- **Bamboo Sanctum** - `public/background/06-bamboo-sanctum.png`
- **Stone Courtyard** - `public/background/07-stone-courtyard.png`
- **Night Market** - `public/background/08-night-market.png`

### UI art assets

The current menu and HUD presentation uses these asset groups:

- `public/elements/screen-background.png` for the selection-screen backdrop
- `public/elements/title-character-select.png` and `public/elements/title-scene-select.png` for the menu titles
- `public/elements/frame-active.png`, `frame-non-active.png`, `frame-scene.png`, and `frame-scene-select.png` for card frames and selection states
- `public/elements/cta.png` and `cta-back.png` for the call-to-action and back buttons
- `public/elements/timer.png` for the HUD timer frame
- `public/title-bushido-blitz.png`, `public/icon.png`, and the favicon/app icon set for branding and install surfaces

## Project Structure

```txt
bushido-blitz/
├── index.html
├── bushido-blitz.html        # legacy single-file reference
├── src/
│   ├── main.js
│   ├── styles/
│   │   └── game.css
│   └── game/
│       ├── app.js
│       ├── config.js
│       ├── dom.js
│       ├── fighter.js
│       ├── input.js
│       ├── scene.js
│       ├── sprites.js
│       └── state.js
├── public/
│   ├── background/
│   ├── elements/
│   └── sprites/
├── scripts/
│   └── pack-craftpix-strips.mjs
├── docs/
├── package.json
└── pnpm-lock.yaml
```

## Implementation Notes

- `src/game/config.js` defines gameplay tuning, roster metadata, animation maps, and stages.
- `src/game/fighter.js` handles movement, attacks, parries, hit logic, and animation stepping.
- `src/game/scene.js` owns the renderer, camera, arena props, and stage presentation.
- `src/game/input.js` separates keyboard, touch, AI, and future remote input sources.
- `public/background/` stores the painted stage art used in the scene picker and arena presentation.
- `public/elements/` stores the current menu, button, frame, and HUD overlay graphics.
- `bushido-blitz.html` remains in the repo as a legacy one-file reference during the Vite split.

## Roadmap

- Wire the reserved online mode to a small relay-backed remote input source.
- Add sound and richer fight feedback.
- Continue tuning roster feel, round pacing, and stage presentation.

## Team

- **Jonathan** - Lead Developer - [Rixouu](https://github.com/Rixouu)
