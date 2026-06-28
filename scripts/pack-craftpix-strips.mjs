import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const DEFAULT_SOURCE_DIR = path.join(projectRoot, "craftpix-source");
const DEFAULT_OUTPUT_DIR = path.join(projectRoot, "public", "sprites");

const ANIMATION_TARGETS = [
  { output: "Run_Attack", tokens: ["runattack", "run_attack", "attackrun"] },
  { output: "Attack1", tokens: ["attack1", "attack_1", "atk1"] },
  { output: "Attack2", tokens: ["attack2", "attack_2", "atk2"] },
  { output: "Idle2", tokens: ["idle2", "idle_2"] },
  { output: "Idle", tokens: ["idle"] },
  { output: "Walk", tokens: ["walk"] },
  { output: "Run", tokens: ["run"] },
  { output: "Jump", tokens: ["jump"] },
  { output: "Hurt", tokens: ["hurt", "hit"] },
  { output: "Dead", tokens: ["dead", "death"] },
];

const CHARACTER_MAP = {
  ronin: "ronin",
  reaper: "reaper",
  kaito: "kaito",
};

function getArg(flag, fallback) {
  const index = process.argv.indexOf(flag);
  if (index === -1) {
    return fallback;
  }
  return process.argv[index + 1] || fallback;
}

function normalize(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function toSlug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function resolveCharacterId(segment) {
  const normalized = normalize(segment);
  for (const [token, stableId] of Object.entries(CHARACTER_MAP)) {
    if (normalized.includes(token)) {
      return stableId;
    }
  }
  return toSlug(segment);
}

function resolveAnimation(filePath) {
  const normalizedPath = normalize(filePath);
  for (const target of ANIMATION_TARGETS) {
    if (target.tokens.some((token) => normalizedPath.includes(token))) {
      return target.output;
    }
  }
  return null;
}

function frameOrder(filePath) {
  const basename = path.basename(filePath, path.extname(filePath));
  const match = basename.match(/(\d+)(?!.*\d)/);
  return match ? Number.parseInt(match[1], 10) : 0;
}

async function walkPngFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return walkPngFiles(fullPath);
      }
      if (entry.isFile() && /\.(png)$/i.test(entry.name)) {
        return [fullPath];
      }
      return [];
    }),
  );
  return files.flat();
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function exists(dir) {
  try {
    await fs.access(dir);
    return true;
  } catch {
    return false;
  }
}

async function packStrip(outputFile, frameFiles) {
  const buffers = await Promise.all(frameFiles.map((file) => fs.readFile(file)));
  const metadata = await Promise.all(buffers.map((buffer) => sharp(buffer).metadata()));

  const { width, height } = metadata[0];
  if (!width || !height) {
    throw new Error(`Could not read frame size for ${outputFile}`);
  }

  metadata.forEach((meta, index) => {
    if (meta.width !== width || meta.height !== height) {
      throw new Error(
        `Frame size mismatch in ${outputFile}: "${path.basename(frameFiles[index])}" is ${meta.width}x${meta.height}, expected ${width}x${height}`,
      );
    }
  });

  const strip = sharp({
    create: {
      width: width * frameFiles.length,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  });

  await strip
    .composite(
      buffers.map((input, index) => ({
        input,
        left: index * width,
        top: 0,
      })),
    )
    .png()
    .toFile(outputFile);
}

async function main() {
  const srcDir = path.resolve(getArg("--src", DEFAULT_SOURCE_DIR));
  const outDir = path.resolve(getArg("--out", DEFAULT_OUTPUT_DIR));

  if (!(await exists(srcDir))) {
    console.error(`Source folder not found: ${srcDir}`);
    console.error("Usage: pnpm pack:sprites -- --src ./path/to/craftpix-export [--out ./public/sprites]");
    process.exitCode = 1;
    return;
  }

  await ensureDir(outDir);

  const pngFiles = await walkPngFiles(srcDir);
  if (pngFiles.length === 0) {
    console.error(`No PNG frames found under ${srcDir}`);
    process.exitCode = 1;
    return;
  }

  const groups = new Map();
  const skipped = [];

  for (const file of pngFiles) {
    const relative = path.relative(srcDir, file);
    const segments = relative.split(path.sep);
    const characterId = resolveCharacterId(segments[0]);
    const animation = resolveAnimation(relative);

    if (!animation) {
      skipped.push(relative);
      continue;
    }

    const groupKey = `${characterId}/${animation}`;
    if (!groups.has(groupKey)) {
      groups.set(groupKey, { characterId, animation, files: [] });
    }
    groups.get(groupKey).files.push(file);
  }

  if (groups.size === 0) {
    console.error("No packable animation groups were detected.");
    console.error("Check your source folder names or update the token maps in scripts/pack-craftpix-strips.mjs.");
    process.exitCode = 1;
    return;
  }

  const outputs = [];
  for (const group of groups.values()) {
    group.files.sort((a, b) => frameOrder(a) - frameOrder(b) || a.localeCompare(b));
    const charDir = path.join(outDir, group.characterId);
    await ensureDir(charDir);

    const outputFile = path.join(charDir, `${group.animation}.png`);
    await packStrip(outputFile, group.files);
    outputs.push({
      outputFile,
      frameCount: group.files.length,
    });
  }

  outputs.sort((a, b) => a.outputFile.localeCompare(b.outputFile));

  console.log(`Packed ${outputs.length} strips into ${outDir}`);
  outputs.forEach(({ outputFile, frameCount }) => {
    console.log(`- ${path.relative(projectRoot, outputFile)} (${frameCount} frames)`);
  });

  if (skipped.length > 0) {
    console.warn(`Skipped ${skipped.length} PNGs with no animation match:`);
    skipped.slice(0, 20).forEach((file) => console.warn(`- ${file}`));
    if (skipped.length > 20) {
      console.warn(`- ...and ${skipped.length - 20} more`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
