import type { IconName } from '../ds/Icon';

export type Kind = 'text' | 'email' | 'dm' | 'social' | 'listing' | 'voicemail';

/** [label, icon, header tint] */
export const KINDS: Record<Kind, [string, IconName, string]> = {
  text: ['Text message', 'Message', '#ebf2ff'], email: ['Email', 'Mail', '#fff5e5'], dm: ['Direct message', 'Chat', '#ebfaf6'],
  social: ['Sponsored ad', 'Comment', '#f6f5ff'], listing: ['Marketplace listing', 'Cash', '#fff5e5'], voicemail: ['Voicemail', 'CallShield', '#ebf2ff'],
};

/** One level per message type: [title, skill, reward line, home-card line] */
export const LEVELS: [string, string, string, string][] = [
  ['Scam texts', 'Delivery fees, tolls and other surprise texts', 'You can spot a scam text at a glance.', "Let's review some scam texts"],
  ['Fraud texts', 'Bank alerts and one-time codes', 'You can tell a real bank alert from a fake one.', "Let's review some bank and code texts"],
  ['Emails', 'Check the sender, the links and the ask', 'You check the sender before you click.', "Let's review some emails"],
  ['Messages', 'Friends, buyers and strangers', 'You check with people before you send anything.', "Let's review some messages"],
  ['Ads', 'Sponsored posts and listings', 'You can tell a real deal from bait.', "Let's review some ads"],
  ['Voicemails', 'Robocalls and callback traps', 'You never call back a number from a voicemail.', "Let's listen to some voicemails"],
];

/** One badge per level: [name, icon, ring colour, fill colour] */
export const BADGES: [string, IconName, string, string][] = [
  ['Text Smarts', 'Message', '#25DAA7', '#ebfaf6'], ['Fraud Fighter', 'Shield', '#2A5FFC', '#ebf2ff'],
  ['Inbox Inspector', 'Mail', '#6a63cc', '#f6f5ff'], ['Chat Checker', 'Chat', '#ff8c5a', '#fff5e5'],
  ['Deal Detector', 'Cash', '#32a8b8', '#ebfaf6'], ['Callback Pro', 'CallShield', '#FFA722', '#fff5e5'],
];

/** A tappable phrase pointing at clue `c`. Plain strings are ordinary text (still tappable, but neutral). */
export type Flag = { t: string; c: number; link?: boolean };
export type Part = string | Flag;
export type SectionKind = 'head' | 'meta' | 'subject' | 'body' | 'foot';
export type Section = { s: SectionKind; p: Part[] };
export type Clue = { label: string; why: string; quip?: string; bad?: false };
export type Species = { name: string; icon: string; call: string; shoo: string };

export type Round = {
  id: string; lvl: number; kind: Kind; teaser: string; answer: 'scam' | 'legit';
  sections: Section[]; clues: Clue[]; lesson: string; species?: Species;
  /** What the player knows that the message itself doesn't show, e.g. "You just signed in". */
  context?: string;
};

const L = (t: string, c: number, x?: { link: 1 }): Flag => ({ t, c, ...(x ? { link: true } : {}) });

export const ROUNDS: Round[] = [
  // ---- Level 1 · Scam texts
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
  { id: 'amazon-delivered', lvl: 1, kind: 'text', teaser: "A text from Amazon saying your package was delivered", answer: 'legit',
    sections: [{ s: 'head', p: [L('262966', 0)] }, { s: 'meta', p: ['Today 2:15 PM'] },
      { s: 'body', p: ['Amazon: ', L('Your package was delivered. It was left at your front door', 1), '. See details in ', L('Your Orders in the Amazon app', 2), '. Reply STOP to opt out.'] }],
    clues: [
      { bad: false, label: 'Short code sender', why: "262966 is Amazon's real short code." },
      { bad: false, label: 'Just information', why: "No ask, no fee, no rush." },
      { bad: false, label: 'Points to the official app', why: 'No link to tap — it sends you somewhere you trust.' }],
    lesson: 'Nothing to do. Real messages inform you — they don\'t rush you.' },
  { id: 'ezpass-toll', lvl: 1, kind: 'text', teaser: "A text from E-ZPass about an unpaid toll", answer: 'scam',
    sections: [{ s: 'head', p: [L('+1 (602) 555‑0177', 0)] }, { s: 'meta', p: ['Today 6:40 PM'] },
      { s: 'body', p: ['E-ZPass: ', L('You have an unpaid toll of $6.85', 1), '. Pay now at ', L('https://ezpass-tollpay.com', 2, { link: 1 }), ' ', L('to avoid a $50 late fee', 3), '.'] }],
    clues: [
      { label: 'Random number', why: "E-ZPass doesn't text from random numbers." },
      { label: "A toll you don't remember", why: 'Check your real toll account, not the text.' },
      { label: 'Payment link', why: "Don't pay through a text link." },
      { label: 'Late-fee threat', why: 'Fear of a bigger bill rushes you.' }],
    lesson: 'Check your account at your official E-ZPass site — never through a text link.',
    species: { name: 'The Toll Troll', icon: 'NearMe', call: '"Unpaid toll — pay now or else!"', shoo: 'Check your real toll account.' } },
  // ---- Level 2 · Fraud texts
  { id: 'chase-fake-alert', lvl: 2, kind: 'text', teaser: "A text from Chase about a $1,249.99 purchase", answer: 'scam', context: 'You bank with Chase.',
    sections: [{ s: 'head', p: [L('+1 (469) 555‑0138', 0)] }, { s: 'meta', p: ['Today 3:52 PM'] },
      { s: 'body', p: ['Chase Fraud Alert: ', L('Unusual $1,249.99 purchase at Best Buy', 1), ' was flagged on your account. ', L('If this was NOT you, call our fraud team now at 1‑888‑555‑0136', 2), ' ', L('to avoid a hold on your card.', 3)] }],
    clues: [
      { label: 'A 10-digit number', why: 'Chase fraud alerts come from a short code, not a regular phone number.', quip: 'This came from a regular 10-digit number. Real bank alerts use short codes.' },
      { label: 'A big, scary charge', why: "A large purchase you didn't make is meant to make you panic.", quip: "A big charge you didn't make is designed to make you react before you think." },
      { label: 'Call this number', why: 'Real alerts ask you to reply YES or NO, or check the app. A number in a text can go straight to a scammer.', quip: "Real alerts don't ask you to call a number in the text. That number can connect you to the scammer." },
      { label: 'Hold threat', why: 'Threatening your card pushes you to act before you check.', quip: 'The threat of a hold on your card is pressure to act now.' }],
    lesson: "Don't call the number in the text. Open the Chase app or call the number on the back of your card." },
  { id: 'chase-fraud-alert', lvl: 2, kind: 'text', teaser: "A text from Chase asking if you made a purchase", answer: 'legit', context: 'You bank with Chase.',
    sections: [{ s: 'head', p: [L('24273', 0)] }, { s: 'meta', p: ['Today 3:41 PM'] },
      { s: 'body', p: ['Chase Fraud Alert: ', L('Did you attempt a $86.40 purchase at Target on 10/29?', 1), ' ', L('Reply YES or NO.', 2), ' ', L("We'll never ask for your PIN or a code by text.", 3), ' Msg&data rates may apply. Reply STOP to opt out.'] }],
    clues: [
      { bad: false, label: 'Short code sender', why: 'Real bank alerts come from short codes, not random 10-digit numbers.' },
      { bad: false, label: 'A specific purchase', why: 'It names the store, amount and date, so you can check it against what you bought.' },
      { bad: false, label: 'Only asks YES or NO', why: 'No link, no code, no personal details.' },
      { bad: false, label: "Says what it won't ask for", why: 'Real alerts remind you they never ask for your PIN or a code.' }],
    lesson: 'Reply YES or NO, or check the charge in the Chase app. If someone then calls asking for a code, hang up.' },
  { id: 'google-code', lvl: 2, kind: 'text', teaser: "A Google verification code, right after you signed in on your laptop", answer: 'legit', context: 'You just signed in to Gmail on your laptop.',
    sections: [{ s: 'head', p: [L('22000', 0)] }, { s: 'meta', p: ['Today 10:02 AM'] },
      { s: 'body', p: [L('G-482915', 1), ' is your Google verification code. ', L("Don't share it with anyone.", 2)] }],
    clues: [
      { bad: false, label: 'Short code sender', why: 'It comes from a short code, not a 10-digit phone number.' },
      { bad: false, label: 'Just a code', why: 'No link to tap, nothing to pay, nothing to reply.' },
      { bad: false, label: 'Tells you not to share it', why: 'Real code texts warn you. Scammers ask you to read the code back to them.' },
      { bad: false, label: 'You asked for it', why: 'You just signed in, so a code arriving now is expected.' }],
    lesson: "Type it in where you just signed in. If a code shows up when you didn't sign in, don't share it and change your password." },
  // ---- Level 3 · Emails
  { id: 'walmart-prize', lvl: 3, kind: 'email', teaser: "An email from Walmart saying you won $500. Claim now!", answer: 'scam',
    sections: [{ s: 'head', p: ['Walmart Rewards ', L('<winner@walmart-prize-claims.biz>', 0)] }, { s: 'meta', p: ['Today at 8:12 AM'] }, { s: 'subject', p: [L("You've WON a $500 Walmart gift card!!", 1)] },
      { s: 'body', p: ['Congratulations! Your email was picked as this month\'s winner.\n\n', L('Claim within 12 hours', 2), ' or the prize goes to someone else. We just need ', L('a card number to cover $4.95 shipping', 3), '.\n\n', L('[ Claim my prize ]', 4, { link: 1 })] }],
    clues: [
      { label: 'Strange sender', why: 'Walmart emails come from walmart.com — not this.', quip: 'The address ends in ".biz" and adds extra words. Walmart emails come from walmart.com.' },
      { label: "A prize you didn't enter for", why: "If you didn't enter, you didn't win.", quip: "You can't win a contest you didn't enter." },
      { label: '12-hour deadline', why: 'Rushing you is the trick.', quip: 'A short deadline is meant to rush you.' },
      { label: 'Pay for a "free" prize', why: "Real prizes don't cost money to claim.", quip: "Real prizes don't ask for a payment or card number." },
      { bad: false, label: 'The button', why: 'A button alone isn\'t a flag — but don\'t tap it here.', quip: "The button isn't the problem on its own — where it leads is." }],
    lesson: "Don't click. If you didn't enter, just delete it.",
    species: { name: 'The Prize Patrol', icon: 'Gift', call: '"Congratulations! Claim your reward today."', shoo: "If you didn't enter, you didn't win." } },
  { id: 'chase-signin-real', lvl: 3, kind: 'email', teaser: "An email from Chase about a new sign-in", answer: 'legit',
    sections: [{ s: 'head', p: ['Chase ', L('<no.reply.alerts@chase.com>', 0)] }, { s: 'meta', p: ['Oct 18 at 7:30 PM'] }, { s: 'subject', p: ['New sign-in on your account'] },
      { s: 'body', p: [L('Hi {name},', 1), '\n\nWe noticed a ', L('sign-in from a new device', 2), ' on Oct 18. If this was you, no action is needed.\n\nIf not, ', L('open the Chase Mobile app or call the number on the back of your card', 3), '.'] }],
    clues: [
      { bad: false, label: 'Correct address', why: 'chase.com, spelled right, no extra words.' },
      { bad: false, label: 'Uses your name', why: 'Your real bank knows who you are.' },
      { bad: false, label: '"New device"', why: "Sounds alarming, but it's just a heads-up." },
      { bad: false, label: 'Sends you to the app', why: 'No link — it points to channels you already trust.' }],
    lesson: 'Nothing to click. If you\'re unsure, check in the app yourself.' },
  { id: 'chase-evil-twin', lvl: 3, kind: 'email', teaser: "Another Chase email about an unusual sign-in", answer: 'scam',
    sections: [{ s: 'head', p: ['Chase ', L('<security@chase-alerts-secure.com>', 0)] }, { s: 'meta', p: ['Today at 6:02 AM'] }, { s: 'subject', p: ['URGENT: Unusual sign-in detected'] },
      { s: 'body', p: ['Dear customer,\n\nWe detected unusual activity. ', L('Confirm your identity within 2 hours', 1), ' to avoid suspension.\n\n', L('[ Verify account ]', 2, { link: 1 }), '\n\nYou will be asked for ', L('your card number and PIN', 3), '.'] }],
    clues: [
      { label: 'Extra word in the address', why: '"chase-alerts-secure.com" isn\'t chase.com.' },
      { label: '2-hour deadline', why: 'Real banks give you time.' },
      { label: 'A "verify" button', why: 'Banks send you to the app, not email buttons.' },
      { label: 'Asks for your PIN', why: 'Your bank never asks for your PIN.' }],
    lesson: "Don't click. Compare it with the real bank's emails — then delete.",
    species: { name: 'The Evil Twin', icon: 'CopyV1', call: '"URGENT: verify your account."', shoo: 'Compare the address with real emails.' } },
  // ---- Level 4 · Messages
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
  { id: 'marketplace-buyer', lvl: 4, kind: 'dm', teaser: "A Messenger message about the bike you're selling on Marketplace", answer: 'legit', context: "You listed your kid's bike on Facebook Marketplace yesterday.",
    sections: [{ s: 'head', p: [L('Maria Lopez', 0)] }, { s: 'meta', p: ["Messenger · Marketplace · Kids' bike, $40"] },
      { s: 'body', p: ['Hi! ', L('Is the bike still available?', 1), ' ', L('I can come look at it Saturday morning', 2), ' and ', L('pay cash when I pick it up', 3), '. What area are you in?'] }],
    clues: [
      { bad: false, label: 'Someone new', why: "Buyers are usually strangers. That's normal on Marketplace." },
      { bad: false, label: 'A simple question', why: 'It asks about the bike, not about you or your accounts.' },
      { bad: false, label: 'Wants to see it first', why: 'Real buyers want to look before they pay.' },
      { bad: false, label: 'Cash at pickup', why: 'No codes, no deposits, no payment app up front.' }],
    lesson: 'Fine to reply. Meet somewhere public, like a store parking lot, and take the cash in person.' },
  { id: 'romance', lvl: 4, kind: 'dm', teaser: "A message from someone you met online", answer: 'scam',
    sections: [{ s: 'head', p: ['David'] }, { s: 'meta', p: [L('You met on Words With Friends 3 months ago — never in person', 0)] },
      { s: 'body', p: ['Good morning! I finally booked a flight to see you. But ', L('my bank froze my card at the airport', 1), '. ', L('Could you wire $800?', 2), ' ', L("I'll pay you back the moment I land.", 3)] }],
    clues: [
      { label: 'Never met in person', why: 'Months of sweet talk, zero meetings.' },
      { label: 'Sudden money problem', why: 'Right when the meeting gets close.' },
      { label: 'Wire money', why: 'Wired money is almost impossible to get back.' },
      { label: 'Promise to repay', why: 'A promise costs them nothing.' }],
    lesson: "Never send money to someone you haven't met in person. Talk to someone you trust.",
    species: { name: 'The Sweetheart', icon: 'Heart', call: '"I just need help with the ticket."', shoo: "Never send money to someone you haven't met." } },
  // ---- Level 5 · Ads
  { id: 'celebrity-ad', lvl: 5, kind: 'social', teaser: "A Facebook ad promising $9,400 in one week", answer: 'scam',
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
  { id: 'target-ad', lvl: 5, kind: 'social', teaser: "A sponsored Facebook post from Target about fall deals", answer: 'legit',
    sections: [{ s: 'head', p: [L('Target ✓', 0)] }, { s: 'meta', p: ['Facebook · Sponsored'] },
      { s: 'body', p: ['Fall home deals are here. ', L('Save up to 30% on throw blankets and pillows', 1), ' through Saturday.\n\n', L('target.com', 2, { link: 1 })] },
      { s: 'foot', p: [L('Shop now · Sold and shipped by Target', 3)] }],
    clues: [
      { bad: false, label: 'Verified brand page', why: 'The real Target page, with the blue check, not a lookalike name.' },
      { bad: false, label: 'A normal discount', why: 'Up to 30% off is an ordinary sale, not a too-good-to-be-true price.' },
      { bad: false, label: 'Links to target.com', why: "The link goes to Target's own site." },
      { bad: false, label: 'No pressure', why: 'No countdown, no "only 3 left", no payment by gift card.' }],
    lesson: 'Fine to shop, but go to target.com or the Target app yourself rather than tapping ads when you can.' },
  { id: 'mower-listing', lvl: 5, kind: 'listing', teaser: "A $150 riding mower on Facebook Marketplace", answer: 'scam',
    sections: [{ s: 'head', p: ['Riding lawn mower · ', L('$150', 0)] }, { s: 'meta', p: ['Listed 1 hour ago · Chicago, IL'] },
      { s: 'body', p: ['Barely used 2023 model. ', L('Moving overseas, must sell today.', 1), ' ', L("Can't meet in person", 2), ' — ', L('send a $50 deposit by Zelle', 3), " to hold it and I'll ship it."] }],
    clues: [
      { label: 'Price too good', why: 'A $2,000 mower for $150? That\'s the bait.' },
      { label: '"Must sell today"', why: 'Rushing you again.' },
      { label: "Can't meet in person", why: "You can't see it — because it doesn't exist." },
      { label: 'Deposit by payment app', why: 'Like cash — no refunds.' }],
    lesson: 'Only buy what you can see in person, and pay when you pick it up.',
    species: { name: 'The Too-Good Deal', icon: 'Cash', call: '"Must sell today — just send a deposit."', shoo: 'See it in person before you pay.' } },
  // ---- Level 6 · Voicemails
  { id: 'ssa-robocall', lvl: 6, kind: 'voicemail', teaser: "An automated voicemail about your Social Security number", answer: 'scam',
    sections: [{ s: 'head', p: [L('+1 (202) 555‑0168', 0)] }, { s: 'meta', p: ['Today 8:47 AM · 0:31'] },
      { s: 'body', p: [L('This is an automated message from the Social Security Administration.', 1), ' ', L('Your Social Security number has been suspended', 2), ' due to suspicious activity. ', L('Press 1 now to speak to an officer', 3), ', ', L('or a warrant will be issued for your arrest.', 4)] }],
    clues: [
      { label: 'Unknown number', why: 'A random number, not a government line you know.' },
      { label: 'A robocall from "the government"', why: "Social Security doesn't leave automated threat messages." },
      { label: '"Suspended" number', why: "Social Security numbers don't get suspended." },
      { label: '"Press 1"', why: 'Pressing a key connects you straight to the scammer.' },
      { label: 'Arrest threat', why: 'Real agencies never threaten arrest by voicemail.' }],
    lesson: "Delete it. Don't call back or press anything. If you're worried, call Social Security at the number on ssa.gov." },
  { id: 'chase-voicemail', lvl: 6, kind: 'voicemail', teaser: "A voicemail from Chase about your card", answer: 'legit', context: 'You bank with Chase. Its number is saved in your contacts.',
    sections: [{ s: 'head', p: [L('Chase', 0)] }, { s: 'meta', p: ['Yesterday 4:12 PM · 0:24'] },
      { s: 'body', p: ['Hi, this is Chase calling about ', L('recent activity on your card ending in 4412', 1), '. ', L('Please review it in the Chase Mobile app, or call the number on the back of your card', 2), '. ', L('We will never ask for your PIN or a one-time code.', 3), ' Thank you.'] }],
    clues: [
      { bad: false, label: 'Saved contact', why: 'It matches the Chase number already in your phone.' },
      { bad: false, label: 'Names your card', why: 'It mentions your real card ending, not "your account".' },
      { bad: false, label: "Doesn't give its own callback number", why: 'It sends you to the app or the number on your card.' },
      { bad: false, label: "Says what it won't ask for", why: 'Real banks remind you they never ask for your PIN or codes.' }],
    lesson: 'Check the activity in the Chase app, or call the number on the back of your card. Never use a number left in a voicemail.' },
  { id: 'wells-fargo-voicemail', lvl: 6, kind: 'voicemail', teaser: "A voicemail from Wells Fargo's fraud department", answer: 'scam',
    sections: [{ s: 'head', p: [L('+1 (888) 555‑0193', 0)] }, { s: 'meta', p: ['Today 11:05 AM · 0:28'] },
      { s: 'body', p: ["Hi, this is Daniel from the Wells Fargo fraud department. ", L("We've placed a hold on your card.", 1), ' ', L('Call us back at 1‑888‑555‑0193', 2), ' ', L('within the hour', 3), ', and ', L('have your card number and PIN ready', 4), '.'] }],
    clues: [
      { label: 'Unknown number', why: "It isn't the Wells Fargo number in your contacts or on your card." },
      { label: 'Scary hold on your card', why: 'Meant to make you panic and call right away.' },
      { label: 'Their own callback number', why: 'A number left in a voicemail can go straight to a scammer.' },
      { label: '"Within the hour"', why: 'Rushing you is the giveaway.' },
      { label: 'Asks for your PIN', why: 'Your bank never asks for your PIN.' }],
    lesson: 'Don\'t call the number in the voicemail. Call the number on the back of your card instead.' },
];

export const isBad = (c: Clue) => c.bad !== false;
