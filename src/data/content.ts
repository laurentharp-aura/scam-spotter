import type { IconName } from '../ds/Icon';

export type Kind = 'text' | 'email' | 'dm' | 'social' | 'listing' | 'call';

/** [label, icon, header tint] */
export const KINDS: Record<Kind, [string, IconName, string]> = {
  text: ['Text message', 'Message', '#ebf2ff'], email: ['Email', 'Mail', '#fff5e5'], dm: ['Direct message', 'Chat', '#ebfaf6'],
  social: ['Social post', 'Comment', '#f6f5ff'], listing: ['Marketplace listing', 'Cash', '#fff5e5'], call: ['Phone call', 'CallShield', '#ebf2ff'],
};

/** [title, skill, reward line] */
export const LEVELS: [string, string, string][] = [
  ['The pause', 'Slow down before you click', 'You know when to pause.'],
  ['Magnifying glass', 'Check senders, links, and payments', 'You spot the details scammers hope you miss.'],
  ["Who's calling?", 'Hang up and call back', 'You know how to verify before you trust.'],
  ['Feed frenzy', 'Social media scams', 'You can spot scams that look social and familiar.'],
  ['The mixed bag', 'Tell real from fake', "You're ready for real-life scam decisions."],
  ["Champion's circle", 'Scams that come in steps', "You're a Scam Spotter Champion."],
];

/** One badge per level: [name, icon, ring colour, fill colour] */
export const BADGES: [string, IconName, string, string][] = [
  ['The Pause', 'Pause', '#25DAA7', '#ebfaf6'], ['Detail Detective', 'Search3', '#2A5FFC', '#ebf2ff'],
  ['Caller Check', 'CallShield', '#6a63cc', '#f6f5ff'], ['Feed Smarts', 'Comment', '#ff8c5a', '#fff5e5'],
  ['Real or Fake', 'CheckSquareOffset', '#32a8b8', '#ebfaf6'], ['Champion', 'Medal', '#FFA722', '#fff5e5'],
];

/** A tappable phrase pointing at clue `c`. Plain strings are ordinary text (still tappable, but neutral). */
export type Flag = { t: string; c: number; link?: boolean };
export type Part = string | Flag;
export type SectionKind = 'head' | 'meta' | 'subject' | 'body' | 'foot';
export type Section = { s: SectionKind; p: Part[] };
export type Clue = { label: string; why: string; quip?: string; bad?: false };
export type Species = { name: string; icon: string; call: string; shoo: string };

export type MessageRound = {
  id: string; lvl: number; kind: Exclude<Kind, 'call'>; teaser: string; answer: 'scam' | 'legit';
  sections: Section[]; clues: Clue[]; lesson: string; species?: Species;
};
export type CallEnd = 'good' | 'meh' | 'bad';
export type CallReply = { text: string; next?: number; end?: CallEnd; title?: string };
export type CallRound = {
  id: string; lvl: number; kind: 'call'; teaser: string; caller: string;
  steps: { caller: string; replies: CallReply[] }[];
  tricks: [string, string][]; meh?: string; lesson: string; say: string; hint?: string;
  prelude?: { from: string; text: string; reply: string }; species?: Species;
};
export type Round = MessageRound | CallRound;

const L = (t: string, c: number, x?: { link: 1 }): Flag => ({ t, c, ...(x ? { link: true } : {}) });

export const ROUNDS: Round[] = [
  // ---- Level 1
  { id: 'fedex-fee', lvl: 1, kind: 'text', teaser: "A text from FedEx saying your package is on hold", answer: 'scam',
    sections: [{ s: 'head', p: [L('+1 (938) 555‑0142', 0)] }, { s: 'meta', p: ['Today 9:14 AM'] },
      { s: 'body', p: ['FedEx: ', L('Your package is on hold', 4), ' due to an ', L('unpaid $1.99 delivery fee', 1), '. ', L('Pay within 24 hrs', 2), ' or it will be returned to sender: ', L('https://fdx-ship.co/pay', 3, { link: 1 })] }],
    clues: [
      { label: 'Random number', why: 'FedEx texts from short codes, not a 10-digit number.', quip: 'This is a regular 10-digit number. FedEx sends texts from short codes, not personal numbers.' },
      { label: 'Tiny fee', why: 'They want your card, not $1.99.', quip: 'A small fee is a common hook. The real goal is your card details.' },
      { label: '24-hour deadline', why: 'Rushing you is the trick.', quip: 'A 24-hour deadline is meant to make you act before you check.' },
      { label: 'Fake FedEx link', why: 'FedEx uses fedex.com — not "fdx-ship.co".', quip: 'The link goes to fdx-ship.co, not fedex.com. Always check the domain name in a link.' },
      { bad: false, label: 'Mentions a package', why: 'Fine on its own — lots of real texts do.', quip: 'Mentioning a package is normal. Many real delivery texts do.' }],
    lesson: 'Delete it and tap Report Junk. Track packages in the FedEx app or at fedex.com.',
    species: { name: 'The Phantom Fee', icon: 'Dollar', call: '"Pay a tiny fee or lose your package!"', shoo: 'Delete it. Track packages in the FedEx app.' } },
  { id: 'walmart-prize', lvl: 1, kind: 'email', teaser: "An email from Walmart saying you won $500. Claim now!", answer: 'scam',
    sections: [{ s: 'head', p: ['Walmart Rewards ', L('<winner@walmart-prize-claims.biz>', 0)] }, { s: 'subject', p: [L("You've WON a $500 Walmart gift card!!", 1)] },
      { s: 'body', p: ['Congratulations! Your email was picked as this month\'s winner.\n\n', L('Claim within 12 hours', 2), ' or the prize goes to someone else. We just need ', L('a card number to cover $4.95 shipping', 3), '.\n\n', L('[ Claim my prize ]', 4, { link: 1 })] }],
    clues: [
      { label: 'Strange sender', why: 'Walmart emails come from walmart.com — not this.', quip: 'The address ends in ".biz" and adds extra words. Walmart emails come from walmart.com.' },
      { label: "A prize you didn't enter for", why: "If you didn't enter, you didn't win.", quip: "You can't win a contest you didn't enter." },
      { label: '12-hour deadline', why: 'Rushing you is the trick.', quip: 'A short deadline is meant to rush you.' },
      { label: 'Pay for a "free" prize', why: "Real prizes don't cost money to claim.", quip: "Real prizes don't ask for a payment or card number." },
      { bad: false, label: 'The button', why: 'A button alone isn\'t a flag — but don\'t tap it here.', quip: "The button isn't the problem on its own — where it leads is." }],
    lesson: "Don't click. If you didn't enter, just delete it.",
    species: { name: 'The Prize Patrol', icon: 'Gift', call: '"Congratulations! Claim your reward today."', shoo: "If you didn't enter, you didn't win." } },
  { id: 'google-code', lvl: 1, kind: 'text', teaser: "A Google verification code, right after you signed in on your laptop", answer: 'legit',
    sections: [{ s: 'head', p: [L('22000', 0)] }, { s: 'meta', p: ['Today 10:02 AM'] },
      { s: 'body', p: [L('G-482915', 1), ' is your Google verification code. ', L("Don't share it with anyone.", 2)] }],
    clues: [
      { bad: false, label: 'Short code sender', why: 'It comes from a short code, not a 10-digit phone number.' },
      { bad: false, label: 'Just a code', why: 'No link to tap, nothing to pay, nothing to reply.' },
      { bad: false, label: 'Tells you not to share it', why: 'Real code texts warn you. Scammers ask you to read the code back to them.' },
      { bad: false, label: 'You asked for it', why: 'You just signed in, so a code arriving now is expected.' }],
    lesson: "Type it in where you just signed in. If a code shows up when you didn't sign in, don't share it and change your password." },
  { id: 'chase-locked', lvl: 1, kind: 'text', teaser: "A text from Chase saying your account is locked", answer: 'scam',
    sections: [{ s: 'head', p: [L('+1 (877) 555‑0102', 3)] }, { s: 'meta', p: ['Today 7:02 AM'] },
      { s: 'body', p: ['Chase Alert: ', L('Your account is LOCKED.', 0), ' Verify now at ', L('https://chase-secure-login.net', 1, { link: 1 }), ' ', L('or it will be closed today.', 2)] }],
    clues: [
      { label: 'All-caps alarm', why: 'Scary words make you rush.', quip: 'All-caps warnings are designed to alarm you into acting fast.' },
      { label: 'Link to "verify"', why: 'Banks ask you to use their app, not a text link.', quip: 'The link goes to chase-secure-login.net. Chase uses chase.com.' },
      { label: '"Closed today"', why: 'A threat plus a deadline.', quip: 'Threatening to close your account today is a pressure tactic.' },
      { bad: false, label: 'An 877 number', why: "Toll-free numbers look official, but anyone can get one.", quip: 'Toll-free numbers look official, but anyone can get one.' }],
    lesson: "Don't tap. Open your bank's app or call the number on your card.",
    species: { name: 'The Panic Button', icon: 'Exclamation', call: '"Your account is LOCKED!"', shoo: "Don't tap. Open your bank's app yourself." } },
  // ---- Level 2
  { id: 'bofa-lookalike', lvl: 2, kind: 'email', teaser: "An email from Bank of America asking you to update your details", answer: 'scam',
    sections: [{ s: 'head', p: ['Bank of America ', L('<alerts@bankofamerlca.com>', 0)] }, { s: 'subject', p: ['Action required: update your details'] },
      { s: 'body', p: [L('Dear Valued Customer,', 1), "\n\nWe're updating our records. Please confirm your information to keep your account active.\n\n", L('[ Update now ]  → bofa-verify.co', 2, { link: 1 }), '\n\n', L('© 2026 Bank of America Corporation', 3)] }],
    clues: [
      { label: '"amerlca", not "america"', why: 'An "l" is pretending to be an "i".' },
      { label: '"Dear Valued Customer"', why: 'Your real bank knows your name.' },
      { label: 'Link goes somewhere else', why: 'It leads to bofa-verify.co — not bankofamerica.com.' },
      { bad: false, label: 'Copyright line', why: 'Easy to copy. Not proof either way.' }],
    lesson: "Don't click. Log in through your bank's app or website you type yourself.",
    species: { name: 'The Sneaky Lookalike', icon: 'Link', call: '"Please confirm your details."', shoo: 'Check the sender address letter by letter.' } },
  { id: 'amazon-delivered', lvl: 2, kind: 'text', teaser: "A text from Amazon saying your package was delivered", answer: 'legit',
    sections: [{ s: 'head', p: [L('262966', 0)] }, { s: 'meta', p: ['Today 2:15 PM'] },
      { s: 'body', p: ['Amazon: ', L('Your package was delivered. It was left at your front door', 1), '. See details in ', L('Your Orders in the Amazon app', 2), '. Reply STOP to opt out.'] }],
    clues: [
      { bad: false, label: 'Short code sender', why: "262966 is Amazon's real short code." },
      { bad: false, label: 'Just information', why: "No ask, no fee, no rush." },
      { bad: false, label: 'Points to the official app', why: 'No link to tap — it sends you somewhere you trust.' }],
    lesson: 'Nothing to do. Real messages inform you — they don\'t rush you.' },
  { id: 'pastor-gift-cards', lvl: 2, kind: 'email', teaser: "An email from your pastor asking for a quick favor", answer: 'scam',
    sections: [{ s: 'head', p: ['Pastor Jim ', L('<pastorjim.office22@gmail.com>', 0)] }, { s: 'subject', p: ['Quick favor?'] },
      { s: 'body', p: ["Hi, are you around? I'm in meetings all day and ", L('need 4 Apple gift cards ($100 each)', 1), ' for a family in need. ', L('Please keep this between us', 2), ' — I want it to be a surprise. ', L('Send me photos of the card backs', 3), ' as soon as you can.\n\nBless you,\nJim'] }],
    clues: [
      { label: 'Unfamiliar address', why: "Anyone can make a Gmail with someone's name." },
      { label: 'Gift cards', why: "Scammers love them — they're like cash." },
      { label: 'Keep it secret', why: 'Secrecy stops you from checking.' },
      { label: 'Photos of the card backs', why: "That's all they need to spend it." }],
    lesson: 'Call Jim on a number you already have before doing anything.',
    species: { name: 'The Gift Card Favor', icon: 'CreditCard', call: '"Can you grab a few gift cards for me?"', shoo: 'Check by phone with the real person.' } },
  // ---- Level 3
  { id: 'wells-fargo-call', lvl: 3, kind: 'call', teaser: "A call from Wells Fargo about suspicious activity", caller: 'Wells Fargo',
    steps: [
      { caller: "Hi, this is Daniel from the Wells Fargo fraud department. We found suspicious activity on your card.", replies: [{ text: 'Oh no — what happened?', next: 1 }] },
      { caller: 'To stop it, I need you to confirm the six-digit code we just sent to your phone.', replies: [{ text: 'Okay, the code is…', end: 'bad' }, { text: 'Why do you need my code?', next: 2 }] },
      { caller: 'Please do this now — or your account could be frozen for days.', replies: [{ text: 'Fine. Here it is.', end: 'bad' }, { text: 'Can you email me instead?', end: 'meh' }] }],
    tricks: [['"Suspicious activity"', 'Scares you into reacting.'], ['"Confirm the code"', 'Real banks never ask for it.'], ['"Do this now"', 'Rushing you is the giveaway.']],
    meh: 'Asking for an email buys time, but scammers can send fake emails too.',
    lesson: 'Hang up. Call the number on the back of your Wells Fargo card.', say: '"Thanks — I\'ll call Wells Fargo myself."', hint: 'Hint: would your real bank ever ask for a code it just sent you? You can hang up anytime.',
    species: { name: 'The Fake Fraud Dept.', icon: 'CallShield', call: '"We just need that six-digit code."', shoo: 'Hang up. Call the number on your card.' } },
  { id: 'chase-fraud-alert', lvl: 3, kind: 'text', teaser: "A text from Chase asking if you made a purchase", answer: 'legit',
    sections: [{ s: 'head', p: [L('24273', 0)] }, { s: 'meta', p: ['Today 3:41 PM'] },
      { s: 'body', p: ['Chase Fraud Alert: ', L('Did you attempt a $86.40 purchase at Target on 10/29?', 1), ' ', L('Reply YES or NO.', 2), ' ', L("We'll never ask for your PIN or a code by text.", 3), ' Msg&data rates may apply. Reply STOP to opt out.'] }],
    clues: [
      { bad: false, label: 'Short code sender', why: 'Real bank alerts come from short codes, not random 10-digit numbers.' },
      { bad: false, label: 'A specific purchase', why: 'It names the store, amount and date, so you can check it against what you bought.' },
      { bad: false, label: 'Only asks YES or NO', why: 'No link, no code, no personal details.' },
      { bad: false, label: "Says what it won't ask for", why: 'Real alerts remind you they never ask for your PIN or a code.' }],
    lesson: 'Reply YES or NO, or check the charge in the Chase app. If someone then calls asking for a code, hang up.' },
  { id: 'medicare-call', lvl: 3, kind: 'call', teaser: "A call from Medicare offering free benefits", caller: 'Medicare', hint: 'Hint: Medicare already has your number. Why would they need it?',
    steps: [
      { caller: "Hello! I'm calling from Medicare. Good news — you qualify for a new card with extra free benefits.", replies: [{ text: 'Oh, nice. What do I need to do?', next: 1 }] },
      { caller: 'I just need to verify your Medicare number and date of birth to mail it out.', replies: [{ text: 'Sure, my number is…', end: 'bad' }, { text: "Shouldn't Medicare already have that?", next: 2 }] },
      { caller: "It's just a formality. This offer ends today, so let's finish now.", replies: [{ text: 'Okay, fine.', end: 'bad' }, { text: "I'll call Medicare myself to check.", end: 'good', title: 'You chose to check with Medicare directly.' }] }],
    tricks: [['"Free benefits"', 'A gift to lower your guard.'], ['"Verify your number"', 'Medicare already has it.'], ['"Ends today"', 'Real programs don\'t vanish overnight.']],
    lesson: 'Hang up. Call the number on your Medicare card.', say: '"I don\'t share that on calls. I\'ll call Medicare myself."',
    species: { name: 'The Benefits Caller', icon: 'IdCard', call: '"You qualify for free benefits!"', shoo: 'Call the number on your card.' } },
  { id: 'grandkid-call', lvl: 3, kind: 'call', teaser: "A late-night call from a grandkid in trouble", caller: 'Unknown number', hint: 'Hint: this is a perfect moment to ask for your family safe word.',
    steps: [
      { caller: "Grandma? It's me… I'm in trouble. I was in a car accident and they arrested me.", replies: [{ text: 'Jamie? Is that you?', next: 1 }, { text: "What's our family safe word?", end: 'good', title: 'Asking for the safe word is the right check.' }] },
      { caller: "Yeah, it's Jamie. Please don't tell Mom. My lawyer says I need $2,000 in gift cards for bail.", replies: [{ text: "Oh no, I'll go get them.", end: 'bad' }, { text: "What's our family safe word?", end: 'good', title: 'Asking for the safe word is the right check.' }] }],
    tricks: [['"It\'s me"', 'Vague on purpose — you fill in the name.'], ['"Don\'t tell Mom"', 'Secrecy stops you from checking.'], ['"Gift cards for bail"', "Courts don't take gift cards."]],
    lesson: 'Hang up and call your grandchild — or their parent — on a number you know.', say: '"What\'s our family safe word?"',
    species: { name: 'The Grandkid in Trouble', icon: 'Parent', call: '"Please don\'t tell Mom — I need bail money."', shoo: 'Ask for your family safe word.' } },
  // ---- Level 4
  { id: 'hijacked-friend', lvl: 4, kind: 'dm', teaser: "A Messenger message from a friend stuck overseas", answer: 'scam',
    sections: [{ s: 'head', p: [L('Linda Park', 3)] }, { s: 'meta', p: ['Messenger · Friends on Facebook for 6 years'] },
      { s: 'body', p: ['Hi!! Are you there? ', L("I'm stuck overseas and lost my wallet.", 0), ' Can you ', L('send $300 in gift cards', 1), "? I'll pay you back. ", L("Don't call — my phone is broken.", 2)] }],
    clues: [
      { label: 'Sudden emergency', why: 'Out of nowhere, with a sad story.' },
      { label: 'Gift cards', why: "Scammers' favorite way to get paid." },
      { label: '"Don\'t call"', why: "They don't want you to reach the real Linda." },
      { bad: false, label: "Her real account", why: 'It may really be hers — accounts get hacked.' }],
    lesson: 'Call Linda on her real number. Then report the account.',
    species: { name: 'The Hijacked Friend', icon: 'User', call: '"Can you send me a quick gift card?"', shoo: 'Call your friend to check.' } },
  { id: 'marketplace-buyer', lvl: 4, kind: 'dm', teaser: "A Messenger message about the bike you're selling on Marketplace", answer: 'legit',
    sections: [{ s: 'head', p: [L('Maria Lopez', 0)] }, { s: 'meta', p: ["Messenger · Marketplace · Kids' bike, $40"] },
      { s: 'body', p: ['Hi! ', L('Is the bike still available?', 1), ' ', L('I can come look at it Saturday morning', 2), ' and ', L('pay cash when I pick it up', 3), '. What area are you in?'] }],
    clues: [
      { bad: false, label: 'Someone new', why: "Buyers are usually strangers. That's normal on Marketplace." },
      { bad: false, label: 'A simple question', why: 'It asks about the bike, not about you or your accounts.' },
      { bad: false, label: 'Wants to see it first', why: 'Real buyers want to look before they pay.' },
      { bad: false, label: 'Cash at pickup', why: 'No codes, no deposits, no payment app up front.' }],
    lesson: 'Fine to reply. Meet somewhere public, like a store parking lot, and take the cash in person.' },
  { id: 'celebrity-ad', lvl: 4, kind: 'social', teaser: "A Facebook ad promising $9,400 in one week", answer: 'scam',
    sections: [{ s: 'head', p: [L('Chef Marco Bellini', 3)] }, { s: 'meta', p: ['Facebook · Sponsored'] },
      { s: 'body', p: [L('I turned $250 into $9,400 in one week', 0), ' with this app. ', L('Guaranteed returns', 1), ', no risk! ', L('Only 20 spots left.', 2), '\n\nbellini-crypto-secrets.io'] },
      { s: 'foot', p: [L("312 comments · \"It works!!\" \"Thanks Chef!\" \"Made $3k already\"", 4)] }],
    clues: [
      { label: 'Huge, fast gains', why: 'Too good to be true — because it is.' },
      { label: '"Guaranteed returns"', why: 'No real investment is guaranteed.' },
      { label: '"Only 20 spots left"', why: 'Fake scarcity to rush you.' },
      { bad: false, label: 'A famous face', why: 'Easy to copy. Not proof either way.' },
      { label: 'Gushing comments', why: 'Fake accounts post these by the hundreds.' }],
    lesson: 'Scroll past. Report the ad. Real experts don\'t promise guaranteed money.',
    species: { name: 'The Celebrity Tip', icon: 'Chart', call: '"I turned $250 into $9,400!"', shoo: 'Guaranteed returns are a guaranteed scam.' } },
  { id: 'mower-listing', lvl: 4, kind: 'listing', teaser: "A $150 riding mower on Facebook Marketplace", answer: 'scam',
    sections: [{ s: 'head', p: ['Riding lawn mower · ', L('$150', 0)] }, { s: 'meta', p: ['Facebook Marketplace · Listed 1 hour ago'] },
      { s: 'body', p: ['Barely used 2023 model. ', L('Moving overseas, must sell today.', 1), ' ', L("Can't meet in person", 2), ' — ', L('send a $50 deposit by Zelle', 3), " to hold it and I'll ship it."] }],
    clues: [
      { label: 'Price too good', why: 'A $2,000 mower for $150? That\'s the bait.' },
      { label: '"Must sell today"', why: 'Rushing you again.' },
      { label: "Can't meet in person", why: "You can't see it — because it doesn't exist." },
      { label: 'Deposit by payment app', why: 'Like cash — no refunds.' }],
    lesson: 'Only buy what you can see in person, and pay when you pick it up.',
    species: { name: 'The Too-Good Deal', icon: 'Cash', call: '"Must sell today — just send a deposit."', shoo: 'See it in person before you pay.' } },
  // ---- Level 5
  { id: 'chase-signin-real', lvl: 5, kind: 'email', teaser: "An email from Chase about a new sign-in", answer: 'legit',
    sections: [{ s: 'head', p: ['Chase ', L('<no.reply.alerts@chase.com>', 0)] }, { s: 'subject', p: ['New sign-in on your account'] },
      { s: 'body', p: [L('Hi {name},', 1), '\n\nWe noticed a ', L('sign-in from a new device', 2), ' on Oct 18. If this was you, no action is needed.\n\nIf not, ', L('open the Chase Mobile app or call the number on the back of your card', 3), '.'] }],
    clues: [
      { bad: false, label: 'Correct address', why: 'chase.com, spelled right, no extra words.' },
      { bad: false, label: 'Uses your name', why: 'Your real bank knows who you are.' },
      { bad: false, label: '"New device"', why: "Sounds alarming, but it's just a heads-up." },
      { bad: false, label: 'Sends you to the app', why: 'No link — it points to channels you already trust.' }],
    lesson: 'Nothing to click. If you\'re unsure, check in the app yourself.' },
  { id: 'chase-evil-twin', lvl: 5, kind: 'email', teaser: "Another Chase email about an unusual sign-in", answer: 'scam',
    sections: [{ s: 'head', p: ['Chase ', L('<security@chase-alerts-secure.com>', 0)] }, { s: 'subject', p: ['URGENT: Unusual sign-in detected'] },
      { s: 'body', p: ['Dear customer,\n\nWe detected unusual activity. ', L('Confirm your identity within 2 hours', 1), ' to avoid suspension.\n\n', L('[ Verify account ]', 2, { link: 1 }), '\n\nYou will be asked for ', L('your card number and PIN', 3), '.'] }],
    clues: [
      { label: 'Extra word in the address', why: '"chase-alerts-secure.com" isn\'t chase.com.' },
      { label: '2-hour deadline', why: 'Real banks give you time.' },
      { label: 'A "verify" button', why: 'Banks send you to the app, not email buttons.' },
      { label: 'Asks for your PIN', why: 'Your bank never asks for your PIN.' }],
    lesson: "Don't click. Compare it with the real bank's emails — then delete.",
    species: { name: 'The Evil Twin', icon: 'CopyV1', call: '"URGENT: verify your account."', shoo: 'Compare the address with real emails.' } },
  { id: 'ezpass-toll', lvl: 5, kind: 'text', teaser: "A text from E-ZPass about an unpaid toll", answer: 'scam',
    sections: [{ s: 'head', p: [L('+1 (602) 555‑0177', 0)] }, { s: 'meta', p: ['Today 6:40 PM'] },
      { s: 'body', p: ['E-ZPass: ', L('You have an unpaid toll of $6.85', 1), '. Pay now at ', L('https://ezpass-tollpay.com', 2, { link: 1 }), ' ', L('to avoid a $50 late fee', 3), '.'] }],
    clues: [
      { label: 'Random number', why: "E-ZPass doesn't text from random numbers." },
      { label: "A toll you don't remember", why: 'Check your real toll account, not the text.' },
      { label: 'Payment link', why: "Don't pay through a text link." },
      { label: 'Late-fee threat', why: 'Fear of a bigger bill rushes you.' }],
    lesson: 'Check your account at your official E-ZPass site — never through a text link.',
    species: { name: 'The Toll Troll', icon: 'NearMe', call: '"Unpaid toll — pay now or else!"', shoo: 'Check your real toll account.' } },
  // ---- Level 6
  { id: 'tag-team-call', lvl: 6, kind: 'call', teaser: "A text from Chase Fraud, then a call right after", caller: 'Chase Fraud', hint: 'Hint: the text and this call could be the same scammer. Who called whom?',
    prelude: { from: 'CHASE FRAUD', text: 'Did you attempt a $1,200 purchase at Best Buy? Reply YES or NO.', reply: 'NO' },
    steps: [
      { caller: 'Hi, this is the Chase fraud team following up on the text you just answered.', replies: [{ text: "Oh good. I didn't make that purchase.", next: 1 }] },
      { caller: "We'll reverse it. I'm sending a code to your phone — read it back so I can confirm it's you.", replies: [{ text: 'Okay, the code is…', end: 'bad' }, { text: 'Why do you need my code?', next: 2 }] },
      { caller: 'Quickly please — the charge goes through in five minutes.', replies: [{ text: 'Here it is.', end: 'bad' }, { text: "I'll call the number on my card.", end: 'good', title: 'You called your bank yourself. That stops this scam.' }] }],
    tricks: [['The text was the setup', 'It made the call feel expected.'], ['"Read the code back"', 'That code unlocks your account.'], ['"Five minutes"', 'A ticking clock to stop you thinking.']],
    lesson: 'A text and a call can be one scam. Call your bank yourself.', say: '"I\'ll call the number on my card."',
    species: { name: 'The Tag Team', icon: 'MobileNotification', call: '"Following up on the text you just answered…"', shoo: "A text then a call? Call your bank yourself." } },
  { id: 'bofa-code', lvl: 6, kind: 'text', teaser: "A Bank of America code, right after you tapped Forgot password", answer: 'legit',
    sections: [{ s: 'head', p: [L('73981', 0)] }, { s: 'meta', p: ['Today 11:20 AM'] },
      { s: 'body', p: ['BofA: ', L('Your one-time code is 830512.', 1), ' ', L('We will never call you to ask for this code.', 2), ' ', L("If you didn't request it, don't share it.", 3)] }],
    clues: [
      { bad: false, label: 'Short code sender', why: 'It comes from a short code, not a 10-digit phone number.' },
      { bad: false, label: 'You asked for it', why: 'You just tapped Forgot password, so a code arriving now is expected.' },
      { bad: false, label: 'Warns you about callers', why: 'Real code texts say the bank will never call for the code.' },
      { bad: false, label: 'No link', why: 'You type the code into the app yourself.' }],
    lesson: 'Type the code into the app yourself. If anyone calls and asks you to read it back, hang up, even if they say they are from the bank.' },
  { id: 'romance', lvl: 6, kind: 'dm', teaser: "A message from someone you met online", answer: 'scam',
    sections: [{ s: 'head', p: ['David'] }, { s: 'meta', p: [L('You met on Words With Friends 3 months ago — never in person', 0)] },
      { s: 'body', p: ['Good morning! I finally booked a flight to see you. But ', L('my bank froze my card at the airport', 1), '. ', L('Could you wire $800?', 2), ' ', L("I'll pay you back the moment I land.", 3)] }],
    clues: [
      { label: 'Never met in person', why: 'Months of sweet talk, zero meetings.' },
      { label: 'Sudden money problem', why: 'Right when the meeting gets close.' },
      { label: 'Wire money', why: 'Wired money is almost impossible to get back.' },
      { label: 'Promise to repay', why: 'A promise costs them nothing.' }],
    lesson: "Never send money to someone you haven't met in person. Talk to someone you trust.",
    species: { name: 'The Sweetheart', icon: 'Heart', call: '"I just need help with the ticket."', shoo: "Never send money to someone you haven't met." } },
  { id: 'disaster-donation', lvl: 6, kind: 'text', teaser: "A text asking you to donate to flood victims", answer: 'scam',
    sections: [{ s: 'head', p: [L('+1 (415) 555‑0123', 0)] }, { s: 'meta', p: ['Today 8:05 AM'] },
      { s: 'body', p: ['Red Cross Relief: Help families hit by ', L('the Texas floods', 4), '! ', L('Gifts matched for 24 hrs only', 1), '. ', L('Donate by gift card or crypto', 2), ': ', L('https://redcross-flood-relief.org', 3, { link: 1 })] }],
    clues: [
      { label: 'Unknown number', why: 'Real charities rarely text out of the blue.' },
      { label: '"24 hrs only"', why: 'Pressure, even for a good cause.' },
      { label: 'Gift card or crypto', why: 'Real charities take normal payments.' },
      { label: 'Lookalike site', why: 'The real Red Cross is redcross.org.' },
      { bad: false, label: 'A real disaster', why: 'The flood may be real — scammers follow the news.' }],
    lesson: 'Give at redcross.org or another charity you know — typed in yourself.',
    species: { name: 'The Disaster Donation', icon: 'Globe', call: '"Help flood victims — gift cards accepted!"', shoo: 'Give through a charity you know.' } },
];

export const isBad = (c: Clue) => c.bad !== false;
