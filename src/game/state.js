export const G = {
  screen: "title",
  mode: "local",
  selecting: 1,
  picks: { 1: null, 2: null },
  stage: null,
  scores: { 1: 0, 2: 0 },
  sources: { 1: null, 2: null },
  round: null,
  edges: { 1: null, 2: null },
};

export const F = { 1: null, 2: null };

export function makeEdge() {
  return { attack: false, heavy: false, jump: false, prev: {} };
}
