'use strict';

// The detectors the engine runs. Each one has an inventory entry in
// inventory/features.json and annotated sentences in tests/samples/.
//
// Each detector is: { ruleId, featureId (or featureIds), tier, detect(context) -> detections[] }
// where context = { text, sentences, tokens, options }. A detection may set
// its own featureId and tier when the detector covers several features.

module.exports = [
  require('./rule-repetition'),
  require('./rule-demonstratives'),
  require('./rule-pronoun-referencing'),
  require('./rule-compound'),
  require('./rule-complex'),
  require('./rule-modal-verbs'),
  require('./rule-hedging'),
  require('./rule-simile'),
];
