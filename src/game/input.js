import { CFG } from "./config.js";

export class KeyboardSource {
  constructor(map) {
    this.map = map;
    this.keys = {};
    this.label = "KEYBOARD";

    this._down = (event) => {
      if (Object.values(this.map).includes(event.code)) {
        event.preventDefault();
        this.keys[event.code] = true;
      }
    };

    this._up = (event) => {
      if (Object.values(this.map).includes(event.code)) {
        event.preventDefault();
        this.keys[event.code] = false;
      }
    };

    window.addEventListener("keydown", this._down);
    window.addEventListener("keyup", this._up);
  }

  read() {
    const { keys, map } = this;
    return {
      left: !!keys[map.left],
      right: !!keys[map.right],
      jump: !!keys[map.jump],
      attack: !!keys[map.attack],
      heavy: !!keys[map.heavy],
      shield: !!keys[map.shield],
      run: !!keys[map.run],
    };
  }

  dispose() {
    window.removeEventListener("keydown", this._down);
    window.removeEventListener("keyup", this._up);
  }
}

export class TouchSource {
  constructor(side) {
    this.side = side;
    this.label = "TOUCH";
    this.s = { left: false, right: false, jump: false, attack: false, heavy: false, shield: false, run: false };
  }

  set(partial) {
    Object.assign(this.s, partial);
  }

  read() {
    const snapshot = { ...this.s };
    this.s.attack = false;
    this.s.heavy = false;
    this.s.jump = false;
    return snapshot;
  }

  dispose() {}
}

export class AISource {
  constructor(getSelf, getFoe, level = 1) {
    this.getSelf = getSelf;
    this.getFoe = getFoe;
    this.level = level;
    this.label = "AI";
    this.t = 0;
    this.decision = {};
    this.next = 0;
  }

  read() {
    const me = this.getSelf();
    const foe = this.getFoe();
    if (!me || !foe) {
      return blankInput();
    }

    this.t += 1 / 60;
    const dist = Math.abs(foe.x - me.x);

    if (this.t >= this.next) {
      this.next = this.t + CFG.aiReact * (0.7 + Math.random() * 0.8);
      const nextDecision = {
        left: false,
        right: false,
        jump: false,
        attack: false,
        heavy: false,
        shield: false,
        run: false,
      };

      if (foe.attack && dist < 2.4 && Math.random() < 0.5) {
        nextDecision.shield = true;
      } else if (dist > 3) {
        if (foe.x > me.x) {
          nextDecision.right = true;
        } else {
          nextDecision.left = true;
        }
        nextDecision.run = Math.random() < 0.6;
        if (dist > 3.5 && Math.random() < 0.25) {
          nextDecision.right = foe.x > me.x;
          nextDecision.left = foe.x < me.x;
          nextDecision.attack = false;
        }
      } else if (dist <= 2.0) {
        if (Math.random() < 0.25) {
          nextDecision.heavy = true;
        } else {
          nextDecision.attack = true;
        }
      } else if (Math.random() < 0.4) {
        if (foe.x > me.x) {
          nextDecision.right = true;
        } else {
          nextDecision.left = true;
        }
      } else {
        nextDecision.attack = true;
      }

      this.decision = nextDecision;
    }

    return { ...this.decision };
  }

  dispose() {}
}

export function blankInput() {
  return { left: false, right: false, jump: false, attack: false, heavy: false, shield: false, run: false };
}
