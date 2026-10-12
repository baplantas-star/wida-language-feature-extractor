'use strict';

const { sentenceTokens, lower } = require('./helpers');

const HEDGES = new Set(['perhaps', 'maybe', 'possibly', 'probably', 'seem', 'seems', 'seemed', 'might', 'could']);
const POSSESSIVES = new Set(['my', 'your', 'his', 'her', 'its', 'our', 'their', 'all', 'the']);

module.exports = {
  ruleId: 'hedging.word',
  featureId: 'hedging',
  tier: 'interpretive-candidate',
  detect(context) {
    const out = [];
    for (const tokens of sentenceTokens(context)) {
      tokens.forEach((t, i) => {
        const w = lower(t);
        if (!HEDGES.has(w)) return;
        if (w === 'might' && POSSESSIVES.has(lower(tokens[i - 1]))) return; // "with all her might"
        out.push({
          level: 'word', start: t.start, end: t.end,
          explanation: `"${t.text}" can soften a statement or show uncertainty. Check whether it hedges here.`,
        });
      });
    }
    return out;
  },
};
