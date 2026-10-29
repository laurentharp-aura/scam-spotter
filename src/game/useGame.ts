import { useEffect, useRef, useState } from 'react';
import { BADGES, ROUNDS, isBad, type Round } from '../data/content';
import { settings } from './settings';

export type Screen = 'welcome' | 'name' | 'how' | 'home' | 'map' | 'round' | 'complete' | 'guide' | 'help';
export type Phase = 'intro' | 'verdict' | 'flags';
export type Verdict = 'scam' | 'legit';
/** A clue index, or a string key for an ordinary (neutral) phrase. */
export type Mark = number | string;

export type GameState = {
  screen: Screen; prev: Screen;
  name: string; nameDraft: string; /** Finished rounds, keyed by round id. */
  done: Record<string, true>; points: number; onboarded: boolean;
  cur: number; phase: Phase; revealed: boolean;
  verdict: Verdict | null; wrongVerdict: boolean; marked: Mark[]; wrong: Mark | null; quip: string | null; hinted: number[];
  hintsUsed: number; lastPts: number;
  doneLevel: number; openB: number | null;
};

// v2: progress keyed by round id (v1 used array positions, which shift when rounds are added).
const KEY = 'scamSpotter.progress.v2';

const freshRound = {
  marked: [], verdict: null, revealed: false, quip: null,
  hinted: [], hintsUsed: 0, phase: 'intro', wrongVerdict: false, wrong: null,
} satisfies Partial<GameState>;

function initialState(): GameState {
  let saved: Partial<GameState> = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { /* private mode etc. */ }
  const onboarded = !!saved.onboarded;
  return {
    screen: onboarded ? 'home' : 'welcome', prev: 'home',
    name: saved.name || '', nameDraft: saved.name || '', done: saved.done || {}, points: saved.points || 0, onboarded,
    cur: 0, ...freshRound, lastPts: 0, doneLevel: 1, openB: null,
  };
}

// ---- selectors
export const isDone = (s: GameState, i: number) => !!s.done[ROUNDS[i].id];
export const nextIdx = (s: GameState) => { const i = ROUNDS.findIndex((_, k) => !isDone(s, k)); return i < 0 ? ROUNDS.length : i; };
export const playable = (s: GameState, i: number) => settings.unlockAll || i <= nextIdx(s) || isDone(s, i);
export const levelEarned = (s: GameState, lvl: number) => ROUNDS.every((rd, i) => rd.lvl !== lvl || isDone(s, i));
export const roundsInLevel = (lvl: number) => ROUNDS.map((r, i) => (r.lvl === lvl ? i : -1)).filter(i => i >= 0);
export const roundNumber = (i: number) => roundsInLevel(ROUNDS[i].lvl).indexOf(i) + 1;
export const levelSize = (lvl: number) => roundsInLevel(lvl).length;
export const subName = (s: GameState, t: string) => t.replace('{name}', s.name || 'there');

/** Practice round: the guided demo always targets the four FedEx flags in order. */
export const demoTarget = (s: GameState) => (s.cur === 0 ? [0, 1, 2, 3].find(c => !s.marked.includes(c)) : undefined);

export type BadgeView = {
  name: string; icon: (typeof BADGES)[number][1] | 'Lock'; ring: string; ringStyle: 'solid' | 'dashed';
  fill: string; core: string; iconFg: string; op: number; earned: boolean;
};
export function badgeView(s: GameState, li: number): BadgeView {
  const e = levelEarned(s, li + 1), d = BADGES[li];
  return { name: d[0], icon: e ? d[1] : 'Lock', ring: e ? d[2] : '#45454b', ringStyle: e ? 'solid' : 'dashed', fill: e ? d[3] : '#1d1d1f',
    core: e ? d[2] : '#2a2a2d', iconFg: e ? '#fff' : '#8a8a94', op: 1, earned: e };
}

function score(s: GameState, round: Round) {
  const pen = s.hintsUsed * 3;
  const found = s.marked.filter(c => typeof c === 'number' && isBad(round.clues[c])).length;
  const right = s.verdict === round.answer;
  return Math.max(5, (right ? 20 : 5) + found * 5 - pen);
}

export function useGame() {
  const [s, setS] = useState<GameState>(initialState);
  const set = (p: Partial<GameState> | ((st: GameState) => Partial<GameState>)) =>
    setS(st => ({ ...st, ...(typeof p === 'function' ? p(st) : p) }));
  const wrongTimer = useRef<number>();

  useEffect(() => {
    const { name, done, points, onboarded } = s;
    try { localStorage.setItem(KEY, JSON.stringify({ name, done, points, onboarded })); } catch { /* ignore */ }
  }, [s.name, s.done, s.points, s.onboarded]);
  useEffect(() => () => window.clearTimeout(wrongTimer.current), []);

  const top = () => window.scrollTo(0, 0);
  const round = ROUNDS[s.cur];

  const go = (screen: Screen) => {
    set(st => ({ screen, prev: st.screen === 'help' ? st.prev : st.screen, openB: screen === 'guide' ? st.openB : null }));
    top();
  };
  const start = (i: number) => {
    if (i >= ROUNDS.length) { go('map'); return; }
    set({ screen: 'round', cur: i, ...freshRound });
    top();
  };
  const finish = (extra: Partial<GameState>) => {
    setS(st => {
      const n = { ...st, ...extra };
      const id = ROUNDS[n.cur].id, pts = score(n, ROUNDS[n.cur]), first = !n.done[id];
      return { ...n, lastPts: pts, points: n.points + (first ? pts : 0), done: { ...n.done, [id]: true } };
    });
    top();
  };

  const actions = {
    go, start,
    playNext: () => (nextIdx(s) >= ROUNDS.length ? go('map') : start(nextIdx(s))),
    setNameDraft: (v: string) => set({ nameDraft: v }),
    saveName: () => { set({ name: s.nameDraft.trim() }); go('how'); },
    finishOnboarding: () => { set({ onboarded: true }); start(0); },
    openBadge: (li: number) => { set({ openB: li, screen: 'guide' }); top(); },
    resetAll: () => {
      try { localStorage.removeItem(KEY); } catch { /* ignore */ }
      set({ screen: 'welcome', name: '', nameDraft: '', done: {}, points: 0, onboarded: false });
      top();
    },

    beginRound: () => { set({ phase: 'verdict' }); top(); },
    /** One tap decides: real messages go straight to the reveal, scams go on to flagging. */
    choose: (v: Verdict) => {
      if (s.cur === 0 && v !== 'scam') return; // the practice round coaches the player to pick Scam
      if (round.answer !== 'scam') { finish({ verdict: v, revealed: true, quip: null }); return; }
      set({ verdict: v, phase: 'flags', quip: null, wrongVerdict: v === 'legit' });
      top();
    },
    tap: (c: Mark) => {
      if (s.revealed || s.phase !== 'flags') return;
      const r = round, neutral = typeof c === 'string';
      const clue = neutral ? undefined : r.clues[c];
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
      const r = round;
      // Point at a red flag in the body first; the sender line in the header is hinted last.
      const headCs = (r.sections.find(x => x.s === 'head')?.p ?? []).flatMap(p => (typeof p === 'string' ? [] : [p.c]));
      const remaining = r.clues.map((_, i) => i)
        .filter(i => isBad(r.clues[i]) && !s.marked.includes(i) && !s.hinted.includes(i))
        .sort((a, b) => Number(headCs.includes(a)) - Number(headCs.includes(b)));
      const t = remaining[0];
      if (t == null) {
        const anyBad = r.clues.some(isBad);
        set({ quip: anyBad ? "You've found them all! Now make your call." : "Hint: sometimes there's nothing to find. Does it ask you for anything?", hintsUsed: s.hintsUsed + 1 });
        return;
      }
      set({ hinted: [...s.hinted, t], hintsUsed: s.hintsUsed + 1, quip: 'Hint: take a closer look at the glowing part. What is it really asking?' });
    },
    reveal: () => { if (!s.verdict || !s.marked.length) return; finish({ revealed: true, quip: null }); },
    skipFlags: () => finish({ revealed: true, quip: null }),

    next: () => {
      const ni = s.cur + 1;
      if (ni < ROUNDS.length && ROUNDS[ni].lvl === round.lvl) start(ni);
      else { set({ screen: 'complete', doneLevel: round.lvl }); top(); }
    },
  };

  return { s, round, actions };
}

export type Game = ReturnType<typeof useGame>;
