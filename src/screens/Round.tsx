import type { CSSProperties, ReactNode } from 'react';
import { BADGES, KINDS, LEVELS, ROUNDS, isBad, type Round, type Part, type SectionKind } from '../data/content';
import { Icon, type IconName } from '../ds/Icon';
import { settings } from '../game/settings';
import { demoTarget, isDone, levelSize, roundNumber, roundsInLevel, subName, type Game, type GameState, type Mark } from '../game/useGame';
import { C, Card, DISPLAY, Glow, PASTEL, Pill, PrimaryButton, SHADOW, TextButton, col, kicker } from '../ui';

export function RoundScreen({ game }: { game: Game }) {
  const { s, round } = game;
  const inIntro = !s.revealed && s.phase === 'intro';
  const body: ReactNode = inIntro ? <div className="ss-narrow"><RoundIntro game={game} /></div> : <MessageRoundView game={game} round={round} />;
  return (
    <div data-screen-label={`Round L${round.lvl}-${roundNumber(s.cur)}`} style={{ paddingBottom: 48 }}>{body}</div>
  );
}

const noun = (r: Round) => (r.kind === 'voicemail' ? 'voicemail' : 'message');
const roundLine = (s: GameState) => `LEVEL ${ROUNDS[s.cur].lvl} · ROUND ${roundNumber(s.cur)} OF ${levelSize(ROUNDS[s.cur].lvl)}`;

// ---------------------------------------------------------------- intro

function RoundIntro({ game: { s, round, actions } }: { game: Game }) {
  const demo = s.cur === 0, kind = KINDS[round.kind];
  const steps = ['Decide', 'Flag', 'Learn'];
  const title = demo ? "Let's practice one together." : 'Real or scam?';
  const body = demo ? "First you'll decide if it's real or a scam. Then we'll show you how to point out the red flags."
    : `Read the ${noun(round)} and make your call. If you think it's a scam, you'll point out what gave it away.`;
  const cta = demo ? 'Show me' : `Open the ${noun(round)}`;
  const fg = C.text, sub = C.sub, label = C.faint;
  return (
    <div data-screen-label="Round intro" className="ss-fill" style={col(28, { paddingTop: 4 })}>
      <div style={{ display: 'flex', gap: 6 }}>
        {steps.map((l, k) => (
          <div key={l} style={col(6, { flex: 1 })}>
            <div style={{ height: 6, borderRadius: 999, background: k === 0 ? 'linear-gradient(90deg,#2A5FFC,#7E2CE2)' : C.surface2 }} />
            <span style={{ fontSize: 14, color: k === 0 ? fg : C.faint, fontWeight: 500 }}>{l}</span>
          </div>
        ))}
      </div>
      <div style={col(24, { flex: 1, justifyContent: 'center', animation: 'ss-rise .3s ease-out both' })}>
        <div style={col(14, { alignItems: 'center', textAlign: 'center' })}>
          <div style={{ width: 88, height: 88, borderRadius: '50%', background: '#fff', color: C.ink, boxShadow: '0 0 0 10px rgba(42,95,252,0.18), 0 0 60px rgba(42,95,252,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={kind[1]} size={40} /></div>
          <span style={{ fontSize: 15, fontWeight: 500, letterSpacing: '0.06em', color: label }}>{demo ? 'PRACTICE ROUND' : roundLine(s)}</span>
          <span style={{ ...DISPLAY, fontSize: 46, lineHeight: 1.04, textWrap: 'balance', color: fg }}>{title}</span>
          <span style={{ fontSize: 20, lineHeight: 1.45, color: sub, textWrap: 'pretty', maxWidth: 440 }}>{body}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: C.surface, border: `1px solid ${C.hair}`, borderRadius: 22, padding: '16px 20px' }}>
          <div style={col(2, { flex: 1 })}>
            <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.06em', color: C.faint }}>UP NEXT · {kind[0].toUpperCase()}</span>
            <span style={{ fontSize: 18, lineHeight: 1.35 }}>{round.teaser}</span>
          </div>
        </div>
      </div>
      <PrimaryButton onClick={actions.beginRound}>{cta}</PrimaryButton>
    </div>
  );
}

// ---------------------------------------------------------------- message rounds

type Piece =
  | { plain: true; t: string }
  | { plain: false; t: string; c: Mark; link: boolean };

/** Splits a section's parts into plain text and tappable pieces. Ordinary phrases become neutral tap targets. */
function pieces(parts: Part[], keyPrefix: string, canTap: boolean, s: GameState): Piece[] {
  return parts.flatMap((p, k): Piece[] => {
    if (typeof p !== 'string') return [{ plain: false, t: subName(s, p.t), c: p.c, link: !!p.link }];
    if (!canTap || !/\w{2,}/.test(p)) return [{ plain: true, t: subName(s, p) }];
    // Keep surrounding whitespace untappable so highlights hug the words.
    const [, lead, mid, trail] = p.match(/^(\s*)([\s\S]*?)(\s*)$/)!;
    return [
      ...(lead ? [{ plain: true as const, t: lead }] : []),
      { plain: false, t: subName(s, mid), c: keyPrefix + k, link: false },
      ...(trail ? [{ plain: true as const, t: trail }] : []),
    ];
  });
}

function Pieces({ list, game, round, im, head }: { list: Piece[]; game: Game; round: Round; im: boolean; head?: boolean }) {
  const { s, actions } = game;
  const rev = s.revealed, active = !rev && s.phase === 'flags';
  // The practice round glows one target at a time, and only once the player is flagging.
  const dt = active ? demoTarget(s) : undefined, underline = active && s.cur !== 0;
  return (
    <>
      {list.map((p, i) => {
        if (p.plain) return <span key={i}>{p.t}</span>;
        const m = s.marked.includes(p.c);
        const bad = typeof p.c === 'number' && isBad(round.clues[p.c]);
        const missed = rev && bad && !m;
        const hinted = !rev && !m && typeof p.c === 'number' && (s.hinted.includes(p.c) || p.c === dt);
        const wrong = !rev && s.wrong === p.c;
        const style: CSSProperties = {
          padding: '5px 0', margin: 0, borderRadius: 6, outlineOffset: 2, transition: 'background-color .6s ease',
          cursor: active ? 'pointer' : 'default',
          background: wrong ? '#dde5ef' : m ? '#ffd89e' : missed ? '#ffe9c9' : hinted ? '#fff5e5' : 'transparent',
          outline: hinted ? '3px solid #FFA722' : (settings.outlineTappables && !rev && !m) ? '2px dashed #6699ff' : missed ? '2px dashed #cf8415' : 'none',
          boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone',
          color: head ? undefined : p.link ? (im ? '#007aff' : C.blue) : 'inherit',
          textDecoration: p.link ? 'underline' : underline ? 'underline dotted #a3aebf' : 'none', textUnderlineOffset: 5,
        };
        return (
          <span key={i} role="button" tabIndex={active ? 0 : -1} className={active && !m ? 'ss-tap' : undefined} onClick={() => actions.tap(p.c)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); actions.tap(p.c); } }} style={style}>
            {p.t}
            {m && (
              <span style={{ display: 'inline-flex', marginLeft: head ? 6 : 4, width: 22, height: 22, borderRadius: '50%', background: C.ink, color: '#fff', fontSize: 13, fontWeight: 500, alignItems: 'center', justifyContent: 'center', verticalAlign: head ? 2 : 3, animation: 'ss-pop .3s ease-out' }}>
                {s.marked.indexOf(p.c) + 1}
              </span>
            )}
          </span>
        );
      })}
    </>
  );
}

const secOf = (round: Round, k: SectionKind) => round.sections.find(x => x.s === k)?.p ?? [];

/** iOS Messages look for text rounds. */
function TextMessage({ game, round }: { game: Game; round: Round }) {
  const { s } = game;
  const head = secOf(round, 'head'), first = head[0];
  const unknown = /^\+/.test(typeof first === 'string' ? first : first?.t ?? '');
  const ios: CSSProperties = { fontFamily: "-apple-system,'SF Pro Text',system-ui,var(--font-sans)" };
  return (
    <div className="ss-mock" style={{ background: '#fff', borderRadius: 28, boxShadow: SHADOW, overflow: 'hidden', margin: '0 auto', ...ios }}>
      <div style={{ background: '#f6f6f6', borderBottom: '1px solid #d1d1d6', padding: '12px 16px 10px', display: 'grid', gridTemplateColumns: '40px 1fr 40px', alignItems: 'center' }}>
        <span style={{ color: '#007aff', display: 'flex' }}><Icon name="ChevronLeft" size={26} /></span>
        <div style={col(4, { alignItems: 'center' })}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(180deg,#a5a9b1,#868a92)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="User" size={28} /></div>
          <span style={{ fontSize: 15, color: '#000', lineHeight: 1.9 }}>
            <Pieces list={pieces(head, 'h', true, s)} game={game} round={round} im head /> ›
          </span>
        </div>
        <span />
      </div>
      <div style={col(6, { padding: '14px 14px 18px', background: '#fff' })}>
        <span style={{ fontSize: 13, color: '#8e8e93', textAlign: 'center', lineHeight: 1.35 }}>Text Message<br />{String(secOf(round, 'meta')[0] ?? 'Today')}</span>
        <div style={{ alignSelf: 'flex-start', maxWidth: '86%', background: '#e9e9eb', color: '#000', borderRadius: '20px 20px 20px 6px', padding: '8px 14px', fontSize: 18, lineHeight: 1.95, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', marginTop: 6 }}>
          <Pieces list={pieces(secOf(round, 'body'), 'b', true, s)} game={game} round={round} im />
        </div>
        {unknown && (
          <span style={{ fontSize: 13, color: '#8e8e93', textAlign: 'center', lineHeight: 1.4, paddingTop: 10 }}>
            The sender is not in your contact list.<br /><span style={{ color: '#007aff' }}>Report Junk</span>
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px 12px', background: '#fff' }}>
        <span style={{ width: 32, height: 32, borderRadius: '50%', background: '#e9e9eb', color: '#8e8e93', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="Plus" size={18} /></span>
        <span style={{ flex: 1, height: 36, borderRadius: 18, border: '1px solid #d1d1d6', display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 16, color: '#c7c7cc' }}>Text Message</span>
      </div>
    </div>
  );
}

/** iOS Voicemail look: caller, a (static) player and the transcript. */
function VoicemailCard({ game, round }: { game: Game; round: Round }) {
  const { s } = game;
  const [when, length = '0:30'] = String(secOf(round, 'meta')[0] ?? 'Today').split(' · ');
  const ios: CSSProperties = { fontFamily: "-apple-system,'SF Pro Text',system-ui,var(--font-sans)" };
  const blue = '#007aff', grey = '#8e8e93';
  return (
    <div className="ss-mock" style={{ background: '#fff', borderRadius: 28, boxShadow: SHADOW, overflow: 'hidden', margin: '0 auto', ...ios }}>
      <div style={col(2, { padding: '18px 20px 12px' })}>
        <span style={{ fontSize: 13, fontWeight: 600, color: grey, letterSpacing: '0.04em' }}>VOICEMAIL</span>
        <span style={{ fontSize: 22, fontWeight: 700, color: '#000', lineHeight: 1.6 }}>
          <Pieces list={pieces(secOf(round, 'head'), 'h', true, s)} game={game} round={round} im head />
        </span>
        <span style={{ fontSize: 15, color: grey }}>{when}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 20px 16px' }}>
        <span style={{ width: 40, height: 40, borderRadius: '50%', background: '#e9e9eb', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="Play" size={20} /></span>
        <div style={col(4, { flex: 1 })}>
          <div style={{ position: 'relative', height: 4, borderRadius: 2, background: '#e5e5ea' }}>
            <span style={{ position: 'absolute', left: -2, top: -4, width: 12, height: 12, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: grey }}><span>0:00</span><span>-{length}</span></div>
        </div>
      </div>
      <div style={col(6, { borderTop: '1px solid #e5e5ea', padding: '14px 20px 18px' })}>
        <span style={{ fontSize: 13, fontWeight: 600, color: grey }}>Transcription</span>
        <div style={{ fontSize: 18, lineHeight: 1.9, color: '#000', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
          <Pieces list={pieces(secOf(round, 'body'), 'b', true, s)} game={game} round={round} im />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid #e5e5ea', padding: '12px 20px', fontSize: 16, color: blue }}>
        <span>Speaker</span><span>Call Back</span><span style={{ color: '#ff3b30' }}>Delete</span>
      </div>
    </div>
  );
}

/** [padding, font size, weight, line height, colour, bottom border] per section type. */
const SEC: Record<SectionKind, [string, number, number, number, string, string]> = {
  head: ['12px 16px 2px', 18, 700, 1.9, C.ink, 'none'], meta: ['0 16px 12px', 14, 400, 1.9, C.muted, `2px solid ${C.line}`],
  subject: ['14px 16px 0', 20, 700, 1.9, C.ink, 'none'], body: ['14px 16px 18px', 19, 400, 1.85, C.ink, 'none'], foot: ['0 16px 16px', 15, 400, 1.9, C.muted, 'none'],
};

/** Email, DM, social post and listing rounds. */
function MessageCard({ game, round }: { game: Game; round: Round }) {
  const kind = KINDS[round.kind];
  return (
    <div style={{ overflow: 'hidden', background: '#fff', color: C.ink, borderRadius: 24, boxShadow: SHADOW }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: kind[2], borderBottom: `1px solid ${C.line}`, fontSize: 14, fontWeight: 500, letterSpacing: '0.04em' }}>
        <Icon name={kind[1]} size={16} />{kind[0]}
      </div>
      {round.sections.map((sec, si) => {
        const [pad, fs, fw, lh, color, bd] = SEC[sec.s];
        return (
          <div key={si} style={{ padding: pad, fontSize: fs, fontWeight: fw, lineHeight: lh, color, borderBottom: bd, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
            <Pieces list={pieces(sec.p, `s${si}_`, sec.s !== 'meta', game.s)} game={game} round={round} im={false} />
          </div>
        );
      })}
    </div>
  );
}

/** Practice-round coaching per FedEx flag: [what to tap, why it matters]. */
const DEMO_COACH: [string, string][] = [
  ['Tap the glowing phone number.', 'Real FedEx texts come from short codes, not random 10-digit numbers.'],
  ['Tap the glowing fee.', 'A tiny fee is bait to get your card number.'],
  ['Tap the glowing deadline.', 'Rushing you is a classic trick.'],
  ['Tap the glowing link.', 'FedEx lives at fedex.com, not fdx-ship.co.'],
];

const stepLabel = (n: 1 | 2) => <span style={kicker()}>STEP {n} OF 2</span>;
const title = (t: string) => <span style={{ ...DISPLAY, fontSize: 'clamp(34px, 3.2vw, 54px)', lineHeight: 1.04, textWrap: 'balance' }}>{t}</span>;
const subline = (t: string) => <span style={{ fontSize: 18, color: C.sub, lineHeight: 1.45 }}>{t}</span>;

/**
 * Message rounds use three areas: `head` (step title), `msg` (the message) and `ctrl` (choices / results).
 * Phones stack them head → msg → ctrl; desktop puts the message on the left and head + ctrl in a side panel.
 */
function MessageRoundView({ game, round }: { game: Game; round: Round }) {
  const { s } = game;
  const inFlags = !s.revealed && s.phase === 'flags';
  const head = s.revealed ? <RevealHead game={game} /> : inFlags ? <FlagsHead game={game} round={round} /> : <VerdictHead game={game} />;
  const ctrl = s.revealed ? <RevealBody game={game} /> : inFlags ? <FlagsControls game={game} round={round} /> : <VerdictControls game={game} />;
  const nums = roundsInLevel(round.lvl);
  return (
    <div className="ss-round">
      <div style={col(18, { gridArea: 'head' })}>
        <div style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: 10, padding: '6px 14px 6px 6px', borderRadius: 999, background: C.surface, border: `1px solid ${C.hair}` }}>
          <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#fff', color: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={KINDS[round.kind][1]} size={15} /></span>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{s.cur === 0 ? 'Practice round' : `Level ${round.lvl} · ${LEVELS[round.lvl - 1][0]}`}</span>
          <span style={{ display: 'flex', gap: 4 }}>
            {nums.map(i => <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: i === s.cur ? '#fff' : isDone(s, i) ? C.teal : C.locked }} />)}
          </span>
        </div>
        {head}
      </div>
      <div className="ss-round-msg" style={{ gridArea: 'msg' }}>
        <div className="ss-stage">
          <Glow />
          <div className="ss-stage-inner">
            {round.kind === 'text' ? <TextMessage game={game} round={round} /> : round.kind === 'voicemail' ? <VoicemailCard game={game} round={round} /> : <MessageCard game={game} round={round} />}
          </div>
        </div>
      </div>
      <div style={{ gridArea: 'ctrl' }}>{ctrl}</div>
    </div>
  );
}

function FlagsHead({ game: { s }, round }: { game: Game; round: Round }) {
  const demo = s.cur === 0, counted = round.lvl === 1 || s.wrongVerdict;
  const badCount = round.clues.filter(isBad).length;
  const dt = demoTarget(s);
  const [what, why] = demo
    ? (dt != null ? DEMO_COACH[dt] : [`You found all ${badCount}.`, 'Tap See results to learn what each one means.'])
    : [counted ? `Tap the ${badCount} red flags.` : 'Tap what gave it away.',
       s.wrongVerdict ? 'Learning them now makes the next one easier.' : `Tap any words in the ${noun(round)} that look off.`];
  return (
    <div style={col(8)}>
      {s.wrongVerdict && (
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: 'rgba(255,167,34,0.12)', border: '1px solid rgba(255,167,34,0.35)', borderRadius: 20, padding: 16, marginBottom: 6, animation: 'ss-rise .3s ease-out both' }}>
          <span style={{ width: 36, height: 36, borderRadius: '50%', background: C.orange, color: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="Info" size={20} /></span>
          <div style={col(4)}>
            <span style={{ fontSize: 19, fontWeight: 600 }}>Ah, this one was tricky. It's a scam.</span>
            <span style={{ fontSize: 16, lineHeight: 1.45, color: C.sub }}>Lots of people miss it. Let's find what gives it away.</span>
          </div>
        </div>
      )}
      {stepLabel(2)}
      {title(what)}
      {subline(why)}
    </div>
  );
}

function FlagsControls({ game: { s, actions }, round }: { game: Game; round: Round }) {
  const demo = s.cur === 0, counted = round.lvl === 1 || s.wrongVerdict;
  const badCount = round.clues.filter(isBad).length;
  const foundBad = s.marked.filter(c => typeof c === 'number' && isBad(round.clues[c])).length;
  // Only show the continue button once it can be used.
  const canContinue = demo ? foundBad === badCount : s.marked.length > 0;
  return (
    <div style={col(14)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 44, flexWrap: 'wrap' }}>
        {counted && Array.from({ length: badCount }, (_, i) => {
          const on = foundBad > i;
          return <span key={i} style={{ width: 30, height: 30, borderRadius: '50%', border: on ? 'none' : `1.5px solid ${C.locked}`, background: on ? C.orange : C.surface, color: on ? C.ink : C.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500, fontSize: 14 }}>{on ? i + 1 : ''}</span>;
        })}
        <span style={{ fontSize: 17, fontWeight: 600, marginLeft: 4, flex: 1 }}>
          {counted ? `${foundBad} of ${badCount} found` : `${s.marked.length} marked`}
        </span>
        {!demo && <button className="ss-outline" onClick={actions.useHint} style={{ minHeight: 44, padding: '0 18px', borderRadius: 999, border: '1.5px solid rgba(255,255,255,0.55)', background: 'none', fontSize: 16, fontWeight: 600, color: C.text, cursor: 'pointer' }}>Hint</button>}
      </div>
      {s.quip && <div style={{ background: C.surface2, border: `1px solid ${C.hair}`, color: '#fff', borderRadius: 18, padding: '14px 16px', fontSize: 18, lineHeight: 1.45, animation: 'ss-rise .25s ease-out' }}>{s.quip}</div>}
      {canContinue && <PrimaryButton size={19} shadow={false} onClick={actions.reveal} style={{ animation: 'ss-rise .25s ease-out' }}>See results</PrimaryButton>}
      {!demo && <TextButton onClick={actions.skipFlags}>Skip — show me the answer</TextButton>}
    </div>
  );
}

function VerdictHead({ game: { s, round } }: { game: Game }) {
  return (
    <div style={col(8)}>
      {stepLabel(1)}
      {title('Is this real or a scam?')}
      {subline(s.cur === 0 ? "This one is a scam. Tap Scam and we'll show you why." : `Read the ${noun(round)}, then choose.`)}
    </div>
  );
}

function VerdictControls({ game: { s, actions } }: { game: Game }) {
  const demo = s.cur === 0;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {(['legit', 'scam'] as const).map(id => {
        const guided = demo && id === 'scam', off = demo && id !== 'scam';
        return (
          <button key={id} className="ss-choice" onClick={() => actions.choose(id)} disabled={off} style={{
            ...DISPLAY, minHeight: 'clamp(76px, 6vw, 96px)', borderRadius: 999, border: '2px solid transparent', background: '#fff', boxShadow: 'none',
            outline: guided ? '3px solid #FFA722' : 'none', outlineOffset: 3, opacity: off ? 0.45 : 1,
            fontSize: 24, cursor: off ? 'default' : 'pointer', color: C.ink, transition: 'transform .15s, box-shadow .15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          }}>
            <span style={{ width: 32, height: 32, borderRadius: '50%', background: id === 'legit' ? C.teal : C.orange, color: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={id === 'legit' ? 'Checkmark' : 'Exclamation'} size={18} />
            </span>
            {id === 'legit' ? 'Real' : 'Scam'}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------- reveal

type Row = { label: string; why: string; dot: string; icon: IconName };
type Outcome = { good: boolean; stamp: string; title: string; rowsTitle: string; rows: Row[] };

function outcome(s: GameState): Outcome {
  const round = ROUNDS[s.cur];
  const scam = round.answer === 'scam', right = s.verdict === round.answer;
  const title = scam ? (right ? 'Correct. This is a scam.' : "This one was tricky — it's a scam.") : (right ? `Correct. This ${noun(round)} is real.` : 'This one is actually real.');
  if (!scam) {
    return { good: true, stamp: 'REAL', title, rowsTitle: "HOW YOU CAN TELL IT'S REAL", rows: round.clues.map(c => ({ label: c.label, why: c.why, dot: 'rgba(37,218,167,0.22)', icon: 'Checkmark' })) };
  }
  const bads = round.clues.map((c, i) => ({ ...c, i })).filter(isBad);
  return {
    good: false, stamp: 'SCAM', title, rowsTitle: `RED FLAGS · YOU FOUND ${bads.filter(c => s.marked.includes(c.i)).length} OF ${bads.length}`,
    rows: bads.map(c => { const m = s.marked.includes(c.i); return { label: c.label, why: m ? c.why : 'Missed — ' + c.why, dot: m ? 'rgba(37,218,167,0.22)' : 'rgba(255,167,34,0.22)', icon: m ? 'Checkmark' : 'Search3' }; }),
  };
}

function RevealHead({ game: { s } }: { game: Game }) {
  const o = outcome(s);
  return (
    <div data-screen-label="Round reveal" style={col(10, { alignItems: 'flex-start', paddingTop: 4 })}>
      <Pill good={o.good} style={{ letterSpacing: '0.04em', animation: 'ss-rise .3s ease-out both' }}>{o.stamp}</Pill>
      <span style={{ ...DISPLAY, fontSize: 'clamp(32px, 3vw, 48px)', lineHeight: 1.06, textWrap: 'pretty' }}>{o.title}</span>
    </div>
  );
}

function RevealBody({ game: { s, round, actions } }: { game: Game }) {
  const o = outcome(s);
  const size = levelSize(round.lvl);
  const lvlLeft = ROUNDS.filter((rd, i) => rd.lvl === round.lvl && !isDone(s, i)).length;
  const bName = BADGES[round.lvl - 1][0];
  const lastInLevel = !(s.cur + 1 < ROUNDS.length && ROUNDS[s.cur + 1].lvl === round.lvl);
  const progress = lvlLeft ? `${lvlLeft} more to earn ${bName.startsWith('The ') ? '' : 'the '}${bName} badge` : `${bName} badge unlocked`;
  return (
    <div style={col(16)}>
      <Card style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <span style={{ padding: '14px 16px 4px', fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', color: C.faint }}>{o.rowsTitle}</span>
        {o.rows.map(te => (
          <div key={te.label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 16px' }}>
            <span style={{ width: 24, height: 24, marginTop: 1, borderRadius: '50%', background: te.dot, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={te.icon} size={14} /></span>
            <div style={col(1)}>
              <span style={{ fontSize: 17, fontWeight: 600 }}>{te.label}</span>
              <span style={{ fontSize: 15, color: C.sub, lineHeight: 1.4 }}>{te.why}</span>
            </div>
          </div>
        ))}
        <span style={{ height: 6 }} />
      </Card>
      <div style={col(8, { background: PASTEL, color: C.ink, borderRadius: 24, padding: '20px 22px' })}>
        <span style={kicker(13, C.body)}>WHAT TO DO</span>
        <span style={{ ...DISPLAY, letterSpacing: '-0.02em', fontSize: 21, lineHeight: 1.3, color: C.ink }}>{round.lesson}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 4 }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {roundsInLevel(round.lvl).map(i => <span key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: isDone(s, i) ? C.teal : C.surface2 }} />)}
        </div>
        <span style={{ fontSize: 15, color: C.sub }}>Round {roundNumber(s.cur)} of {size} · {progress}</span>
      </div>
      <PrimaryButton shadow={false} onClick={actions.next}>{lastInLevel ? 'Finish level' : 'Next round'}</PrimaryButton>
    </div>
  );
}
