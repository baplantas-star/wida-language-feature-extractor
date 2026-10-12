# WIDA Language Feature Extractor — standing instructions

Owner: Brett Plantas (ELD instructional specialist; not a professional programmer).
Claude is the technical development partner. Brett describes changes; Claude implements,
commits, and explains major architectural decisions in plain language.

## Non-negotiables

1. **No runtime AI.** The shipped app must never call Claude, Gemini, OpenAI, or any
   generative model API. Analysis is rule-based and/or uses local NLP models that run
   in the browser (or, later, an approved district-hosted Python/spaCy service).
2. **No student data in this repo, ever.** Test samples are synthetic or authored.
   Every sample file carries a header line: `# SYNTHETIC — no student data`.
3. **WIDA is the authority.** Feature names, levels, grade bands, and Key Language Uses
   come from the WIDA source documents in `/reference` only. Never invent WIDA
   terminology. Any mapping from a WIDA feature to a grammatical construct is recorded
   in the inventory with its rationale and a validation status.
4. **Evidence, not judgments.** Every detection points to an exact character span and
   names the rule that produced it. No overall quality scores.
5. **Never infer proficiency.** The inventory may record which proficiency-level row a
   feature appears in on the chart, but the UI must never translate detections into a
   proficiency level or score.
6. **No fabricated accuracy.** Precision/recall are reported only from the annotated
   test set, with the set size stated. Unmeasured detectors are labeled "unvalidated."

## Architecture

- `engine/` — pure JavaScript, no DOM. Single entry point:
  `analyze(text, options) -> { sentences, tokens, detections[] }`.
  Each detection: `{ featureId, level: "word"|"sentence"|"discourse", start, end,
  text, ruleId, tier: "lexical"|"parse"|"interpretive-candidate", explanation }`.
  A future Python/spaCy engine must implement this same contract.
- `inventory/features.json` — the WIDA feature inventory (schema in `inventory/README.md`).
- `apps-script/` — the deployed app. One Apps Script project hosts everything: the
  standalone web app (`doGet`), the Docs sidebar, and the Sheets sidebar. No separate
  web host. Shared UI and engine code live in HTML partials pulled in with an
  `include()` helper so all three surfaces use identical code. Analysis runs
  client-side in the HtmlService iframe; server-side `.gs` code only serves pages and
  reads the user's selection.
- `build/` — a script that bundles `engine/` into `apps-script/Engine.html`. Each release
  is a short, numbered list of files Brett pastes into the Apps Script editor; keep
  that list as short as possible and say exactly which files changed.
- `tests/` — annotated synthetic samples + a script that reports precision, recall,
  and false positives per detector.

## Working style

- Small, reviewable commits with plain-English messages.
- Before adding a detector: add its inventory entry and at least five annotated test
  sentences (including near-misses that should NOT fire).
- Ask Brett only for linguistic or WIDA judgments; handle routine implementation.
