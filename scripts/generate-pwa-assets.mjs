import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const publicDir = path.join(projectRoot, "public");
const sourceIcon = path.join(publicDir, "icon.png");

const BACKGROUND = "#160B0A";
const REGULAR_ICON_SIZES = [16, 32, 180, 192, 512];
const MASKABLE_ICON_SIZES = [192, 512];

function outputPath(name) {
  return path.join(publicDir, name);
}

async function renderRegularIcon(size, destination) {
  await sharp(sourceIcon)
    .resize(size, size, {
      fit: "cover",
      position: "centre",
    })
    .png()
    .toFile(destination);
}

async function renderMaskableIcon(size, destination) {
  const inset = Math.round(size * 0.8);
  const padding = Math.floor((size - inset) / 2);

  const resized = await sharp(sourceIcon)
    .resize(inset, inset, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BACKGROUND,
    },
  })
    .composite([{ input: resized, left: padding, top: padding }])
    .png()
    .toFile(destination);
}

function buildFaviconIco() {
  const result = spawnSync(
    "magick",
    [
      outputPath("favicon-16x16.png"),
      outputPath("favicon-32x32.png"),
      outputPath("favicon.ico"),
    ],
    { stdio: "inherit" },
  );

  if (result.status !== 0) {
    throw new Error("Failed to build favicon.ico with ImageMagick.");
  }
}

async function main() {
  const regularTargets = {
    16: "favicon-16x16.png",
    32: "favicon-32x32.png",
    180: "apple-touch-icon.png",
    192: "android-chrome-192x192.png",
    512: "android-chrome-512x512.png",
  };

  await Promise.all([
    ...REGULAR_ICON_SIZES.map((size) =>
      renderRegularIcon(size, outputPath(regularTargets[size] ?? "favicon.png")),
    ),
    renderRegularIcon(512, outputPath("favicon.png")),
    ...MASKABLE_ICON_SIZES.map((size) =>
      renderMaskableIcon(size, outputPath(`android-chrome-${size}x${size}-maskable.png`)),
    ),
  ]);

  buildFaviconIco();

  console.log("Generated PWA icons in public/.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
