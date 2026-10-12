'use strict';

const { sentenceTokens, lower } = require('./helpers');

const MODALS = new Set([
  'can', 'could', 'may', 'might', 'must', 'shall', 'should', 'will', 'would', 'cannot',
  "can't", "couldn't", "mustn't", "shouldn't", "won't", "wouldn't", "mightn't", "shan't",
  'can’t', 'couldn’t', 'mustn’t', 'shouldn’t', 'won’t', 'wouldn’t', 'mightn’t', 'shan’t',
]);
// A word before the modal that shows it is being used as a noun ("a can", "free will").
const NOUN_SIGNALS = new Set([
  'a', 'an', 'the', 'this', 'that', 'my', 'your', 'his', 'her', 'its', 'our', 'their',
  'every', 'each', 'free', 'good', 'last', 'tin', 'trash', 'soda', 'in', 'of', 'since', 'until',
]);
const MONTH_FOLLOWERS = new Set(['is', 'was', "'s", '’s', 'and', ',', '.', 'has']);

module.exports = {
  ruleId: 'modal-verbs.word',
  featureId: 'modal-verbs',
  tier: 'lexical',
  detect(context) {
    const out = [];
    for (const tokens of sentenceTokens(context)) {
      tokens.forEach((t, i) => {
        const w = lower(t);
        if (!MODALS.has(w)) return;
        if (NOUN_SIGNALS.has(lower(tokens[i - 1]))) return;
        if (w === 'can' && lower(tokens[i + 1]) === 'of') return;
        if (w === 'may' && t.text === 'May' && (i > 0 || MONTH_FOLLOWERS.has(lower(tokens[i + 1])))) return;
        out.push({
          level: 'word', start: t.start, end: t.end,
          explanation: `"${t.text}" is a modal verb (helping verb).`,
        });
      });
    }
    return out;
  },
};
