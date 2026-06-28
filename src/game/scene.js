import * as THREE from "three";

import { CFG } from "./config.js";
import { app } from "./dom.js";

export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.style.cssText = "position:absolute;inset:0;z-index:1";
app.prepend(renderer.domElement);

export const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xe2dcc8, 14, 36);

export const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
export const CAM_BASE = new THREE.Vector3(0, 2.7, 12.5);
camera.position.copy(CAM_BASE);
camera.lookAt(0, 1.7, 0);

scene.add(new THREE.AmbientLight(0xb6ad92, 0.6));
const sun = new THREE.DirectionalLight(0xfff1d6, 1.1);
sun.position.set(-6, 9, 6);
scene.add(sun);

const groundMat = new THREE.MeshStandardMaterial({ color: 0x9a8f78, roughness: 1 });
const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 40), groundMat);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

const skyMat = new THREE.MeshBasicMaterial({ color: 0xcfc9b8 });
const sky = new THREE.Mesh(new THREE.PlaneGeometry(80, 30), skyMat);
sky.position.set(0, 8, -16);
scene.add(sky);
const bgLoader = new THREE.TextureLoader();
const bgCache = new Map();

const props = new THREE.Group();
scene.add(props);

let shake = 0;

function clearProps() {
  const geometries = new Set();
  const materials = new Set();

  props.traverse((child) => {
    if (child.geometry) {
      geometries.add(child.geometry);
    }
    if (Array.isArray(child.material)) {
      child.material.forEach((material) => materials.add(material));
    } else if (child.material) {
      materials.add(child.material);
    }
  });

  props.clear();
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
}

function addMesh(geometry, material, x, y, z, ry = 0, rx = 0) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.rotation.y = ry;
  mesh.rotation.x = rx;
  props.add(mesh);
  return mesh;
}

function buildLanternPair(x, z, stoneMat, glowMat) {
  addMesh(new THREE.CylinderGeometry(0.12, 0.18, 1.2, 6), stoneMat, x, 0.6, z);
  addMesh(new THREE.BoxGeometry(0.55, 0.18, 0.55), stoneMat, x, 1.28, z);
  addMesh(new THREE.BoxGeometry(0.34, 0.34, 0.34), glowMat, x, 1.15, z);
  addMesh(new THREE.ConeGeometry(0.38, 0.28, 4), stoneMat, x, 1.54, z);
}

function buildBambooCluster(x, z, stalkMat, leafMat) {
  [-0.24, 0, 0.22].forEach((offset, index) => {
    const stalk = addMesh(
      new THREE.CylinderGeometry(0.09, 0.11, 3.2 + index * 0.4, 7),
      stalkMat,
      x + offset,
      1.6 + index * 0.18,
      z + index * 0.08,
      0,
      0.04 * (index - 1),
    );
    stalk.rotation.z = 0.03 * (index - 1);
  });

  addMesh(new THREE.SphereGeometry(0.38, 8, 8), leafMat, x - 0.18, 3.2, z - 0.1);
  addMesh(new THREE.SphereGeometry(0.46, 8, 8), leafMat, x + 0.1, 3.46, z + 0.06);
}

function buildCourtyardProps(stage) {
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x6d3b2d, roughness: 0.86 });
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x8d8171, roughness: 0.98 });
  const glowMat = new THREE.MeshStandardMaterial({
    color: 0xd8c6a1,
    emissive: 0xcda43c,
    emissiveIntensity: 0.22,
    roughness: 0.7,
  });

  [-10.8, -7.8, 7.8, 10.8].forEach((x) => buildLanternPair(x, -5.8, stoneMat, glowMat));

  [-11.6, 11.6].forEach((x) => {
    addMesh(new THREE.BoxGeometry(0.42, 3.4, 0.42), woodMat, x, 1.7, -7.4);
    addMesh(new THREE.BoxGeometry(1.8, 0.34, 0.5), woodMat, x, 3.22, -7.4);
  });

  for (let i = -2; i <= 2; i += 1) {
    addMesh(new THREE.BoxGeometry(0.2, 1.5, 0.2), stoneMat, i * 1.7, 0.75, -8.2);
  }

  addMesh(
    new THREE.TorusGeometry(8.8, 0.08, 8, 48, Math.PI),
    new THREE.MeshBasicMaterial({ color: stage.haze }),
    0,
    0.06,
    -6.9,
    Math.PI,
    Math.PI / 2,
  );
}

function buildDuskProps() {
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x221927, roughness: 0.52, metalness: 0.35 });
  const magentaMat = new THREE.MeshStandardMaterial({
    color: 0xff5ca8,
    emissive: 0xb83227,
    emissiveIntensity: 0.82,
    roughness: 0.28,
  });
  const cyanMat = new THREE.MeshStandardMaterial({
    color: 0x69d2ff,
    emissive: 0x2563eb,
    emissiveIntensity: 0.74,
    roughness: 0.24,
  });

  [-10.5, -7.8, 7.8, 10.5].forEach((x, index) => {
    const accent = index % 2 === 0 ? magentaMat : cyanMat;
    addMesh(new THREE.BoxGeometry(0.24, 3.8, 0.24), darkMat, x, 1.9, -6.5);
    addMesh(new THREE.BoxGeometry(0.68, 0.18, 0.18), accent, x, 2.95, -6.26);
    addMesh(new THREE.BoxGeometry(0.92, 0.16, 0.16), accent, x, 2.45, -6.22);
  });

  for (let i = 0; i < 4; i += 1) {
    const accent = i % 2 === 0 ? magentaMat : cyanMat;
    const side = i < 2 ? -1 : 1;
    const x = side * (7 + (i % 2) * 2.3);
    addMesh(new THREE.BoxGeometry(1.1, 0.22, 0.22), accent, x, 1.85 + (i % 2) * 0.4, -5.6);
    addMesh(new THREE.BoxGeometry(0.18, 1.3, 0.18), darkMat, x, 0.68, -5.72);
  }

  addMesh(new THREE.BoxGeometry(5.8, 0.08, 0.14), cyanMat, 0, 2.8, -8.5);
}

function buildBambooProps() {
  const stalkMat = new THREE.MeshStandardMaterial({ color: 0x5d8754, roughness: 0.92 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x86ab62, roughness: 0.96 });
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x66715d, roughness: 1 });

  [-10.8, -8.4, -6.2, 6.2, 8.4, 10.8].forEach((x, index) => {
    buildBambooCluster(x, -5.8 - (index % 2) * 0.45, stalkMat, leafMat);
  });

  [-9.2, -6.8, 6.8, 9.2].forEach((x, index) => {
    const rock = addMesh(new THREE.DodecahedronGeometry(0.5 + (index % 2) * 0.16, 0), rockMat, x, 0.32, -4.6);
    rock.scale.y = 0.58;
  });

  addMesh(new THREE.CylinderGeometry(0.05, 0.05, 12, 10), stalkMat, 0, 0.4, -8.8, Math.PI / 2);
}

function buildMoonProps() {
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x71798a, roughness: 1 });
  const shrubMat = new THREE.MeshStandardMaterial({ color: 0x4b5d56, roughness: 0.96 });
  const glowMat = new THREE.MeshStandardMaterial({
    color: 0xe7d9b0,
    emissive: 0x8aa7ff,
    emissiveIntensity: 0.3,
    roughness: 0.62,
  });

  [-10.4, -7.3, 7.3, 10.4].forEach((x) => buildLanternPair(x, -5.9, stoneMat, glowMat));

  [-9, 9].forEach((x) => {
    const shrubBase = addMesh(new THREE.CylinderGeometry(0.16, 0.2, 1.4, 6), stoneMat, x, 0.7, -6.8);
    shrubBase.rotation.z = x < 0 ? -0.08 : 0.08;
    addMesh(new THREE.SphereGeometry(0.72, 10, 10), shrubMat, x, 1.84, -6.74);
    addMesh(new THREE.SphereGeometry(0.46, 10, 10), shrubMat, x + (x < 0 ? -0.45 : 0.45), 2.2, -6.58);
  });

  [-4.2, 0, 4.2].forEach((x, index) => {
    const stone = addMesh(new THREE.DodecahedronGeometry(0.65 + index * 0.06, 0), stoneMat, x, 0.26, -4.7 - index * 0.25);
    stone.scale.y = 0.46;
  });
}

export function buildProps(stage) {
  clearProps();

  switch (stage.id) {
    case "courtyard":
      buildCourtyardProps(stage);
      break;
    case "dusk":
      buildDuskProps();
      break;
    case "bamboo":
      buildBambooProps();
      break;
    case "moon":
      buildMoonProps();
      break;
    default:
      buildCourtyardProps(stage);
      break;
  }
}

export function applyStage(stage) {
  skyMat.color.setHex(stage.sky);
  groundMat.color.setHex(stage.ground);
  scene.fog.color.setHex(stage.haze);
  renderer.setClearColor(stage.sky, 1);
  buildProps(stage);

  if (stage.background) {
    let texture = bgCache.get(stage.background);
    if (!texture) {
      texture = bgLoader.load(stage.background);
      bgCache.set(stage.background, texture);
    }
    skyMat.map = texture;
    skyMat.color.setHex(0xffffff);
  } else {
    skyMat.map = null;
  }
  skyMat.needsUpdate = true;
}

export function punch(value) {
  shake = Math.max(shake, value);
}

export function stepCamera(midpoint) {
  CAM_BASE.x = midpoint * 0.12;

  if (shake > 0.001) {
    camera.position.x = CAM_BASE.x + (Math.random() - 0.5) * shake;
    camera.position.y = CAM_BASE.y + (Math.random() - 0.5) * shake;
    shake *= 0.85;
  } else {
    camera.position.x += (CAM_BASE.x - camera.position.x) * 0.1;
    camera.position.y = CAM_BASE.y;
  }

  camera.position.z = CAM_BASE.z;
  camera.lookAt(0, 1.7, 0);
}

export function renderScene() {
  renderer.render(scene, camera);
}

export function recomputeArena() {
  const dist = camera.position.z;
  const vFov = THREE.MathUtils.degToRad(camera.fov);
  const visH = 2 * Math.tan(vFov / 2) * dist;
  const visW = visH * camera.aspect;
  CFG.arenaHalf = Math.max(3.2, visW / 2 - 1.3);
}

export function resizeScene() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  recomputeArena();
}
