import type { CSSProperties, ReactNode } from 'react';
import { BADGES, KINDS, ROUNDS, isBad, type CallRound, type MessageRound, type Part, type SectionKind } from '../data/content';
import { Icon, type IconName } from '../ds/Icon';
import { settings } from '../game/settings';
import { demoTarget, isDone, levelSize, roundNumber, subName, type Game, type GameState, type Mark } from '../game/useGame';
import { C, Card, Pill, PrimaryButton, SHADOW, TextButton, col, kicker } from '../ui';

export function RoundScreen({ game, dark }: { game: Game; dark: boolean }) {
  const { s, round } = game;
  const inIntro = !s.revealed && s.phase === 'intro';
  let body: ReactNode;
  if (inIntro) body = <div className="ss-narrow"><RoundIntro game={game} dark={dark} /></div>;
  else if (round.kind !== 'call') body = <MessageRoundView game={game} round={round} />;
  else if (!s.revealed) body = <div className="ss-narrow"><CallPlay game={game} round={round} /></div>;
  else body = <div className="ss-narrow" style={col(18)}><RevealHead game={game} /><RevealBody game={game} /></div>;
  return (
    <div data-screen-label={`Round L${round.lvl}-${roundNumber(s.cur)}`} style={{ paddingBottom: 48 }}>{body}</div>
  );
}

const roundLine = (s: GameState) => `LEVEL ${ROUNDS[s.cur].lvl} · ROUND ${roundNumber(s.cur)} OF ${levelSize(ROUNDS[s.cur].lvl)}`;

// ---------------------------------------------------------------- intro

function RoundIntro({ game: { s, round, actions }, dark }: { game: Game; dark: boolean }) {
  const isCall = round.kind === 'call', demo = s.cur === 0, kind = KINDS[round.kind];
  const steps = isCall ? ['Listen', 'Respond', 'Learn'] : ['Decide', 'Flag', 'Learn'];
  const title = isCall ? 'Answer the call.' : demo ? "Let's practice one together." : 'Real or scam?';
  const body = isCall ? 'Read what the caller says. Reply, or hang up whenever you think you should.'
    : demo ? "First you'll decide if it's real or a scam. Then we'll show you how to point out the red flags."
    : "Read the message and make your call. If you think it's a scam, you'll point out what gave it away.";
  const cta = isCall ? 'Answer' : demo ? 'Show me' : 'Open the message';
  // Call intros sit on the navy call background, so their text goes light.
  const fg = dark ? '#fff' : C.ink, sub = dark ? '#cfe0ff' : C.body, label = dark ? '#a3aebf' : C.muted;
  return (
    <div data-screen-label="Round intro" className="ss-fill" style={col(28, { paddingTop: 4 })}>
      <div style={{ display: 'flex', gap: 6 }}>
        {steps.map((l, k) => (
          <div key={l} style={col(6, { flex: 1 })}>
            <div style={{ height: 6, borderRadius: 999, background: k === 0 ? 'linear-gradient(90deg,#2A5FFC,#7E2CE2)' : '#dde5ef' }} />
            <span style={{ fontSize: 14, color: k === 0 ? fg : C.faint, fontWeight: 500 }}>{l}</span>
          </div>
        ))}
      </div>
      <div style={col(24, { flex: 1, justifyContent: 'center', animation: 'ss-rise .3s ease-out both' })}>
        <div style={col(14, { alignItems: 'center', textAlign: 'center' })}>
          <div style={{ width: 88, height: 88, borderRadius: '50%', background: '#ebf2ff', color: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={kind[1]} size={40} /></div>
          <span style={{ fontSize: 15, fontWeight: 500, letterSpacing: '0.06em', color: label }}>{demo ? 'PRACTICE ROUND' : roundLine(s)}</span>
          <span style={{ fontSize: 34, fontWeight: 600, lineHeight: 1.15, textWrap: 'balance', color: fg }}>{title}</span>
          <span style={{ fontSize: 20, lineHeight: 1.45, color: sub, textWrap: 'pretty', maxWidth: 440 }}>{body}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', borderRadius: 20, boxShadow: SHADOW, padding: '16px 18px' }}>
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

function Pieces({ list, game, round, im, head }: { list: Piece[]; game: Game; round: MessageRound; im: boolean; head?: boolean }) {
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

const secOf = (round: MessageRound, k: SectionKind) => round.sections.find(x => x.s === k)?.p ?? [];

/** iOS Messages look for text rounds. */
function TextMessage({ game, round }: { game: Game; round: MessageRound }) {
  const { s } = game;
  const head = secOf(round, 'head'), first = head[0];
  const unknown = /^\+/.test(typeof first === 'string' ? first : first?.t ?? '');
  const ios: CSSProperties = { fontFamily: "-apple-system,'SF Pro Text',system-ui,var(--font-sans)" };
  return (
    <div style={{ background: '#fff', borderRadius: 28, boxShadow: SHADOW, overflow: 'hidden', maxWidth: 440, margin: '0 auto', ...ios }}>
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

/** [padding, font size, weight, line height, colour, bottom border] per section type. */
const SEC: Record<SectionKind, [string, number, number, number, string, string]> = {
  head: ['12px 16px 2px', 18, 700, 1.9, C.ink, 'none'], meta: ['0 16px 12px', 14, 400, 1.9, C.muted, `2px solid ${C.line}`],
  subject: ['14px 16px 0', 20, 700, 1.9, C.ink, 'none'], body: ['14px 16px 18px', 19, 400, 1.85, C.ink, 'none'], foot: ['0 16px 16px', 15, 400, 1.9, C.muted, 'none'],
};

/** Email, DM, social post and listing rounds. */
function MessageCard({ game, round }: { game: Game; round: MessageRound }) {
  const kind = KINDS[round.kind];
  return (
    <Card style={{ overflow: 'hidden' }}>
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
    </Card>
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
const title = (t: string) => <span style={{ fontSize: 28, fontWeight: 600, lineHeight: 1.15, textWrap: 'balance' }}>{t}</span>;
const subline = (t: string) => <span style={{ fontSize: 18, color: C.muted, lineHeight: 1.45 }}>{t}</span>;

/**
 * Message rounds use three areas: `head` (step title), `msg` (the message) and `ctrl` (choices / results).
 * Phones stack them head → msg → ctrl; desktop puts the message on the left and head + ctrl in a side panel.
 */
function MessageRoundView({ game, round }: { game: Game; round: MessageRound }) {
  const { s } = game;
  const inFlags = !s.revealed && s.phase === 'flags';
  const head = s.revealed ? <RevealHead game={game} /> : inFlags ? <FlagsHead game={game} round={round} /> : <VerdictHead game={game} />;
  const ctrl = s.revealed ? <RevealBody game={game} /> : inFlags ? <FlagsControls game={game} round={round} /> : <VerdictControls game={game} />;
  return (
    <div className="ss-round">
      <div style={{ gridArea: 'head' }}>{head}</div>
      <div className="ss-round-msg" style={{ gridArea: 'msg' }}>
        {round.kind === 'text' ? <TextMessage game={game} round={round} /> : <MessageCard game={game} round={round} />}
      </div>
      <div style={{ gridArea: 'ctrl' }}>{ctrl}</div>
    </div>
  );
}

function FlagsHead({ game: { s }, round }: { game: Game; round: MessageRound }) {
  const demo = s.cur === 0, counted = round.lvl === 1 || s.wrongVerdict;
  const badCount = round.clues.filter(isBad).length;
  const dt = demoTarget(s);
  const [what, why] = demo
    ? (dt != null ? DEMO_COACH[dt] : [`You found all ${badCount}.`, 'Tap See results to learn what each one means.'])
    : [counted ? `Tap the ${badCount} red flags.` : 'Tap what gave it away.',
       s.wrongVerdict ? 'Learning them now makes the next one easier.' : 'Tap any words in the message that look off.'];
  return (
    <div style={col(8)}>
      {s.wrongVerdict && (
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: '#fff5e5', borderRadius: 20, padding: 16, marginBottom: 6, animation: 'ss-rise .3s ease-out both' }}>
          <span style={{ width: 36, height: 36, borderRadius: '50%', background: C.orange, color: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="Info" size={20} /></span>
          <div style={col(4)}>
            <span style={{ fontSize: 19, fontWeight: 600 }}>Ah, this one was tricky. It's a scam.</span>
            <span style={{ fontSize: 16, lineHeight: 1.45, color: C.body }}>Lots of people miss it. Let's find what gives it away.</span>
          </div>
        </div>
      )}
      {stepLabel(2)}
      {title(what)}
      {subline(why)}
    </div>
  );
}

function FlagsControls({ game: { s, actions }, round }: { game: Game; round: MessageRound }) {
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
          return <span key={i} style={{ width: 30, height: 30, borderRadius: '50%', border: on ? 'none' : `1.5px solid ${C.border}`, background: on ? C.orange : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500, fontSize: 14 }}>{on ? i + 1 : ''}</span>;
        })}
        <span style={{ fontSize: 17, fontWeight: 600, marginLeft: 4, flex: 1 }}>
          {counted ? `${foundBad} of ${badCount} found` : `${s.marked.length} marked`}
        </span>
        {!demo && <button onClick={actions.useHint} style={{ minHeight: 44, padding: '0 16px', borderRadius: 999, border: `1.5px solid ${C.border}`, background: '#fff', fontSize: 16, fontWeight: 500, color: C.ink, cursor: 'pointer' }}>Hint</button>}
      </div>
      {s.quip && <div style={{ background: C.ink, color: '#fff', borderRadius: 18, padding: '14px 16px', fontSize: 18, lineHeight: 1.45, animation: 'ss-rise .25s ease-out' }}>{s.quip}</div>}
      {canContinue && <PrimaryButton size={19} shadow={false} onClick={actions.reveal} style={{ animation: 'ss-rise .25s ease-out' }}>See results</PrimaryButton>}
      {!demo && <TextButton onClick={actions.skipFlags}>Skip — show me the answer</TextButton>}
    </div>
  );
}

function VerdictHead({ game: { s } }: { game: Game }) {
  return (
    <div style={col(8)}>
      {stepLabel(1)}
      {title('Is this real or a scam?')}
      {subline(s.cur === 0 ? "This one is a scam. Tap Scam and we'll show you why." : 'Read the message, then choose.')}
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
            minHeight: 72, borderRadius: 999, border: '2px solid transparent', background: '#fff', boxShadow: SHADOW,
            outline: guided ? '3px solid #FFA722' : 'none', outlineOffset: 3, opacity: off ? 0.45 : 1,
            fontSize: 21, fontWeight: 600, cursor: off ? 'default' : 'pointer', color: C.ink,
          }}>{id === 'legit' ? 'Real' : 'Scam'}</button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------- call rounds

function CallPlay({ game: { s, actions }, round }: { game: Game; round: CallRound }) {
  const log = s.log || [{ who: 'Caller', text: round.steps[0].caller }];
  return (
    <div className="ss-fill" style={col(16, { color: '#fff' })}>
      <div style={col(6, { alignItems: 'center', textAlign: 'center', padding: '0 0 6px' })}>
        <span style={kicker(14, '#a3aebf')}>{roundLine(s)}</span>
        <span style={{ fontSize: 30, fontWeight: 600 }}>{round.caller}</span>
        <span style={{ fontSize: 16, color: '#ffd89e' }}>Practice call · Caller ID can be faked</span>
      </div>
      {round.prelude && (
        <div style={col(8, { border: `1.5px dashed ${C.muted}`, borderRadius: 18, padding: '14px 16px' })}>
          <span style={{ fontSize: 14, fontWeight: 500, letterSpacing: '0.06em', color: '#a3aebf' }}>A FEW MINUTES EARLIER · TEXT FROM {round.prelude.from}</span>
          <span style={{ fontSize: 18, lineHeight: 1.45 }}>{round.prelude.text}</span>
          <span style={{ fontSize: 16, color: '#b5cdff' }}>You replied: {round.prelude.reply}</span>
        </div>
      )}
      {log.map((m, i) => {
        const you = m.who === 'You';
        return (
          <div key={i} style={{ display: 'flex', justifyContent: you ? 'flex-end' : 'flex-start', animation: 'ss-rise .3s ease-out' }}>
            <div style={{ maxWidth: '88%', padding: '14px 16px', borderRadius: 20, background: you ? C.blue : '#fff', color: you ? '#fff' : C.ink, fontSize: 19, lineHeight: 1.45 }}>{m.text}</div>
          </div>
        );
      })}
      <div style={col(10, { marginTop: 'auto', paddingTop: 8 })}>
        {s.callHint && (
          <div style={{ background: C.orange, color: C.ink, borderRadius: 18, padding: '14px 16px', fontSize: 18, lineHeight: 1.45, fontWeight: 600, animation: 'ss-rise .25s ease-out' }}>
            {round.hint || 'Hint: you can always hang up and call back on a number you trust.'}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16, color: '#a3aebf' }}>Reply…</span>
          <button onClick={actions.useHint} style={{ minHeight: 44, padding: '0 14px', borderRadius: 999, border: '1.5px solid rgba(255,255,255,0.3)', background: 'transparent', fontSize: 16, fontWeight: 500, color: '#fff', cursor: 'pointer' }}>Stuck? Hint</button>
        </div>
        {round.steps[s.step].replies.map(rp => (
          <button key={rp.text} className="ss-reply" onClick={() => actions.reply(rp)} style={{ minHeight: 58, padding: '12px 18px', borderRadius: 18, border: '2px solid #39465e', background: '#141e37', textAlign: 'left', fontSize: 18, color: '#fff', cursor: 'pointer', lineHeight: 1.35 }}>{rp.text}</button>
        ))}
        <span style={{ fontSize: 16, color: '#a3aebf', textAlign: 'center', paddingTop: 6 }}>…or</span>
        <button className="ss-press" onClick={actions.hangUp} style={{ minHeight: 68, borderRadius: 999, border: 'none', background: C.orange, color: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', fontSize: 21, fontWeight: 600 }}>
          <Icon name="CallMissed" size={28} />Hang up
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- reveal

type Row = { label: string; why: string; dot: string; icon: IconName };
type Outcome = { good: boolean; stamp: string; title: string; rowsTitle: string; rows: Row[] };

function outcome(s: GameState): Outcome {
  const round = ROUNDS[s.cur];
  if (round.kind !== 'call') {
    const scam = round.answer === 'scam', right = s.verdict === round.answer;
    const title = scam ? (right ? 'Correct. This is a scam.' : "This one was tricky — it's a scam.") : (right ? 'Correct. This message is real.' : 'This one is actually real.');
    if (!scam) {
      return { good: true, stamp: 'REAL', title, rowsTitle: "HOW YOU CAN TELL IT'S REAL", rows: round.clues.map(c => ({ label: c.label, why: c.why, dot: '#ebfaf6', icon: 'Checkmark' })) };
    }
    const bads = round.clues.map((c, i) => ({ ...c, i })).filter(isBad);
    return {
      good: false, stamp: 'SCAM', title, rowsTitle: `RED FLAGS · YOU FOUND ${bads.filter(c => s.marked.includes(c.i)).length} OF ${bads.length}`,
      rows: bads.map(c => { const m = s.marked.includes(c.i); return { label: c.label, why: m ? c.why : 'Missed — ' + c.why, dot: m ? C.teal : '#ffe9c9', icon: m ? 'Checkmark' : 'Search3' }; }),
    };
  }
  const E = {
    good: ['SAFE', s.endTitle || (s.endedAt === 0 ? 'You ended the call before they asked for anything.' : 'You ended the call. That was the right move.')],
    meh: ['ALMOST', round.meh || 'Good instinct, but there was a safer move.'],
    bad: ['SCAM', "This scam works on a lot of people. Here's how it worked."],
  } as const;
  const end = s.end || 'good';
  return { good: end === 'good', stamp: E[end][0], title: E[end][1], rowsTitle: 'TRICKS IT TRIED', rows: round.tricks.map(t => ({ label: t[0], why: t[1], dot: C.orange, icon: 'Exclamation' })) };
}

function RevealHead({ game: { s } }: { game: Game }) {
  const o = outcome(s);
  return (
    <div data-screen-label="Round reveal" style={col(10, { alignItems: 'flex-start', paddingTop: 4 })}>
      <Pill bg={o.good ? '#ebfaf6' : '#fff5e5'} fg={o.good ? '#22705a' : '#96600f'} dot={o.good ? C.teal : C.orange} style={{ letterSpacing: '0.04em', animation: 'ss-rise .3s ease-out both' }}>{o.stamp}</Pill>
      <span style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.15, textWrap: 'pretty' }}>{o.title}</span>
    </div>
  );
}

function RevealBody({ game: { s, round, actions } }: { game: Game }) {
  const o = outcome(s);
  const size = levelSize(round.lvl);
  const lvlLeft = ROUNDS.filter((rd, i) => rd.lvl === round.lvl && !isDone(s, i)).length;
  const [bName, bIcon, , bFill] = BADGES[round.lvl - 1];
  const say = round.kind === 'call' ? round.say : undefined;
  const lastInLevel = !(s.cur + 1 < ROUNDS.length && ROUNDS[s.cur + 1].lvl === round.lvl);
  return (
    <div style={col(18)}>
      <Card style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <span style={{ padding: '14px 16px 6px', fontSize: 14, fontWeight: 500, letterSpacing: '0.06em', color: C.body }}>{o.rowsTitle}</span>
        {o.rows.map(te => (
          <div key={te.label} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 16px', borderTop: `1px solid ${C.line}` }}>
            <span style={{ width: 30, height: 30, borderRadius: '50%', background: te.dot, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={te.icon} size={16} /></span>
            <div style={col(2)}>
              <span style={{ fontSize: 18, fontWeight: 600 }}>{te.label}</span>
              <span style={{ fontSize: 16, color: C.body, lineHeight: 1.4 }}>{te.why}</span>
            </div>
          </div>
        ))}
      </Card>
      <div style={col(12, { background: C.blue, color: '#fff', borderRadius: 24, boxShadow: SHADOW, padding: 20 })}>
        <span style={kicker(13, '#cfe0ff')}>BEST MOVE</span>
        <span style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.2 }}>{round.lesson}</span>
        {say && (
          <div style={{ background: '#fff', color: C.ink, borderRadius: '16px 16px 16px 4px', padding: '14px 16px', fontSize: 18, lineHeight: 1.4, fontWeight: 600 }}>
            <span style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.muted, marginBottom: 4 }}>WHAT TO SAY</span>{say}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', borderRadius: 20, boxShadow: SHADOW, padding: '14px 16px' }}>
        <span style={{ width: 48, height: 48, borderRadius: '50%', background: bFill, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={bIcon} size={22} /></span>
        <div style={col(2, { flex: 1 })}>
          <span style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.3 }}>Round {roundNumber(s.cur)} of {size} complete</span>
          <span style={{ fontSize: 15, color: C.muted }}>{lvlLeft ? `${lvlLeft} more to earn ${bName.startsWith('The ') ? '' : 'the '}${bName} badge` : `${bName} badge unlocked`}</span>
        </div>
      </div>
      <PrimaryButton shadow={false} onClick={actions.next}>{lastInLevel ? 'Finish level' : 'Next round'}</PrimaryButton>
      <TextButton onClick={actions.replay}>Play this round again</TextButton>
    </div>
  );
}
