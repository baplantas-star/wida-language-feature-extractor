'use strict';

// Single entry point for the analysis engine. Pure JavaScript, no DOM, no
// network calls. A future Python/spaCy engine must return the same shape.
//
// analyze(text, options) -> { sentences, tokens, detections[] }
// Each detection:
//   { featureId, level: "word"|"sentence"|"discourse", start, end, text,
//     ruleId, tier: "lexical"|"parse"|"interpretive-candidate", explanation }

const { splitSentences, tokenize } = require('./segment');
const defaultDetectors = require('./detectors');

const LEVELS = ['word', 'sentence', 'discourse'];
const TIERS = ['lexical', 'parse', 'interpretive-candidate'];

function analyze(text, options = {}) {
  if (typeof text !== 'string') throw new TypeError('analyze(text): text must be a string');
  const detectors = options.detectors || defaultDetectors;
  const sentences = splitSentences(text);
  const tokens = tokenize(text, sentences);
  const context = { text, sentences, tokens, options };

  const detections = [];
  for (const detector of detectors) {
    for (const d of detector.detect(context)) {
      detections.push(checkDetection(text, { ruleId: detector.ruleId, featureId: detector.featureId, tier: detector.tier, ...d }));
    }
  }
  detections.sort((a, b) => a.start - b.start || a.end - b.end);
  return { sentences, tokens, detections };
}

// Every detection must point at a real span of the input and name its rule.
function checkDetection(text, d) {
  const problems = [];
  if (!d.featureId) problems.push('missing featureId');
  if (!d.ruleId) problems.push('missing ruleId');
  if (!LEVELS.includes(d.level)) problems.push(`bad level "${d.level}"`);
  if (!TIERS.includes(d.tier)) problems.push(`bad tier "${d.tier}"`);
  if (!(Number.isInteger(d.start) && Number.isInteger(d.end) && d.start >= 0 && d.end <= text.length && d.start < d.end)) {
    problems.push(`bad span ${d.start}-${d.end}`);
  }
  if (problems.length) throw new Error(`Invalid detection from ${d.ruleId || 'unknown rule'}: ${problems.join(', ')}`);
  return {
    featureId: d.featureId,
    level: d.level,
    start: d.start,
    end: d.end,
    text: text.slice(d.start, d.end),
    ruleId: d.ruleId,
    tier: d.tier,
    explanation: d.explanation || '',
  };
}

module.exports = { analyze };
