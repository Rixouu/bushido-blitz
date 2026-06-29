import * as THREE from "three";

import { FRAME_W, SPRITE_BASE, getAnimDef, getAnimFile } from "./config.js";

const texLoader = new THREE.TextureLoader();

function detectSheetFrameCount(texture, fallbackFrames) {
  const image = texture?.image;
  const width = image?.naturalWidth || image?.width || 0;

  if (width >= FRAME_W && width % FRAME_W === 0) {
    return width / FRAME_W;
  }

  return fallbackFrames;
}

function configureSheetTexture(texture) {
  const image = texture?.image;
  const width = image?.naturalWidth || image?.width || 0;

  if (width <= 0) {
    return false;
  }

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.wrapS = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return true;
}

function applySheetFrameLayout(texture, fallbackFrames) {
  const image = texture?.image;
  const width = image?.naturalWidth || image?.width || 0;
  const frameCount = detectSheetFrameCount(texture, fallbackFrames);
  texture.userData.frameCount = frameCount;
  texture.repeat.set(1 / frameCount, 1);
  if (width > 0) {
    texture.needsUpdate = true;
  }
  return frameCount;
}

export function loadSheet(roster, anim) {
  const charId = roster.spriteFolder || roster.id;
  const def = getAnimDef(roster, anim);
  const file = getAnimFile(roster, anim);
  const tex = texLoader.load(`${SPRITE_BASE}/${charId}/${file}.png`, (loadedTex) => {
    configureSheetTexture(loadedTex);
    applySheetFrameLayout(loadedTex, def.frames);
  });
  configureSheetTexture(tex);
  applySheetFrameLayout(tex, def.frames);
  return tex;
}

export function getSheetFrameCount(texture, fallbackFrames) {
  return texture?.userData?.frameCount || fallbackFrames;
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
