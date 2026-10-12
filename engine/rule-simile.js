'use strict';

const { sentenceTokens, lower } = require('./helpers');

const NOT_SIMILE_AS = new Set(['well', 'soon', 'long', 'far', 'much', 'many', 'if', 'though', 'a', 'an', 'the', 'follows', 'usual', 'such']);
const LIKE_AFTER = new Set([
  'was', 'is', 'are', 'were', 'be', 'been', 'looked', 'look', 'looks', 'sounded', 'sound', 'sounds',
  'felt', 'feel', 'feels', 'seemed', 'seems', 'acted', 'acts', 'ran', 'runs', 'moved', 'moves',
  'sang', 'sings', 'smelled', 'smells', 'tasted', 'tastes', 'just', 'swam', 'flew', 'roared', 'shone', 'glowed',
]);

module.exports = {
  ruleId: 'simile.as-like',
  featureId: 'simile',
  tier: 'interpretive-candidate',
  detect(context) {
    const out = [];
    for (const tokens of sentenceTokens(context)) {
      tokens.forEach((t, i) => {
        const w = lower(t);
        // as bright as the sun
        if (w === 'as' && tokens[i + 1] && tokens[i + 1].isWord && lower(tokens[i + 2]) === 'as' &&
            !NOT_SIMILE_AS.has(lower(tokens[i + 1])) && lower(tokens[i - 1]) !== 'as') {
          let end = i + 2;
          while (end + 1 < tokens.length && tokens[end + 1].isWord) end++;
          out.push({
            level: 'word', start: t.start, end: tokens[end].end,
            explanation: 'Comparison using "as ... as". Check whether two unlike things are compared (simile).',
          });
        }
        // ran like the wind
        if (w === 'like' && LIKE_AFTER.has(lower(tokens[i - 1])) && ['a', 'an', 'the'].includes(lower(tokens[i + 1]))) {
          let end = i + 1;
          while (end + 1 < tokens.length && tokens[end + 1].isWord) end++;
          out.push({
            level: 'word', start: t.start, end: tokens[end].end,
            explanation: 'Comparison using "like". Check whether two unlike things are compared (simile).',
          });
        }
      });
    }
    return out;
  },
};
