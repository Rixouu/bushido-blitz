export function isMobileTouchViewport() {
  return window.matchMedia("(pointer: coarse)").matches && navigator.maxTouchPoints > 0;
}

export function isLandscapeViewport() {
  return window.matchMedia("(orientation: landscape)").matches;
}

export function getViewportSize() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

export function mapViewportPoint(x, y) {
  return { x, y };
}
