const SIMULATED_LANDSCAPE_CLASS = "simulated-landscape";

export function isMobileTouchViewport() {
  return window.matchMedia("(pointer: coarse)").matches && navigator.maxTouchPoints > 0;
}

export function isNativeLandscape() {
  return window.matchMedia("(orientation: landscape)").matches;
}

export function isSimulatedLandscape() {
  return document.body?.classList.contains(SIMULATED_LANDSCAPE_CLASS) ?? false;
}

export function isLandscapeViewport() {
  return isNativeLandscape() || isSimulatedLandscape();
}

export function shouldPromptForLandscape() {
  return isMobileTouchViewport() && !isLandscapeViewport();
}

export function setSimulatedLandscape(active) {
  document.body?.classList.toggle(SIMULATED_LANDSCAPE_CLASS, active);
}

export function syncLandscapeMode() {
  if (isNativeLandscape()) {
    setSimulatedLandscape(false);
  }
}

export function getViewportSize() {
  if (isSimulatedLandscape() && !isNativeLandscape()) {
    return {
      width: window.innerHeight,
      height: window.innerWidth,
    };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

export function mapViewportPoint(x, y) {
  if (isSimulatedLandscape() && !isNativeLandscape()) {
    return {
      x: window.innerHeight - y,
      y: x,
    };
  }

  return { x, y };
}
