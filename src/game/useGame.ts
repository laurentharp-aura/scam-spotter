import { useEffect, useRef, useState } from 'react';
import { BADGES, ROUNDS, isBad } from '../data/content';
import { settings } from './settings';

export type Screen = 'welcome' | 'why' | 'name' | 'how' | 'home' | 'map' | 'round' | 'complete' | 'guide' | 'help';
export type Phase = 'verdict' | 'flags';
export type Verdict = 'scam' | 'legit';
/** A clue index, or a string key for an ordinary (neutral) phrase. */
export type Mark = number | string;

export type GameState = {
  screen: Screen; prev: Screen;
  name: string; nameDraft: string; onboarded: boolean;
  /** Finished rounds, keyed by round id. */
  done: Record<string, true>;
  cur: number; phase: Phase; revealed: boolean;
  verdict: Verdict | null; wrongVerdict: boolean; marked: Mark[]; wrong: Mark | null; quip: string | null; hinted: number[];
  doneLevel: number; openB: number | null;
};

// v2: progress keyed by round id (v1 used array positions, which shift when rounds are added).
const KEY = 'scamSpotter.progress.v2';

const freshRound = {
  marked: [], verdict: null, revealed: false, quip: null, hinted: [], phase: 'verdict', wrongVerdict: false, wrong: null,
} satisfies Partial<GameState>;

function initialState(): GameState {
  let saved: Partial<GameState> = {};
  try {
    if (settings.freshStart) {
      localStorage.removeItem(KEY);
      // Drop ?new=1 so a later refresh keeps the new player's progress.
      history.replaceState(null, '', window.location.pathname + window.location.hash);
    }
    saved = JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch { /* private mode etc. */ }
  const onboarded = !!saved.onboarded;
  return {
    screen: onboarded ? 'home' : 'welcome', prev: 'home',
    name: saved.name || '', nameDraft: saved.name || '', onboarded, done: saved.done || {},
    cur: 0, ...freshRound, doneLevel: 1, openB: null,
  };
}

// ---- selectors
export const isDone = (s: GameState, i: number) => !!s.done[ROUNDS[i].id];
export const nextIdx = (s: GameState) => { const i = ROUNDS.findIndex((_, k) => !isDone(s, k)); return i < 0 ? ROUNDS.length : i; };
export const levelEarned = (s: GameState, lvl: number) => ROUNDS.every((rd, i) => rd.lvl !== lvl || isDone(s, i));
export const roundsInLevel = (lvl: number) => ROUNDS.map((r, i) => (r.lvl === lvl ? i : -1)).filter(i => i >= 0);
export const roundNumber = (i: number) => roundsInLevel(ROUNDS[i].lvl).indexOf(i) + 1;
export const levelSize = (lvl: number) => roundsInLevel(lvl).length;
export const subName = (s: GameState, t: string) => t.replace('{name}', s.name || 'there');

/** Practice round: the guided demo always targets the four FedEx flags in order. */
export const demoTarget = (s: GameState) => (s.cur === 0 ? [0, 1, 2, 3].find(c => !s.marked.includes(c)) : undefined);

export type BadgeView = {
  name: string; icon: (typeof BADGES)[number][1]; ring: string; ringStyle: 'solid' | 'dashed';
  fill: string; core: string; iconFg: string; op: number; earned: boolean;
};
export function badgeView(s: GameState, li: number): BadgeView {
  const e = levelEarned(s, li + 1), d = BADGES[li];
  // Levels are always open, so an unearned badge shows its own icon greyed out, not a padlock.
  return { name: d[0], icon: d[1], ring: e ? d[2] : '#cfd7e3', ringStyle: e ? 'solid' : 'dashed', fill: e ? d[3] : '#EEF3FC',
    core: e ? d[2] : '#edf1f7', iconFg: e ? '#fff' : '#a3aebf', op: e ? 1 : 0.85, earned: e };
}

export function useGame() {
  const [s, setS] = useState<GameState>(initialState);
  const set = (p: Partial<GameState> | ((st: GameState) => Partial<GameState>)) =>
    setS(st => ({ ...st, ...(typeof p === 'function' ? p(st) : p) }));
  const wrongTimer = useRef<number>();

  useEffect(() => {
    const { name, done, onboarded } = s;
    try { localStorage.setItem(KEY, JSON.stringify({ name, done, onboarded })); } catch { /* ignore */ }
  }, [s.name, s.done, s.onboarded]);
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
    setS(st => { const n = { ...st, ...extra }; return { ...n, done: { ...n.done, [ROUNDS[n.cur].id]: true } }; });
    top();
  };

  const actions = {
    go, start,
    playNext: () => (nextIdx(s) >= ROUNDS.length ? go('map') : start(nextIdx(s))),
    /** Jump to a level: its first unfinished round, or round 1 if it's all done. */
    playLevel: (lvl: number) => { const idxs = roundsInLevel(lvl); start(idxs.find(i => !isDone(s, i)) ?? idxs[0]); },
    setNameDraft: (v: string) => set({ nameDraft: v }),
    saveName: () => { set({ name: s.nameDraft.trim() }); go('how'); },
    finishOnboarding: () => { set({ onboarded: true }); start(0); },
    openBadge: (li: number) => { set({ openB: li, screen: 'guide' }); top(); },
    resetAll: () => {
      try { localStorage.removeItem(KEY); } catch { /* ignore */ }
      set({ screen: 'welcome', name: '', nameDraft: '', done: {}, onboarded: false });
      top();
    },

    /** One tap decides: real messages go straight to the reveal, scams go on to flagging. */
    choose: (v: Verdict) => {
      if (s.cur === 0 && v !== 'scam') return; // the practice round coaches the player to pick Scam
      if (round.answer !== 'scam') { finish({ verdict: v, revealed: true, quip: null }); return; }
      set({ verdict: v, phase: 'flags', quip: null, wrongVerdict: v === 'legit' });
      top();
    },
    tap: (c: Mark) => {
      if (s.revealed || s.phase !== 'flags') return;
      const clue = typeof c === 'string' ? undefined : round.clues[c];
      if (s.marked.includes(c)) { set(st => ({ marked: st.marked.filter(x => x !== c), quip: null })); return; }
      const demo = s.cur === 0;
      // A correct tap adds the flag to the red-flags card, so no separate message is needed.
      if (clue && isBad(clue)) { set(st => ({ marked: [...st.marked, c], wrong: null, quip: null })); return; }
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
      else { set({ screen: 'complete', doneLevel: round.lvl }); top(); }
    },
  };

  return { s, round, actions };
}

export type Game = ReturnType<typeof useGame>;
