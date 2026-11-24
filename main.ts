// Fortune Cookie Wisdom for Developers — make.fun entry (program/v1).
//
// The entry is exactly ONE original fortune-cookie line for a software
// developer, 1–120 characters, written to /output/entry.txt.
//
// A judge model in the character of a tired senior engineer picks the
// line that makes it smile and nod, weighing in order: (1) really one
// original line of fortune-cookie wisdom for a developer, (2) reads like
// a fortune cookie — one short balanced sentence landing in a single
// breath, (3) true about a developer's day, (4) a fresh turn, not a
// familiar saying, (5) a quiet twist or double meaning.
//
// This program scores a shortlist of candidate lines against that
// brief, in the brief's own priority order, and writes the winner —
// no trailing newline — to /output/entry.txt.
//
// Deterministic: no network, no model calls, no randomness, no clock.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

type Candidate = {
  text: string;
  fortune: number; // 1-5: really one line of fortune-cookie wisdom for a dev
  cookie: number; // 1-5: reads like a fortune cookie, one short balanced sentence
  truth: number; // 1-5: true about a developer's day (bugs, reviews, deploys, estimates, legacy code)
  fresh: number; // 1-5: turns the truth in a way not heard before
  twist: number; // 1-5: quiet twist or double meaning rewarding a second read
};

// The shortlist, brainstormed against the brief. Avoid reheated sayings
// ("it works on my machine", "99 little bugs", Friday-deploys-as-bravery,
// the meeting that should have been an email).
// Why the winner wins, in the brief's order:
//   - Fortune: a prophecy addressed to the reader, about their own day.
//   - Cookie: one short balanced sentence, lands in a single breath.
//   - True: every developer has taken a shortcut and paid for it later.
//   - Fresh: the shortcut is not condemned — it is already being debugged.
//   - Twist: "already debugging" flips time — the future self is at work
//     before the shortcut is even taken, so the shortcut is a bug already.
//     Second read: "about to take" means the reader can still not take it.
// Runner-up (the estimate line) loses on fresh/twist: its twist is one
// quiet observation, not a time-flip the reader has to re-read.
const CANDIDATES: Candidate[] = [
  {
    text: "Your future self is already debugging the shortcut you are about to take.",
    fortune: 5, cookie: 5, truth: 5, fresh: 5, twist: 5,
  },
  {
    text: "The estimate you fear to give is the only honest number in the room.",
    fortune: 5, cookie: 5, truth: 5, fresh: 4, twist: 4,
  },
  {
    text: "A quiet deploy is the loudest praise your pager will ever give you.",
    fortune: 5, cookie: 5, truth: 4, fresh: 4, twist: 5,
  },
  {
    text: "The bug you cannot reproduce is teaching you patience; the one you can is teaching you humility.",
    fortune: 5, cookie: 4, truth: 5, fresh: 4, twist: 4,
  },
  {
    text: "Your legacy code is not a curse; it is a letter from developers who survived the same deadline.",
    fortune: 5, cookie: 4, truth: 5, fresh: 4, twist: 4,
  },
  {
    text: "The branch you fear to merge holds the lesson you most need to learn.",
    fortune: 5, cookie: 5, truth: 4, fresh: 4, twist: 4,
  },
  {
    text: "You will meet a stranger today: the person who wrote this code, six months ago, was you.",
    fortune: 5, cookie: 4, truth: 5, fresh: 3, twist: 4,
  },
  {
    text: "The test that fails only on your machine knows something about you that the CI never will.",
    fortune: 5, cookie: 4, truth: 5, fresh: 4, twist: 4,
  },
  {
    text: "The code review that stings today is the documentation your future self will thank you for.",
    fortune: 5, cookie: 4, truth: 5, fresh: 3, twist: 3,
  },
  {
    text: "Every bug you fix quietly is a promotion your manager will never see coming.",
    fortune: 4, cookie: 4, truth: 4, fresh: 3, twist: 3,
  },
  {
    text: "A deploy on Friday is not brave; it is a fortune you have already spent.",
    fortune: 5, cookie: 5, truth: 4, fresh: 3, twist: 4,
  },
  {
    text: "The meeting that could have been an email is the universe asking you to write the email.",
    fortune: 4, cookie: 4, truth: 3, fresh: 3, twist: 3,
  },
];

// Score in the brief's own order: fortune, cookie-read, truth, fresh, twist.
// Lexicographic comparison keeps the brief's priority instead of blurring
// it into one weighted sum.
function score(c: Candidate): [number, number, number, number, number] {
  return [c.fortune, c.cookie, c.truth, c.fresh, c.twist];
}

function better(a: Candidate, b: Candidate): boolean {
  const sa = score(a);
  const sb = score(b);
  for (let i = 0; i < sa.length; i++) {
    if (sa[i] !== sb[i]) return sa[i] > sb[i];
  }
  return false; // exact tie: keep the earlier candidate (stable order)
}

let best = CANDIDATES[0];
for (const c of CANDIDATES.slice(1)) {
  if (better(c, best)) best = c;
}

const entry = best.text;

// Gate self-check: UTF-8 text, 1 to 120 characters, not only whitespace.
const length = [...entry].length;
if (length < 1 || length > 120) {
  throw new Error(`entry length ${length} is outside the 1-120 gate`);
}
if (entry.trim().length === 0) {
  throw new Error("entry is whitespace-only");
}

const outDir = process.env.OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
// No trailing newline: the gate counts every character in the file.
writeFileSync(`${outDir}/entry.txt`, entry, "utf8");

// Read it back and re-check: the file the grader gates must be the
// entry exactly, nothing else.
const written = readFileSync(`${outDir}/entry.txt`, "utf8");
if (written !== entry) {
  throw new Error(
    `entry.txt mismatch: wrote ${JSON.stringify(entry)}, read back ${JSON.stringify(written)}`,
  );
}

console.log(`entry (${length} chars): ${entry}`);
