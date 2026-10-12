'use strict';

// Scores each detector against the annotated synthetic samples.
// Reports numbers only from annotated examples, with the count stated.

const fs = require('fs');
const path = require('path');
const { analyze } = require('../engine');
const detectors = require('../engine/detectors');

require('./contract');

const HEADER = '# SYNTHETIC — no student data';
const samplesDir = path.join(__dirname, 'samples');

function parseSample(file) {
  const raw = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const lines = raw.split('\n');
  if (lines[0] !== HEADER) throw new Error(`${file}: first line must be "${HEADER}"`);
  const textAt = lines.indexOf('TEXT:');
  const expectAt = lines.indexOf('EXPECT:');
  if (textAt < 0 || expectAt < textAt) throw new Error(`${file}: needs a TEXT: section followed by an EXPECT: section`);
  const text = lines.slice(textAt + 1, expectAt).join('\n');
  const scoresLine = lines.slice(0, textAt).find((l) => l.startsWith('SCORES:'));
  const expectations = [];
  for (const line of lines.slice(expectAt + 1)) {
    if (!line.trim() || line.startsWith('#')) continue;
    const m = /^([+-])\s*([a-z0-9-]+)\s*\|\s*(.+?)\s*$/.exec(line);
    if (!m) throw new Error(`${file}: can't read line "${line}"`);
    const quote = m[3];
    const start = text.indexOf(quote);
    if (start < 0) throw new Error(`${file}: "${quote}" is not in the passage`);
    if (text.indexOf(quote, start + 1) >= 0) throw new Error(`${file}: "${quote}" appears more than once; quote more words`);
    expectations.push({ positive: m[1] === '+', featureId: m[2], start, end: start + quote.length, quote });
  }
  // Only the features a sample lists are scored on it; other detectors' output is ignored there.
  const scores = new Set(scoresLine
    ? scoresLine.slice('SCORES:'.length).split(',').map((x) => x.trim()).filter(Boolean)
    : expectations.map((e) => e.featureId));
  return { name: path.basename(file), text, expectations, scores };
}

const overlaps = (a, b) => a.start < b.end && b.start < a.end;

const samples = fs.readdirSync(samplesDir)
  .filter((f) => f.endsWith('.txt'))
  .sort()
  .map((f) => parseSample(path.join(samplesDir, f)));

const stats = {};
const statFor = (id) => (stats[id] ||= { tp: 0, fn: 0, fp: 0, nearMissFired: 0, annotated: 0, nearMisses: 0, details: [] });

for (const sample of samples) {
  const detections = analyze(sample.text).detections.filter((d) => sample.scores.has(d.featureId));
  const used = new Set();
  for (const e of sample.expectations) {
    const s = statFor(e.featureId);
    if (!e.positive) { s.nearMisses++; continue; }
    s.annotated++;
    const hit = detections.findIndex((d, i) => !used.has(i) && d.featureId === e.featureId && overlaps(d, e));
    if (hit >= 0) { used.add(hit); s.tp++; } else { s.fn++; s.details.push(`  missed   ${sample.name}: "${e.quote}"`); }
  }
  detections.forEach((d, i) => {
    if (used.has(i)) return;
    const s = statFor(d.featureId);
    s.fp++;
    const nearMiss = sample.expectations.some((e) => !e.positive && e.featureId === d.featureId && overlaps(d, e));
    if (nearMiss) s.nearMissFired++;
    s.details.push(`  ${nearMiss ? 'near-miss' : 'extra   '} ${sample.name}: "${d.text}" (${d.ruleId})`);
  });
}

for (const d of detectors) for (const id of d.featureIds || [d.featureId]) statFor(id);

console.log(`\nSamples: ${samples.length} file(s). Detectors: ${detectors.length}.`);
console.log('Note: these samples were written by the same author as the rules, so the numbers are a floor check, not a field estimate.');
const ids = Object.keys(stats).sort();
if (ids.length === 0) {
  console.log('No detectors and no annotations yet — nothing to score.');
}
for (const id of ids) {
  const s = stats[id];
  console.log(`\n${id}`);
  if (s.annotated === 0) {
    console.log(`  unvalidated — no annotated examples (${s.fp} detection(s) on samples, ${s.nearMisses} near-miss line(s))`);
  } else {
    const precision = s.tp + s.fp ? (s.tp / (s.tp + s.fp)).toFixed(2) : 'n/a';
    const recall = (s.tp / s.annotated).toFixed(2);
    console.log(`  from ${s.annotated} annotated example(s) and ${s.nearMisses} near-miss(es):`);
    console.log(`  found ${s.tp}, missed ${s.fn}, false positives ${s.fp} (${s.nearMissFired} on near-misses)`);
    console.log(`  precision ${precision}, recall ${recall}`);
  }
  s.details.forEach((line) => console.log(line));
}
