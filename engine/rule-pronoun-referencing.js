'use strict';

const { sentenceTokens, lower } = require('./helpers');

const PRONOUNS = new Set([
  'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself',
  'they', 'them', 'their', 'theirs', 'themselves',
]);
// "It" that does not refer to anything: "It is raining", "It seems ...".
const EMPTY_IT_BE = new Set(['is', 'was', "'s", '’s']);
const EMPTY_IT_AFTER_BE = new Set([
  'raining', 'snowing', 'sunny', 'cold', 'hot', 'windy', 'cloudy', 'time', 'important', 'likely',
  'possible', 'clear', 'true', 'necessary', 'hard', 'easy', 'fun', 'late', 'early', 'okay',
]);
const EMPTY_IT_VERBS = new Set(['seems', 'seemed', 'appears', 'appeared', 'rained', 'snowed', 'rains', 'snows']);

module.exports = {
  ruleId: 'pronoun-referencing.third-person',
  featureId: 'pronoun-referencing',
  tier: 'interpretive-candidate',
  detect(context) {
    const out = [];
    for (const tokens of sentenceTokens(context)) {
      tokens.forEach((t, i) => {
        const w = lower(t);
        if (!PRONOUNS.has(w)) return;
        if (w === 'it') {
          const next = lower(tokens[i + 1]);
          if (EMPTY_IT_VERBS.has(next)) return;
          if (EMPTY_IT_BE.has(next) && EMPTY_IT_AFTER_BE.has(lower(tokens[i + 2]))) return;
        }
        out.push({
          level: 'discourse', start: t.start, end: t.end,
          explanation: `"${t.text}" is a pronoun that may refer back to someone or something named earlier. Check what it refers to.`,
        });
      });
    }
    return out;
  },
};
