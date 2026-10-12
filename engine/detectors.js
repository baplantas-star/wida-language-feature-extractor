'use strict';

// The list of detectors the engine runs. Empty until the first detector has
// an inventory entry and annotated test sentences (see CLAUDE.md).
//
// Each detector is: { ruleId, featureId, tier, detect(context) -> detections[] }
// where context = { text, sentences, tokens, options }.

module.exports = [];
