import type { CSSProperties } from 'react';
import { BADGES, KINDS, ROUNDS, isBad, type Round, type Part, type SectionKind } from '../data/content';
import { Icon, type IconName } from '../ds/Icon';
import { settings } from '../game/settings';
import { demoTarget, isDone, levelSize, roundNumber, roundsInLevel, subName, type Game, type GameState, type Mark } from '../game/useGame';
import { C, Card, FONT, Pill, PrimaryButton, SHADOW, TextButton, col, kicker } from '../ui';

export function RoundScreen({ game }: { game: Game }) {
  const { s, round } = game;
  return (
    <div data-screen-label={`Round L${round.lvl}-${roundNumber(s.cur)}`} style={col(18, { padding: '0 20px 48px' })}>
      <MessageRoundView game={game} round={round} />
    </div>
  );
}

const noun = (r: Round) => (r.kind === 'voicemail' ? 'voicemail' : 'message');
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
  const head = secOf(round, 'head'), first = head[0];
  const unknown = /^\+/.test(typeof first === 'string' ? first : first?.t ?? '');
  const ios: CSSProperties = { fontFamily: FONT };
  return (
    <div style={{ background: '#fff', borderRadius: 28, boxShadow: SHADOW, overflow: 'hidden', ...ios }}>
      <div style={{ background: '#f6f6f6', borderBottom: '1px solid #d1d1d6', padding: '12px 16px 10px', display: 'grid', gridTemplateColumns: '40px 1fr 40px', alignItems: 'center' }}>
        <span style={{ color: '#007aff', display: 'flex' }}><Icon name="ChevronLeft" size={26} /></span>
        <div style={col(4, { alignItems: 'center' })}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(180deg,#a5a9b1,#868a92)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="User" size={28} /></div>
          <span style={{ fontSize: 15, color: '#000', lineHeight: 1.9 }}>
            <Pieces list={pieces(head, 'h', true, game.s)} game={game} round={round} im head /> ›
          </span>
        </div>
        <span />
      </div>
      <div style={col(6, { padding: '14px 14px 18px', background: '#fff' })}>
        <span style={{ fontSize: 13, color: '#8e8e93', textAlign: 'center', lineHeight: 1.35 }}>Text Message<br />{String(secOf(round, 'meta')[0] ?? 'Today')}</span>
        <div style={{ alignSelf: 'flex-start', maxWidth: '86%', background: '#e9e9eb', color: '#000', borderRadius: '20px 20px 20px 6px', padding: '8px 14px', fontSize: 18, lineHeight: 1.95, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', marginTop: 6 }}>
          <Pieces list={pieces(secOf(round, 'body'), 'b', true, game.s)} game={game} round={round} im />
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

const plain = (parts: Part[]) => parts.filter((p): p is string => typeof p === 'string').join('').replace(/[\s·]+$/, '').trim();
const flags = (parts: Part[]) => parts.filter(p => typeof p !== 'string');
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
const frame: CSSProperties = { background: '#fff', borderRadius: 28, boxShadow: SHADOW, overflow: 'hidden', color: '#000', fontFamily: FONT };

/** Small white glyphs for the mockups' round buttons (not in the DS icon set). */
const Glyph = ({ d, size = 18 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={d} /></svg>
);
const G = {
  speaker: 'M3 9v6h4l5 4V5L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z',
  phone: 'M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1z',
  trash: 'M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
  play: 'M8 5v14l11-7z',
  like: 'M2 21h4V9H2v12zm20-11a2 2 0 0 0-2-2h-6.3l1-4.6v-.3c0-.4-.2-.8-.4-1.1L13.2 1 6.6 7.6c-.4.3-.6.8-.6 1.4v10a2 2 0 0 0 2 2h9c.8 0 1.5-.5 1.8-1.2l3-7.1c.1-.2.2-.5.2-.7v-2z',
  share: 'M14 9V5l7 7-7 7v-4.1c-5 0-8.5 1.6-11 5.1 1-5 4-10 11-11z',
};

/** iPhone Voicemail detail: caller, date, scrubber, controls and the transcription. */
function VoicemailCard({ game, round }: { game: Game; round: Round }) {
  const [when, length = '0:30'] = String(secOf(round, 'meta')[0] ?? 'Today').split(' · ');
  const blue = '#007aff', grey = '#8e8e93';
  const circle = (bg: string, d: string) => <span style={{ width: 40, height: 40, borderRadius: '50%', background: bg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Glyph d={d} /></span>;
  return (
    <div style={frame}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '14px 14px 4px', color: blue, fontSize: 17 }}><Icon name="ChevronLeft" size={22} />Voicemail</div>
      <div style={col(2, { padding: '18px 20px 10px' })}>
        <span style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.6 }}>
          <Pieces list={pieces(secOf(round, 'head'), 'h', true, game.s)} game={game} round={round} im head />
        </span>
        <span style={{ fontSize: 15, color: grey }}>mobile</span>
        <span style={{ fontSize: 15, color: grey }}>{when}</span>
      </div>
      <div style={col(4, { padding: '6px 20px 0' })}>
        <div style={{ position: 'relative', height: 3, borderRadius: 2, background: '#d1d1d6' }}>
          <span style={{ position: 'absolute', left: 0, top: -3, width: 9, height: 9, borderRadius: '50%', background: '#8e8e93' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: '#3c3c43' }}><span>0:00</span><span>−{length}</span></div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 16px' }}>
        <span style={{ color: blue, display: 'flex' }}><Glyph d={G.play} size={30} /></span>
        <span style={{ display: 'flex', gap: 14 }}>{circle(blue, G.speaker)}{circle(blue, G.phone)}{circle('#ff3b30', G.trash)}</span>
      </div>
      <div style={col(6, { padding: '0 20px 22px' })}>
        <span style={{ fontSize: 16, fontWeight: 600, color: grey }}>Transcription</span>
        <div style={{ fontSize: 17, lineHeight: 1.85, color: '#55555b', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
          “<Pieces list={pieces(secOf(round, 'body'), 'b', true, game.s)} game={game} round={round} im />”
        </div>
      </div>
    </div>
  );
}

/** iPhone Mail message: sender with initials avatar and address, date, subject, body. */
function EmailMock({ game, round }: { game: Game; round: Round }) {
  const head = secOf(round, 'head'), name = plain(head) || 'Sender';
  const blue = '#007aff', grey = '#8e8e93';
  return (
    <div style={frame}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '14px 14px 6px', color: blue, fontSize: 17 }}><Icon name="ChevronLeft" size={22} />Inbox</div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 18px 14px', borderBottom: '1px solid #e5e5ea' }}>
        <span style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(180deg,#a5a9b1,#868a92)', color: '#fff', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{initials(name)}</span>
        <div style={col(1, { flex: 1, minWidth: 0 })}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontSize: 17, fontWeight: 700 }}>{name}</span>
            <span style={{ fontSize: 14, color: grey, whiteSpace: 'nowrap' }}>{String(secOf(round, 'meta')[0] ?? 'Today')}</span>
          </div>
          <span style={{ fontSize: 14, color: grey, lineHeight: 1.8, overflowWrap: 'anywhere' }}>
            <Pieces list={pieces(flags(head), 'h', true, game.s)} game={game} round={round} im={false} head />
          </span>
          <span style={{ fontSize: 14, color: grey }}>To: You</span>
        </div>
      </div>
      <div style={col(10, { padding: '16px 18px 22px' })}>
        <span style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.7 }}>
          <Pieces list={pieces(secOf(round, 'subject'), 'su', true, game.s)} game={game} round={round} im={false} />
        </span>
        <div style={{ fontSize: 17, lineHeight: 1.85, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
          <Pieces list={pieces(secOf(round, 'body'), 'b', true, game.s)} game={game} round={round} im={false} />
        </div>
      </div>
    </div>
  );
}

/** Messenger chat: header with the contact, then their message as a grey bubble. */
function MessengerMock({ game, round }: { game: Game; round: Round }) {
  const fb = '#0084ff';
  return (
    <div style={frame}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderBottom: '1px solid #e5e5ea' }}>
        <span style={{ color: fb, display: 'flex' }}><Icon name="ChevronLeft" size={24} /></span>
        <span style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(180deg,#a5a9b1,#868a92)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="User" size={20} /></span>
        <div style={col(1, { minWidth: 0 })}>
          <span style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.6 }}><Pieces list={pieces(secOf(round, 'head'), 'h', true, game.s)} game={game} round={round} im={false} head /></span>
          <span style={{ fontSize: 13, color: '#65676b', lineHeight: 1.6 }}><Pieces list={pieces(secOf(round, 'meta'), 'm', false, game.s)} game={game} round={round} im={false} /></span>
        </div>
      </div>
      <div style={col(8, { padding: '16px 14px 20px' })}>
        <span style={{ fontSize: 12, color: '#65676b', textAlign: 'center' }}>Today 9:12 AM</span>
        <div style={{ alignSelf: 'flex-start', maxWidth: '86%', background: '#f0f0f0', borderRadius: '18px 18px 18px 4px', padding: '8px 14px', fontSize: 17, lineHeight: 1.85, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
          <Pieces list={pieces(secOf(round, 'body'), 'b', true, game.s)} game={game} round={round} im={false} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px 12px' }}>
        <span style={{ flex: 1, height: 36, borderRadius: 18, background: '#f0f0f0', display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 15, color: '#8a8d91' }}>Aa</span>
        <span style={{ color: fb, display: 'flex' }}><Glyph d={G.like} size={22} /></span>
      </div>
    </div>
  );
}

/** Facebook feed post: blue app bar, poster, then the ad text or the Marketplace listing card. */
function FacebookMock({ game, round }: { game: Game; round: Round }) {
  const listing = round.kind === 'listing', head = secOf(round, 'head');
  const s = game.s, fbBlue = '#4267B2', grey = '#65676b';
  const action = (d: string, label: string) => <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 600, color: grey }}><Glyph d={d} size={18} />{label}</span>;
  return (
    <div style={frame}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: fbBlue }}>
        <span style={{ flex: 1, height: 34, borderRadius: 17, background: 'rgba(0,0,0,0.18)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 15 }}><Icon name="Search3" size={16} />Search</span>
        <span style={{ width: 34, height: 34, borderRadius: '50%', background: '#fff', color: fbBlue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="Chat" size={18} /></span>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '12px 14px 8px' }}>
        <span style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(180deg,#a5a9b1,#868a92)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={listing ? 'Cash' : 'User'} size={20} /></span>
        <div style={col(0, { minWidth: 0 })}>
          <span style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.6 }}>
            {listing ? 'Marketplace' : <Pieces list={pieces(head, 'h', true, s)} game={game} round={round} im={false} head />}
          </span>
          <span style={{ fontSize: 13, color: grey }}>{String(secOf(round, 'meta')[0] ?? 'Sponsored')}</span>
        </div>
      </div>
      {!listing && (
        <div style={{ padding: '2px 14px 12px', fontSize: 17, lineHeight: 1.85, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
          <Pieces list={pieces(secOf(round, 'body'), 'b', true, s)} game={game} round={round} im={false} />
        </div>
      )}
      {/* Stand-in for the post photo. */}
      <div style={{ height: 180, background: 'linear-gradient(160deg,#e9edf3 0%,#cfd7e3 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9aa5b8' }}><Icon name={KINDS[round.kind][1]} size={56} /></div>
      {listing ? (
        <div style={col(4, { background: '#f0f2f5', padding: '12px 14px 14px' })}>
          <span style={{ fontSize: 17, fontWeight: 700 }}>{plain(head)}</span>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#31a24c', lineHeight: 1.7 }}><Pieces list={pieces(flags(head), 'h', true, s)} game={game} round={round} im={false} head /></span>
          <div style={{ fontSize: 16, lineHeight: 1.85, color: '#050505', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
            <Pieces list={pieces(secOf(round, 'body'), 'b', true, s)} game={game} round={round} im={false} />
          </div>
        </div>
      ) : secOf(round, 'foot').length > 0 && (
        <div style={{ padding: '10px 14px 4px', fontSize: 14, color: grey, lineHeight: 1.8 }}>
          <Pieces list={pieces(secOf(round, 'foot'), 'f', true, s)} game={game} round={round} im={false} />
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '10px 14px 12px', borderTop: '1px solid #e4e6eb', marginTop: 6 }}>
        {listing ? action(G.share, 'Share') : <>{action(G.like, 'Like')}{action(G.share, 'Share')}</>}
      </div>
    </div>
  );
}

const MOCKS: Record<Round['kind'], (p: { game: Game; round: Round }) => JSX.Element> = {
  text: TextMessage, email: EmailMock, dm: MessengerMock, social: FacebookMock, listing: FacebookMock, voicemail: VoicemailCard,
};

/** Practice-round coaching per FedEx flag: [what to tap, why it matters]. */
const DEMO_COACH: [string, string][] = [
  ['Tap the glowing phone number.', 'Real FedEx texts come from short codes, not random 10-digit numbers.'],
  ['Tap the glowing fee.', 'A tiny fee is bait to get your card number.'],
  ['Tap the glowing deadline.', 'Rushing you is a classic trick.'],
  ['Tap the glowing link.', 'FedEx lives at fedex.com, not fdx-ship.co.'],
];

const stepLabel = (n: 1 | 2) => <span style={kicker()}>STEP {n} OF 2</span>;
const title = (t: string) => <span style={{ fontSize: 28, fontWeight: 600, lineHeight: 1.1, textWrap: 'balance' }}>{t}</span>;
const subline = (t: string) => <span style={{ fontSize: 17, color: C.muted, lineHeight: 1.4 }}>{t}</span>;

/** A round, top to bottom: the step's title, the message, then the choices or results. */
function MessageRoundView({ game, round }: { game: Game; round: Round }) {
  const { s } = game;
  const inFlags = !s.revealed && s.phase === 'flags';
  // After the round: a summary page, without the message.
  if (s.revealed) return <div style={col(18)}><RevealHead game={game} /><RevealBody game={game} /></div>;
  return (
    <div style={col(18)}>
      {inFlags ? <FlagsHead game={game} round={round} /> : <VerdictHead game={game} />}
      {round.context && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: '#ebf2ff', borderRadius: 16, padding: '10px 14px', fontSize: 15, lineHeight: 1.4 }}>
          <span style={{ color: C.blue, display: 'flex', paddingTop: 1 }}><Icon name="Info" size={18} /></span>
          <span><strong style={{ fontWeight: 600 }}>What's happening: </strong>{round.context}</span>
        </div>
      )}
      {(() => { const Mock = MOCKS[round.kind]; return <Mock game={game} round={round} />; })()}
      {inFlags ? <FlagsControls game={game} round={round} /> : <VerdictControls game={game} />}
    </div>
  );
}

function FlagsHead({ game: { s }, round }: { game: Game; round: Round }) {
  const demo = s.cur === 0;
  const badCount = round.clues.filter(isBad).length;
  const dt = demoTarget(s);
  const [what, why] = demo
    ? (dt != null ? DEMO_COACH[dt] : [`You found all ${badCount}.`, "Tap See what to do to wrap up."])
    : [`Find the ${badCount} red flags.`,
       s.wrongVerdict ? 'Learning them now makes the next one easier.' : `Tap any words in the ${noun(round)} that look off.`];
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

/** While flagging: a red-flags card that fills in as the player finds each one. */
function FlagsControls({ game: { s, actions }, round }: { game: Game; round: Round }) {
  const demo = s.cur === 0;
  const badCount = round.clues.filter(isBad).length;
  const found = s.marked.filter((c): c is number => typeof c === 'number' && isBad(round.clues[c]));
  const allFound = found.length === badCount;
  // Only show the continue button once it can be used.
  const canContinue = demo ? allFound : s.marked.length > 0;
  return (
    <div style={col(14)}>
      {s.quip && <div style={{ background: C.ink, color: '#fff', borderRadius: 18, padding: '14px 16px', fontSize: 17, lineHeight: 1.45, animation: 'ss-rise .25s ease-out' }}>{s.quip}</div>}
      <Card style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', paddingBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '12px 16px 4px' }}>
          <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.06em', color: C.body }}>RED FLAGS · {found.length} OF {badCount} FOUND</span>
          {!demo && !allFound && <button onClick={actions.useHint} style={{ minHeight: 36, padding: '0 12px', borderRadius: 999, border: '1.5px dashed #a3aebf', background: '#fff', fontSize: 15, fontWeight: 500, color: C.ink, cursor: 'pointer' }}>Hint</button>}
        </div>
        {found.map(c => (
          <div key={c} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 16px', animation: 'ss-rise .3s ease-out both' }}>
            <span style={{ width: 24, height: 24, marginTop: 1, borderRadius: '50%', background: C.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="Checkmark" size={14} /></span>
            <div style={col(1)}>
              <span style={{ fontSize: 17, fontWeight: 600 }}>{round.clues[c].label}</span>
              <span style={{ fontSize: 15, color: C.body, lineHeight: 1.4 }}>{round.clues[c].why}</span>
            </div>
          </div>
        ))}
        {Array.from({ length: badCount - found.length }, (_, k) => (
          <div key={'left' + k} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 16px' }}>
            <span style={{ width: 24, height: 24, borderRadius: '50%', border: `1.5px dashed ${C.border}`, background: C.line, flexShrink: 0 }} />
            <span style={{ fontSize: 16, color: C.faint }}>{k === 0 ? 'Keep looking…' : '—'}</span>
          </div>
        ))}
      </Card>
      {canContinue && <PrimaryButton size={19} shadow={false} onClick={actions.reveal} style={{ animation: 'ss-rise .25s ease-out' }}>{allFound ? 'See what to do' : "I'm done, see what to do"}</PrimaryButton>}
      {!demo && !allFound && <TextButton onClick={actions.skipFlags}>Skip — show me the answer</TextButton>}
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
          <button key={id} onClick={() => actions.choose(id)} disabled={off} style={{
            minHeight: 64, borderRadius: 999, border: '2px solid transparent', background: '#fff', boxShadow: SHADOW,
            outline: guided ? '3px solid #FFA722' : 'none', outlineOffset: 3, opacity: off ? 0.45 : 1,
            fontSize: 19, fontWeight: 600, cursor: off ? 'default' : 'pointer', color: C.ink,
          }}>{id === 'legit' ? 'Real' : 'Scam'}</button>
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
    return { good: true, stamp: 'REAL', title, rowsTitle: "HOW YOU CAN TELL IT'S REAL", rows: round.clues.map(c => ({ label: c.label, why: c.why, dot: '#ebfaf6', icon: 'Checkmark' })) };
  }
  const bads = round.clues.map((c, i) => ({ ...c, i })).filter(isBad);
  return {
    good: false, stamp: 'SCAM', title, rowsTitle: `RED FLAGS · YOU FOUND ${bads.filter(c => s.marked.includes(c.i)).length} OF ${bads.length}`,
    rows: bads.map(c => { const m = s.marked.includes(c.i); return { label: c.label, why: m ? c.why : 'Missed — ' + c.why, dot: m ? C.teal : '#ffe9c9', icon: m ? 'Checkmark' : 'Search3' }; }),
  };
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
  const bName = BADGES[round.lvl - 1][0];
  const lastInLevel = !(s.cur + 1 < ROUNDS.length && ROUNDS[s.cur + 1].lvl === round.lvl);
  const progress = lvlLeft ? `${lvlLeft} more to earn ${bName.startsWith('The ') ? '' : 'the '}${bName} badge` : `${bName} badge unlocked`;
  return (
    <div style={col(16)}>
      <div style={col(10, { background: '#ebf2ff', borderRadius: 24, padding: '20px 20px' })}>
        <span style={kicker(13, C.blue)}>WHAT TO DO</span>
        <span style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.3, textWrap: 'pretty' }}>{round.lesson}</span>
      </div>
      <Card style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <span style={{ padding: '14px 16px 4px', fontSize: 13, fontWeight: 500, letterSpacing: '0.06em', color: C.body }}>{o.rowsTitle}</span>
        {o.rows.map(te => (
          <div key={te.label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 16px' }}>
            <span style={{ width: 24, height: 24, marginTop: 1, borderRadius: '50%', background: te.dot, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={te.icon} size={14} /></span>
            <div style={col(1)}>
              <span style={{ fontSize: 17, fontWeight: 600 }}>{te.label}</span>
              <span style={{ fontSize: 15, color: C.body, lineHeight: 1.4 }}>{te.why}</span>
            </div>
          </div>
        ))}
        <span style={{ height: 6 }} />
      </Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 4 }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {roundsInLevel(round.lvl).map(i => <span key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: isDone(s, i) ? C.teal : '#dde5ef' }} />)}
        </div>
        <span style={{ fontSize: 15, color: C.muted }}>Round {roundNumber(s.cur)} of {size} · {progress}</span>
      </div>
      <PrimaryButton shadow={false} onClick={actions.next}>{lastInLevel ? 'Finish level' : 'Next round'}</PrimaryButton>
    </div>
  );
}
