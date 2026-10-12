'use strict';

const { sentenceTokens, lower, clauseSpan, CALENDAR } = require('./helpers');

const COORDINATORS = new Set(['for', 'and', 'nor', 'but', 'or', 'yet', 'so']);
const PERSONAL = new Set(['i', 'you', 'he', 'she', 'it', 'we', 'they']);
const AFTER_COMMA = new Set([...PERSONAL, 'there', 'this', 'that', 'these', 'those', 'the', 'a', 'an',
  'my', 'your', 'his', 'her', 'our', 'their', 'now', 'then']);
// In a question, a second clause can start with a helping verb ("..., or will you be busy?").
const QUESTION_STARTERS = new Set(['will', 'would', 'can', 'could', 'should', 'do', 'does', 'did', 'is', 'are', 'was', 'were', 'have', 'has']);

module.exports = {
  ruleId: 'compound.coordinator',
  featureId: 'coordinating-conjunctions',
  tier: 'lexical',
  detect(context) {
    const out = [];
    for (const tokens of sentenceTokens(context)) {
      const isQuestion = tokens.length > 0 && tokens[tokens.length - 1].text === '?';
      tokens.forEach((t, i) => {
        const w = lower(t);
        if (!COORDINATORS.has(w) || i === 0) return;
        const before = tokens[i - 1].text;
        const next = tokens[i + 1];
        const nextWord = lower(next);
        const afterBreak = before === ',' || before === ';';
        const name = next && /^[A-Z][a-z]/.test(next.text) && !CALENDAR.has(nextWord);
        const joinsClauses = afterBreak
          ? AFTER_COMMA.has(nextWord) || name || (isQuestion && QUESTION_STARTERS.has(nextWord))
          : (w === 'but' || w === 'so' || w === 'yet') && PERSONAL.has(nextWord);
        if (!joinsClauses) return;
        out.push({
          level: 'sentence', ...clauseSpan(tokens, i),
          explanation: `"${t.text}" joins two independent clauses (compound sentence).`,
        });
      });
    }
    return out;
  },
};
