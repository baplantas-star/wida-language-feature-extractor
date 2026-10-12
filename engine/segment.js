'use strict';

// Splits text into sentences and word tokens, keeping exact character
// positions so every later detection can point back to the original text.
// Rule-based only; no models.

// Common abbreviations whose period does not end a sentence.
const ABBREVIATIONS = new Set([
  'mr', 'mrs', 'ms', 'dr', 'st', 'vs', 'etc', 'e.g', 'i.e', 'jr', 'sr', 'no',
]);

function splitSentences(text) {
  const sentences = [];
  const re = /[^.!?]+(?:[.!?]+["')\]]*|$)/g;
  let pending = null;
  let match;
  while ((match = re.exec(text)) !== null) {
    if (match[0].length === 0) {
      re.lastIndex++;
      continue;
    }
    const start = match.index;
    const end = start + match[0].length;
    if (pending) {
      pending.end = end;
    } else {
      pending = { start, end };
    }
    const lastWord = /([A-Za-z.]+)\.$/.exec(match[0].trimEnd());
    if (lastWord && ABBREVIATIONS.has(lastWord[1].toLowerCase())) continue;
    sentences.push(trimSpan(text, pending));
    pending = null;
  }
  if (pending) sentences.push(trimSpan(text, pending));
  return sentences
    .filter((s) => s.end > s.start)
    .map((s, index) => ({ index, start: s.start, end: s.end, text: text.slice(s.start, s.end) }));
}

function trimSpan(text, span) {
  let { start, end } = span;
  while (start < end && /\s/.test(text[start])) start++;
  while (end > start && /\s/.test(text[end - 1])) end--;
  return { start, end };
}

function tokenize(text, sentences) {
  const tokens = [];
  const re = /[A-Za-z0-9]+(?:['’\-][A-Za-z0-9]+)*|[^\sA-Za-z0-9]/g;
  for (const sentence of sentences) {
    const slice = text.slice(sentence.start, sentence.end);
    re.lastIndex = 0;
    let match;
    while ((match = re.exec(slice)) !== null) {
      const start = sentence.start + match.index;
      tokens.push({
        index: tokens.length,
        sentence: sentence.index,
        start,
        end: start + match[0].length,
        text: match[0],
        isWord: /^[A-Za-z0-9]/.test(match[0]),
      });
    }
  }
  return tokens;
}

module.exports = { splitSentences, tokenize };
