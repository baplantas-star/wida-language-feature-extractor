'use strict';

const { sentenceTokens, lower } = require('./helpers');

const ALWAYS = new Set(['this', 'these', 'those']);
const AFTER_THAT = new Set(['is', 'was', "'s", '’s', "isn't", "wasn't", 'isn’t', 'wasn’t']);
const BEFORE_THAT = new Set(['about', 'like', 'with', 'after', 'before', 'from', 'to', 'for', 'at', 'on', 'in', 'of', 'do', 'did', 'does']);

module.exports = {
  ruleId: 'demonstratives.word',
  featureId: 'demonstratives',
  tier: 'lexical',
  detect(context) {
    const out = [];
    for (const tokens of sentenceTokens(context)) {
      tokens.forEach((t, i) => {
        const w = lower(t);
        let pointing = ALWAYS.has(w);
        if (w === 'that') {
          // Only count "that" when it points ("That is mine", "like that.")
          // and not when it starts a clause ("an insect that can fly").
          const next = tokens[i + 1];
          pointing = i === 0 || !next || !next.isWord || AFTER_THAT.has(lower(next)) || BEFORE_THAT.has(lower(tokens[i - 1]));
        }
        if (!pointing) return;
        out.push({
          level: 'discourse', start: t.start, end: t.end,
          explanation: `"${t.text}" is a demonstrative that points to something already mentioned or present.`,
        });
      });
    }
    return out;
  },
};
