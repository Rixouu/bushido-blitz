import * as THREE from "three";

import { SPRITE_BASE, getAnimDef, getAnimFile } from "./config.js";

const texLoader = new THREE.TextureLoader();
const sheetCache = new Map();

export function loadSheet(roster, anim) {
  const charId = roster.spriteFolder || roster.id;
  const key = `${charId}/${anim}`;
  if (sheetCache.has(key)) {
    return sheetCache.get(key);
  }

  const def = getAnimDef(roster, anim);
  const file = getAnimFile(roster, anim);
  const tex = texLoader.load(`${SPRITE_BASE}/${charId}/${file}.png`);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.wrapS = THREE.RepeatWrapping;
  tex.repeat.set(1 / def.frames, 1);
  sheetCache.set(key, tex);
  return tex;
}

export function makePlaceholder(emoji, tint) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;

  const ctx = canvas.getContext("2d");
  const color = `#${tint.toString(16).padStart(6, "0")}`;

  ctx.fillStyle = color;
  ctx.fillRect(100, 72, 56, 140);
  ctx.fillRect(110, 42, 36, 38);
  ctx.fillRect(88, 92, 16, 86);
  ctx.fillRect(152, 92, 16, 86);
  ctx.fillRect(106, 212, 18, 40);
  ctx.fillRect(132, 212, 18, 40);
  ctx.font = "42px serif";
  ctx.textAlign = "center";
  ctx.fillText(emoji, 128, 70);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  return tex;
}
