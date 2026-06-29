import * as THREE from "three";

import { ASSET_MODE, CFG, FRAME_H, FRAME_W, getAnimDef, resolveAnimName } from "./config.js";
import { scene } from "./scene.js";
import { loadSheet, makePlaceholder } from "./sprites.js";

const DESKTOP_FIGHTER_VISUAL_BOOST = 1.32;
const MOBILE_FIGHTER_VISUAL_BOOST = 1.38;
const MOBILE_LANDSCAPE_FIGHTER_VISUAL_BOOST = 1.68;
const FIGHTER_COLLISION_RADIUS = 0.64;
const FIGHTER_COLLISION_SCALE_GAIN = 0.25;

function getFighterVisualBoost() {
  const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
  const isLandscape = window.matchMedia("(orientation: landscape)").matches;
  if (isTouchDevice && isLandscape) {
    return MOBILE_LANDSCAPE_FIGHTER_VISUAL_BOOST;
  }
  if (isTouchDevice) {
    return MOBILE_FIGHTER_VISUAL_BOOST;
  }
  return DESKTOP_FIGHTER_VISUAL_BOOST;
}

export class Fighter {
  constructor(roster, facing, fx) {
    this.r = roster;
    this.facing = facing;
    this.fx = fx;

    this.placeholderTex = makePlaceholder(roster.emoji, roster.tint);
    const material = new THREE.MeshBasicMaterial({
      map: this.placeholderTex,
      transparent: true,
      alphaTest: 0.5,
      toneMapped: false,
    });
    const aspect = FRAME_H / FRAME_W;
    const planeHeight = 2.3 * aspect;
    this.visualScale = (this.r.visualScale || 1) * getFighterVisualBoost();
    this.collisionRadius =
      FIGHTER_COLLISION_RADIUS + Math.max(0, this.visualScale - 1) * FIGHTER_COLLISION_SCALE_GAIN;
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.3, planeHeight), material);
    this.baseY = 1.85 + (planeHeight * (this.visualScale - 1)) / 2;
    this.groundOffset = 0;
    this.mesh.position.y = this.baseY;
    scene.add(this.mesh);

    this.anim = "";
    this.frame = 0;
    this.frameT = 0;
    this.animDone = false;

    this.reset(facing > 0 ? -CFG.spawnX : CFG.spawnX);
  }

  reset(x) {
    this.x = x;
    this.y = 0;
    this.vy = 0;
    this.hp = CFG.maxHP;
    this.stam = 3;
    this.state = "idle";
    this.stateT = 0;
    this.attack = null;
    this.stun = 0;
    this.dashV = 0;
    this.parryActive = 0;
    this.parriedTimer = 0;
    this.dead = false;
    this.mesh.rotation.z = 0;
    this.mesh.position.y = this.baseY;
    this.play("idle");
    this.sync();
  }

  sync() {
    this.mesh.position.x = this.x;
    this.mesh.position.y = this.baseY + this.groundOffset + this.y;
    this.mesh.scale.x = this.facing * this.visualScale;
    this.mesh.scale.y = this.visualScale;
  }

  setGroundOffset(offset = 0) {
    this.groundOffset = offset;
    this.sync();
  }

  play(name) {
    const animName = resolveAnimName(this.r, name);

    this.state = name;
    if (this.anim === animName) {
      return;
    }

    this.anim = animName;
    this.frame = 0;
    this.frameT = 0;
    this.animDone = false;

    if (ASSET_MODE === "sheet") {
      const tex = loadSheet(this.r, animName);
      this.mesh.material.map = tex;
      tex.offset.x = 0;
      this.mesh.material.needsUpdate = true;
    }
  }

  stepAnim(dt) {
    const def = getAnimDef(this.r, this.anim);
    if (!def) {
      return;
    }

    this.frameT += dt;
    const spf = 1 / def.fps;
    while (this.frameT >= spf) {
      this.frameT -= spf;
      if (this.frame < def.frames - 1) {
        this.frame += 1;
      } else if (def.loop) {
        this.frame = 0;
      } else {
        this.animDone = true;
      }
    }

    if (ASSET_MODE === "sheet") {
      const tex = this.mesh.material.map;
      if (tex) {
        tex.offset.x = this.frame / def.frames;
      }
    }
  }

  canAct() {
    return !this.dead && this.stun <= 0 && this.parriedTimer <= 0 && !this.attack && this.state !== "hurt";
  }

  startAttack(type) {
    if (!this.canAct()) {
      return;
    }

    const spec = type === "heavy" ? CFG.heavy : type === "lunge" ? CFG.lunge : CFG.light;
    this.attack = { type, t: 0, spec, hasHit: false };
    if (type === "lunge") {
      this.play("lunge");
      this.dashV = CFG.lunge.dash * this.facing;
      return;
    }

    this.play(type === "heavy" ? "attack2" : "attack1");
  }

  startShield() {
    if (!this.canAct() || this.stam <= 0) {
      return;
    }

    this.play("shield");
    this.parryActive = CFG.parryWindow;
    this.state = "shield";
  }

  takeHit(dmg, push, fromFacing) {
    if (this.dead) {
      return;
    }

    this.hp = Math.max(0, this.hp - dmg);
    this.stun = CFG.hitstun;
    this.attack = null;
    this.x += push * fromFacing;

    if (this.hp <= 0) {
      this.dead = true;
      this.play("dead");
    } else {
      this.play("hurt");
    }
  }

  onParried() {
    this.attack = null;
    this.parriedTimer = CFG.parryStun;
    this.play("hurt");
  }

  update(dt, input, foe) {
    this.stateT += dt;
    if (this.stun > 0) {
      this.stun -= dt;
    }
    if (this.parriedTimer > 0) {
      this.parriedTimer -= dt;
    }
    if (this.parryActive > 0) {
      this.parryActive -= dt;
    }

    if (this.canAct() && Math.abs(foe.x - this.x) > 0.05) {
      this.facing = foe.x > this.x ? 1 : -1;
    }

    let moving = false;
    if (this.canAct() && this.state !== "shield") {
      const speed = (input.run ? CFG.runSpeed : CFG.walkSpeed) * this.r.speed;
      if (input.left) {
        this.x -= speed * dt;
        moving = true;
        this.facing = -1;
      }
      if (input.right) {
        this.x += speed * dt;
        moving = true;
        this.facing = 1;
      }
      if (input.jump && this.y <= 0.001) {
        this.vy = CFG.jumpVel;
        this.play("jump");
      }
    }

    if (this.attack && this.attack.type === "lunge") {
      this.x += this.dashV * dt;
      this.dashV *= 0.86;
    }

    this.vy -= CFG.gravity * dt;
    this.y += this.vy * dt;
    if (this.y < 0) {
      this.y = 0;
      this.vy = 0;
    }

    if (this.attack) {
      const { attack } = this;
      const { spec } = attack;
      attack.t += dt;

      const inActive = attack.t >= spec.startup && attack.t < spec.startup + spec.active;
      if (inActive && !attack.hasHit) {
        const dist = Math.abs(foe.x - this.x);
        const facingFoe = (foe.x > this.x ? 1 : -1) === this.facing;
        if (facingFoe && dist <= spec.range && Math.abs(foe.y - this.y) < 1.2) {
          attack.hasHit = true;

          if (foe.state === "shield" && foe.parryActive > 0 && (this.x > foe.x ? -1 : 1) === foe.facing) {
            foe.stam = Math.min(3, foe.stam);
            this.onParried();
            this.fx.onParry();
          } else if (foe.state === "shield" && foe.stam > 0) {
            foe.stam -= 1;
            foe.x += spec.push * 0.5 * this.facing;
            foe.hp = Math.max(0, foe.hp - Math.ceil(spec.dmg * 0.15));
            if (foe.hp <= 0) {
              foe.dead = true;
              foe.play("dead");
            }
            this.fx.onBlock();
          } else {
            foe.takeHit(spec.dmg, spec.push, this.facing);
            this.fx.onClash(spec.dmg >= 20);
            this.fx.onPunch(0.35);
          }
        }
      }

      if (attack.t >= spec.startup + spec.active + spec.recover) {
        this.attack = null;
        this.play("idle");
      }
    }

    if (!this.attack && !this.dead && this.stun <= 0 && this.parriedTimer <= 0) {
      if (this.state === "shield") {
        if (!input.shield) {
          this.play("idle");
        }
      } else if (this.y > 0.02) {
        this.play("jump");
      } else if (moving) {
        this.play(input.run ? "run" : "walk");
      } else if (this.state !== "hurt" || this.stateT > 0.2) {
        this.play("idle");
      }
    }

    this.x = Math.max(-CFG.arenaHalf, Math.min(CFG.arenaHalf, this.x));
    this.stepAnim(dt);

    if (ASSET_MODE === "placeholder") {
      if (this.state === "idle") {
        this.mesh.position.y = this.baseY + this.groundOffset + this.y + Math.sin(this.stateT * 3) * 0.03;
      } else {
        this.mesh.position.y = this.baseY + this.groundOffset + this.y;
      }

      let targetRot = 0;
      if (this.attack) {
        targetRot = -0.25 * this.facing;
      }
      if (this.state === "shield") {
        targetRot = 0.12 * this.facing;
      }
      if (this.dead) {
        targetRot = 1.4 * this.facing;
      }
      if (this.state === "hurt") {
        targetRot = 0.2 * this.facing;
      }
      this.mesh.rotation.z = THREE.MathUtils.lerp(this.mesh.rotation.z, targetRot, this.dead ? 0.1 : 0.3);
    } else {
      this.mesh.position.y = this.baseY + this.groundOffset + this.y;
      this.mesh.rotation.z = 0;
    }

    this.sync();
  }

  dispose() {
    scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    this.placeholderTex.dispose();
  }
}
