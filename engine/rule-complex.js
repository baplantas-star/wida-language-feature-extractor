'use strict';

const { sentenceTokens, lower, startsSubject, clauseSpan } = require('./helpers');

const CATEGORY = {
  reasons: { featureId: 'complex-reasons', name: 'reason' },
  time: { featureId: 'complex-time', name: 'time' },
  comparisons: { featureId: 'complex-comparisons', name: 'comparison' },
  conditions: { featureId: 'complex-conditions', name: 'condition' },
};

// Multi-word subordinators WIDA lists, checked before single words.
const PHRASES = [
  { words: ['as', 'a', 'result', 'of'], category: 'reasons' },
  { words: ['as', 'long', 'as'], category: 'conditions' },
  { words: ['in', 'case'], category: 'reasons', needsSubject: true },
  { words: ['as', 'if'], category: 'comparisons' },
];
const SINGLE = {
  because: { category: 'reasons' },
  since: { category: 'reasons', needsSubject: true },
  when: { category: 'time', needsSubject: true },
  after: { category: 'time', needsSubject: true },
  before: { category: 'time', needsSubject: true },
  if: { category: 'conditions' },
  unless: { category: 'conditions' },
};

function matchPhrase(tokens, i) {
  for (const p of PHRASES) {
    if (p.words.every((w, k) => lower(tokens[i + k]) === w)) return p;
  }
  return null;
}

module.exports = {
  ruleId: 'complex.subordinator',
  featureIds: Object.values(CATEGORY).map((c) => c.featureId),
  tier: 'lexical',
  detect(context) {
    const out = [];
    for (const tokens of sentenceTokens(context)) {
      const isQuestion = tokens.length > 0 && tokens[tokens.length - 1].text === '?';
      for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];
        let rule = matchPhrase(tokens, i);
        let length = rule ? rule.words.length : 1;
        if (!rule) rule = SINGLE[lower(t)];
        let tier = 'lexical';

        // "Like many of their friends, they run every day." (WIDA's comparison example)
        if (!rule && i === 0 && lower(t) === 'like' && tokens.some((x) => x.text === ',')) {
          rule = { category: 'comparisons' };
          tier = 'interpretive-candidate';
        }
        if (!rule) continue;
        const word = lower(t);
        if (word === 'because' && lower(tokens[i + 1]) === 'of') continue;
        if (word === 'when' && i === 0 && isQuestion && !startsSubject(tokens[i + 1], false)) continue;
        if (rule.needsSubject && !startsSubject(tokens[i + length], false)) continue;

        const category = CATEGORY[rule.category];
        const span = clauseSpan(tokens, i);
        out.push({
          featureId: category.featureId, tier, level: 'sentence', ...span,
          explanation: `"${context.text.slice(t.start, tokens[i + length - 1].end)}" begins a dependent clause showing ${category.name} (complex sentence).`,
        });
        i += length - 1;
      }
    }
    return out;
  },
};
