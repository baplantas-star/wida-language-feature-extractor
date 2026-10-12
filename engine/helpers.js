'use strict';

// Small shared tools for detectors.

const SUBJECT_STARTERS = new Set([
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'there', 'this', 'that', 'these', 'those',
  'the', 'a', 'an', 'my', 'your', 'his', 'her', 'its', 'our', 'their',
  'someone', 'everyone', 'nobody', 'people', 'some', 'many', 'most', 'all',
]);

// Capitalized words that are not names of people or things doing an action.
const CALENDAR = new Set(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
  'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october',
  'november', 'december']);

const CLAUSE_BREAK = new Set([',', ';', ':', '.', '!', '?', '"', '”', ')']);

// Word lists per sentence, keeping punctuation tokens so rules can see commas.
function sentenceTokens(context) {
  const bySentence = context.sentences.map(() => []);
  for (const t of context.tokens) bySentence[t.sentence].push(t);
  return bySentence;
}

const lower = (t) => (t ? t.text.toLowerCase() : '');

// True if the token could begin the subject of a new clause.
function startsSubject(token, isSentenceStart) {
  if (!token || !token.isWord) return false;
  if (SUBJECT_STARTERS.has(lower(token))) return true;
  // A capitalized word mid-sentence is probably a name ("after Maria left").
  return !isSentenceStart && /^[A-Z][a-z]/.test(token.text) && !CALENDAR.has(lower(token));
}

// Span from token i up to (not including) the next clause break in the sentence.
function clauseSpan(tokens, i) {
  let j = i;
  while (j + 1 < tokens.length && !CLAUSE_BREAK.has(tokens[j + 1].text)) j++;
  return { start: tokens[i].start, end: tokens[j].end };
}

module.exports = { sentenceTokens, lower, startsSubject, clauseSpan, CALENDAR };
