import { useEffect, useRef, useState } from 'react';
import { BADGES, ROUNDS, isBad } from '../data/content';

/** The game lives in one card on the page: it shows either a round or a level-complete panel. */
export type Screen = 'round' | 'complete';
export type Phase = 'verdict' | 'flags';
export type Verdict = 'scam' | 'legit';
/** A clue index, or a string key for an ordinary (neutral) phrase. */
export type Mark = number | string;

export type GameState = {
  screen: Screen;
  /** Finished rounds, keyed by round id. */
  done: Record<string, true>;
  cur: number; phase: Phase; revealed: boolean;
  verdict: Verdict | null; wrongVerdict: boolean; marked: Mark[]; wrong: Mark | null; quip: string | null; hinted: number[];
  doneLevel: number;
};

// v2: progress keyed by round id (v1 used array positions, which shift when rounds are added).
const KEY = 'scamSpotter.progress.v2';

const freshRound = {
  marked: [], verdict: null, revealed: false, quip: null, hinted: [], phase: 'verdict', wrongVerdict: false, wrong: null,
} satisfies Partial<GameState>;

function initialState(): GameState {
  let done: Record<string, true> = {};
  try { done = JSON.parse(localStorage.getItem(KEY) || '{}').done || {}; } catch { /* private mode etc. */ }
  const first = ROUNDS.findIndex(r => !done[r.id]);
  return { screen: 'round', done, cur: first < 0 ? 0 : first, ...freshRound, doneLevel: 1 };
}

// ---- selectors
export const isDone = (s: GameState, i: number) => !!s.done[ROUNDS[i].id];
export const nextIdx = (s: GameState) => { const i = ROUNDS.findIndex((_, k) => !isDone(s, k)); return i < 0 ? ROUNDS.length : i; };
export const levelEarned = (s: GameState, lvl: number) => ROUNDS.every((rd, i) => rd.lvl !== lvl || isDone(s, i));
export const roundsInLevel = (lvl: number) => ROUNDS.map((r, i) => (r.lvl === lvl ? i : -1)).filter(i => i >= 0);
export const roundNumber = (i: number) => roundsInLevel(ROUNDS[i].lvl).indexOf(i) + 1;
export const levelSize = (lvl: number) => roundsInLevel(lvl).length;
/** Messages greet the player as "there" (the website version doesn't ask for a name). */
export const subName = (t: string) => t.replace('{name}', 'there');

/** Practice round: the guided demo always targets the four FedEx flags in order. */
export const demoTarget = (s: GameState) => (s.cur === 0 ? [0, 1, 2, 3].find(c => !s.marked.includes(c)) : undefined);

export type BadgeView = {
  name: string; icon: (typeof BADGES)[number][1]; ring: string; ringStyle: 'solid' | 'dashed';
  fill: string; core: string; iconFg: string; earned: boolean;
};
export function badgeView(s: GameState, li: number): BadgeView {
  const e = levelEarned(s, li + 1), d = BADGES[li];
  // Levels are always open, so an unearned badge shows its own icon greyed out, not a padlock.
  return { name: d[0], icon: d[1], ring: e ? d[2] : '#cfd7e3', ringStyle: e ? 'solid' : 'dashed', fill: e ? d[3] : '#f4f7fd',
    core: e ? d[2] : '#e6ecf6', iconFg: e ? '#fff' : '#a3aebf', earned: e };
}

/** Keep the game card in view after an action, without jumping the page around. */
function revealCard() {
  const el = document.getElementById('ss-game');
  if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function useGame() {
  const [s, setS] = useState<GameState>(initialState);
  const set = (p: Partial<GameState> | ((st: GameState) => Partial<GameState>)) =>
    setS(st => ({ ...st, ...(typeof p === 'function' ? p(st) : p) }));
  const wrongTimer = useRef<number>();

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify({ done: s.done })); } catch { /* ignore */ }
  }, [s.done]);
  useEffect(() => () => window.clearTimeout(wrongTimer.current), []);

  const round = ROUNDS[s.cur];

  const start = (i: number) => { set({ screen: 'round', cur: Math.min(i, ROUNDS.length - 1), ...freshRound }); revealCard(); };
  const finish = (extra: Partial<GameState>) => {
    setS(st => { const n = { ...st, ...extra }; return { ...n, done: { ...n.done, [ROUNDS[n.cur].id]: true } }; });
    revealCard();
  };

  const actions = {
    start,
    /** Jump to a level: its first unfinished round, or round 1 if it's all done. */
    playLevel: (lvl: number) => { const idxs = roundsInLevel(lvl); start(idxs.find(i => !isDone(s, i)) ?? idxs[0]); },
    resetAll: () => {
      try { localStorage.removeItem(KEY); } catch { /* ignore */ }
      set({ done: {} });
      start(0);
    },

    /** One tap decides: real messages go straight to the reveal, scams go on to flagging. */
    choose: (v: Verdict) => {
      if (s.cur === 0 && v !== 'scam') return; // the practice round coaches the player to pick Scam
      if (round.answer !== 'scam') { finish({ verdict: v, revealed: true, quip: null }); return; }
      set({ verdict: v, phase: 'flags', quip: null, wrongVerdict: v === 'legit' });
    },
    tap: (c: Mark) => {
      if (s.revealed || s.phase !== 'flags') return;
      const clue = typeof c === 'string' ? undefined : round.clues[c];
      if (s.marked.includes(c)) { set(st => ({ marked: st.marked.filter(x => x !== c), quip: null })); return; }
      const demo = s.cur === 0;
      if (clue && isBad(clue)) { set(st => ({ marked: [...st.marked, c], wrong: null, quip: demo ? null : (clue.quip || clue.why) })); return; }
      const q = demo ? "That part isn't a red flag. Try the highlighted part."
        : ((clue && (clue.quip || clue.why)) || "That part looks ordinary. It isn't a red flag.");
      window.clearTimeout(wrongTimer.current);
      set({ wrong: c, quip: q });
      wrongTimer.current = window.setTimeout(() => set({ wrong: null }), 700);
    },
    useHint: () => {
      // Point at a red flag in the body first; the sender line in the header is hinted last.
      const headCs = (round.sections.find(x => x.s === 'head')?.p ?? []).flatMap(p => (typeof p === 'string' ? [] : [p.c]));
      const remaining = round.clues.map((_, i) => i)
        .filter(i => isBad(round.clues[i]) && !s.marked.includes(i) && !s.hinted.includes(i))
        .sort((a, b) => Number(headCs.includes(a)) - Number(headCs.includes(b)));
      const t = remaining[0];
      if (t == null) { set({ quip: "You've found them all! Now see your results." }); return; }
      set({ hinted: [...s.hinted, t], quip: 'Hint: take a closer look at the glowing part. What is it really asking?' });
    },
    reveal: () => { if (!s.verdict || !s.marked.length) return; finish({ revealed: true, quip: null }); },
    skipFlags: () => finish({ revealed: true, quip: null }),

    next: () => {
      const ni = s.cur + 1;
      if (ni < ROUNDS.length && ROUNDS[ni].lvl === round.lvl) start(ni);
      else { set({ screen: 'complete', doneLevel: round.lvl }); revealCard(); }
    },
  };

  return { s, round, actions };
}

export type Game = ReturnType<typeof useGame>;
