export const CFG = {
  roundsToWin: 2,
  arenaHalf: 6.5,
  walkSpeed: 3.0,
  runSpeed: 6.2,
  jumpVel: 7.5,
  gravity: 22,
  light: { range: 1.7, startup: 0.1, active: 0.08, recover: 0.22, dmg: 12, push: 0.6 },
  heavy: { range: 1.9, startup: 0.2, active: 0.09, recover: 0.36, dmg: 22, push: 1.2 },
  lunge: { range: 2.4, startup: 0.14, active: 0.1, recover: 0.4, dmg: 16, push: 1.6, dash: 5.5 },
  parryWindow: 0.18,
  parryStun: 0.55,
  shieldHold: 0.0,
  maxHP: 100,
  hitstun: 0.32,
  aiReact: 0.16,
};

export const ASSET_MODE = "sheet";
export const SPRITE_BASE = "/sprites";

export const ANIM_PROFILES = {
  guard: {
    defs: {
      idle: { frames: 6, fps: 8, loop: true },
      walk: { frames: 8, fps: 12, loop: true },
      run: { frames: 8, fps: 14, loop: true },
      jump: { frames: 12, fps: 12, loop: false },
      attack1: { frames: 4, fps: 16, loop: false },
      attack2: { frames: 4, fps: 14, loop: false },
      hurt: { frames: 5, fps: 12, loop: false },
      dead: { frames: 3, fps: 8, loop: false },
      shield: { frames: 2, fps: 10, loop: true },
    },
    files: {
      idle: "Idle",
      walk: "Walk",
      run: "Run",
      jump: "Jump",
      attack1: "Attack_1",
      attack2: "Attack_2",
      hurt: "Hurt",
      dead: "Dead",
      shield: "Shield",
    },
    alias: {
      steady: "idle",
      lunge: "attack2",
      shield: "shield",
      fire: "attack1",
    },
  },
  runner: {
    defs: {
      idle: { frames: 6, fps: 8, loop: true },
      walk: { frames: 12, fps: 12, loop: true },
      run: { frames: 12, fps: 14, loop: true },
      runattack: { frames: 5, fps: 16, loop: false },
      jump: { frames: 10, fps: 12, loop: false },
      attack1: { frames: 5, fps: 16, loop: false },
      attack2: { frames: 3, fps: 14, loop: false },
      hurt: { frames: 3, fps: 12, loop: false },
      dead: { frames: 5, fps: 8, loop: false },
    },
    files: {
      idle: "Idle",
      walk: "Walk",
      run: "Run",
      runattack: "Run+Attack",
      jump: "Jump",
      attack1: "Attack_1",
      attack2: "Attack_2",
      hurt: "Hurt",
      dead: "Dead",
    },
    alias: {
      steady: "idle",
      lunge: "runattack",
      shield: "idle",
      fire: "attack1",
    },
  },
};

export const FRAME_W = 128;
export const FRAME_H = 128;

export function getAnimProfile(roster) {
  return ANIM_PROFILES[roster.animProfile] || ANIM_PROFILES.runner;
}

export function resolveAnimName(roster, name) {
  const profile = getAnimProfile(roster);
  if (profile.defs[name]) {
    return name;
  }
  return profile.alias[name] || "idle";
}

export function getAnimDef(roster, name) {
  const profile = getAnimProfile(roster);
  const resolved = resolveAnimName(roster, name);
  return profile.defs[resolved];
}

export function getAnimFile(roster, name) {
  const profile = getAnimProfile(roster);
  const resolved = resolveAnimName(roster, name);
  return profile.files[resolved] || resolved;
}

export const ROSTER = [
  {
    id: "oni",
    spriteFolder: "01-oni",
    animProfile: "guard",
    archetype: "Vanguard",
    name: "Oni",
    emoji: "👹",
    tint: 0xb84536,
    speed: 0.92,
    blurb: "Armored wall with crushing pressure and stubborn defense.",
  },
  {
    id: "yurei",
    spriteFolder: "02-yurei",
    animProfile: "guard",
    archetype: "Phantom",
    name: "Yurei",
    emoji: "👻",
    tint: 0x7c90c6,
    speed: 1.02,
    blurb: "Evasive spirit blade built for feints and slippery spacing.",
  },
  {
    id: "ronin",
    spriteFolder: "03-ronin",
    animProfile: "guard",
    archetype: "Duelist",
    name: "Ronin",
    emoji: "⚔️",
    tint: 0xc27b4e,
    speed: 1.0,
    blurb: "Disciplined swordsman who wins clean exchanges in neutral.",
  },
  {
    id: "hana",
    spriteFolder: "04-hana",
    animProfile: "runner",
    archetype: "Duelist",
    name: "Hana",
    emoji: "🌸",
    tint: 0xc45b88,
    speed: 1.08,
    blurb: "Fast lunge specialist with sharp burst offense.",
  },
  {
    id: "kasumi",
    spriteFolder: "05-kasumi",
    animProfile: "runner",
    archetype: "Assassin",
    name: "Kasumi",
    emoji: "🦊",
    tint: 0x4f8a6b,
    speed: 1.07,
    blurb: "Punishes hesitation with fast entries and fast exits.",
  },
  {
    id: "suzu",
    spriteFolder: "06-suzu",
    animProfile: "runner",
    archetype: "Assassin",
    name: "Suzu",
    emoji: "🗡️",
    tint: 0x8a7bb0,
    speed: 1.05,
    blurb: "Balanced rushdown pick with steady pressure and control.",
  },
  {
    id: "shogun",
    spriteFolder: "07-shogun",
    animProfile: "guard",
    archetype: "Vanguard",
    name: "Shogun",
    emoji: "🛡️",
    tint: 0x6b4f3c,
    speed: 0.93,
    blurb: "Heavy commander who holds ground and punishes overcommitment.",
  },
  {
    id: "kenji",
    spriteFolder: "08-kenji",
    animProfile: "runner",
    archetype: "Duelist",
    name: "Kenji",
    emoji: "🗡️",
    tint: 0x5f8fd6,
    speed: 1.03,
    blurb: "Clean step-in striker with efficient chase tools.",
  },
  {
    id: "jiro",
    spriteFolder: "09-jiro",
    animProfile: "runner",
    archetype: "Phantom",
    name: "Jiro",
    emoji: "🌫️",
    tint: 0x6b7c99,
    speed: 1.01,
    blurb: "Low-commitment trickster who thrives on awkward timing.",
  },
  {
    id: "takeshi",
    spriteFolder: "10-takeshi",
    animProfile: "runner",
    archetype: "Phantom",
    name: "Takeshi",
    emoji: "🌒",
    tint: 0x8c6a52,
    speed: 0.98,
    blurb: "Scrappy mid-range fighter built around unpredictable tempo.",
  },
  {
    id: "musashi",
    spriteFolder: "11-musashi",
    animProfile: "guard",
    archetype: "Vanguard",
    name: "Musashi",
    emoji: "🏯",
    tint: 0x9b8b56,
    speed: 0.95,
    blurb: "Classic powerhouse with dominant presence and sturdy guard.",
  },
  {
    id: "kage",
    spriteFolder: "12-kage",
    animProfile: "guard",
    archetype: "Assassin",
    name: "Kage",
    emoji: "🥷",
    tint: 0x5a5d57,
    speed: 1.0,
    blurb: "Shadow assassin who turns one read into a full momentum swing.",
  },
];

export const STAGES = [
  {
    id: "courtyard",
    name: "Stone Courtyard",
    sky: 0xcfc9b8,
    ground: 0x9a8f78,
    haze: 0xe2dcc8,
    background: "/background/07-stone-courtyard.png",
  },
  {
    id: "dusk",
    name: "Neon Dusk",
    sky: 0xc98a6e,
    ground: 0x7a4f40,
    haze: 0xb83227,
    background: "/background/02-neon-dusk.png",
  },
  {
    id: "bamboo",
    name: "Bamboo Sanctum",
    sky: 0xbcc6ad,
    ground: 0x5f7a55,
    haze: 0xd6e0c2,
    background: "/background/06-bamboo-sanctum.png",
  },
  {
    id: "moon",
    name: "Moonlight Garden",
    sky: 0x3b4458,
    ground: 0x2a3344,
    haze: 0x6b7c99,
    background: "/background/04-moonlight-garden.png",
  },
];
