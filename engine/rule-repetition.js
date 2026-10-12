'use strict';

const { sentenceTokens, lower } = require('./helpers');

// Common words that repeat in any text and do not tie ideas together.
const STOPWORDS = new Set(`a an the and but or so yet for nor of to in on at by with from up down out
over under into onto about as than then there here this that these those it its is are was were be been
being am do does did have has had i me my mine you your he him his she her we us our they them their
not no yes very too also just only all some any each every more most much many can could may might must
shall should will would what when where who whom which why how if because while after before again
one two three get got go went said say says like`.split(/\s+/));

const stem = (w) => (w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w);

module.exports = {
  ruleId: 'repetition.content-word',
  featureId: 'repetition',
  tier: 'lexical',
  detect(context) {
    const out = [];
    const sentences = sentenceTokens(context);
    sentences.forEach((tokens, s) => {
      if (s === 0) return;
      const prev = sentences[s - 1].filter((t) => t.isWord);
      const words = tokens.filter((t) => t.isWord);
      const prevStems = new Map(prev.map((t) => [stem(lower(t)), t.text]));

      // A repeated sentence opening ("I like cats. I like dogs.")
      if (words.length > 1 && prev.length > 1 && lower(words[0]) === lower(prev[0]) && lower(words[1]) === lower(prev[1])) {
        out.push({
          level: 'discourse', start: words[0].start, end: words[1].end,
          explanation: `Repeats the opening "${prev[0].text} ${prev[1].text}" from the previous sentence.`,
        });
      }
      // A repeated content word ("a cat ... The cat").
      const marked = new Set();
      for (const t of words) {
        const key = stem(lower(t));
        if (key.length < 3 || STOPWORDS.has(lower(t)) || STOPWORDS.has(key) || marked.has(key) || !prevStems.has(key)) continue;
        marked.add(key);
        out.push({
          level: 'discourse', start: t.start, end: t.end,
          explanation: `Repeats "${prevStems.get(key)}" from the previous sentence.`,
        });
      }
    });
    return out;
  },
};
