import { useEffect, useRef, useState } from 'react';

/** How a voicemail should sound. Uses the browser's built-in text-to-speech voices. */
export type VoiceStyle = { gender: 'female' | 'male'; rate?: number; pitch?: number };

// Common English voice names per platform (macOS/iOS, Chrome, Windows); the first one installed wins.
const PREFERRED: Record<VoiceStyle['gender'], string[]> = {
  female: ['Samantha', 'Ava', 'Allison', 'Google US English', 'Microsoft Aria', 'Microsoft Jenny', 'Karen', 'Moira'],
  male: ['Daniel', 'Alex', 'Aaron', 'Fred', 'Google UK English Male', 'Microsoft Guy', 'Microsoft Davis', 'Rishi'],
};

function pickVoice(gender: VoiceStyle['gender']): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices().filter(v => v.lang.toLowerCase().startsWith('en'));
  for (const name of PREFERRED[gender]) {
    const v = voices.find(x => x.name.includes(name));
    if (v) return v;
  }
  return voices.find(v => v.lang === 'en-US') ?? voices[0];
}

export const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

/** Play/stop a piece of text aloud, with a 0–1 progress value for a scrubber. Stops on unmount or when the text changes. */
export function useSpeech(text: string, style: VoiceStyle = { gender: 'female' }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const timer = useRef<number>();

  const stop = () => {
    window.clearInterval(timer.current);
    if (speechSupported) window.speechSynthesis.cancel();
    setPlaying(false);
  };
  useEffect(() => { setProgress(0); return stop; }, [text]);
  // Some browsers load their voice list late; asking once warms it up.
  useEffect(() => { if (speechSupported) window.speechSynthesis.getVoices(); }, []);

  const play = () => {
    if (!speechSupported) return;
    stop();
    const u = new SpeechSynthesisUtterance(text);
    const voice = pickVoice(style.gender);
    if (voice) u.voice = voice;
    u.rate = style.rate ?? 1; u.pitch = style.pitch ?? 1;
    // Word boundary events give exact progress where supported; a time estimate fills the gaps.
    const estMs = (text.split(/\s+/).length / 2.6 / u.rate) * 1000, startedAt = Date.now();
    let spoken = 0;
    u.onboundary = e => { spoken = e.charIndex / text.length; };
    u.onend = () => { window.clearInterval(timer.current); setPlaying(false); setProgress(1); };
    u.onerror = () => { window.clearInterval(timer.current); setPlaying(false); };
    timer.current = window.setInterval(() => setProgress(Math.min(0.98, Math.max(spoken, (Date.now() - startedAt) / estMs))), 120);
    setProgress(0); setPlaying(true);
    window.speechSynthesis.speak(u);
  };

  return { playing, progress, toggle: () => (playing ? stop() : play()) };
}
