'use strict';

// Checks that analyze() keeps its promised output shape, using made-up text
// and a throwaway test detector.

const assert = require('assert');
const { analyze } = require('../engine');

const text = 'Plants need sunlight. Dr. Lee watered them daily!  Did they grow?';
const result = analyze(text);

assert.deepStrictEqual(result.sentences.map((s) => s.text), [
  'Plants need sunlight.',
  'Dr. Lee watered them daily!',
  'Did they grow?',
]);
for (const s of result.sentences) assert.strictEqual(text.slice(s.start, s.end), s.text);
for (const t of result.tokens) assert.strictEqual(text.slice(t.start, t.end), t.text);
assert.deepStrictEqual(result.detections, []);

const fake = {
  ruleId: 'test.fake',
  featureId: 'test-feature',
  tier: 'lexical',
  detect: ({ tokens }) => tokens
    .filter((t) => t.text === 'sunlight')
    .map((t) => ({ level: 'word', start: t.start, end: t.end, explanation: 'test' })),
};
const withFake = analyze(text, { detectors: [fake] });
assert.deepStrictEqual(withFake.detections, [{
  featureId: 'test-feature', level: 'word', start: 12, end: 20, text: 'sunlight',
  ruleId: 'test.fake', tier: 'lexical', explanation: 'test',
}]);

const broken = { ...fake, detect: () => [{ level: 'word', start: 5, end: 999 }] };
assert.throws(() => analyze(text, { detectors: [broken] }), /bad span/);

console.log('Contract check passed.');
