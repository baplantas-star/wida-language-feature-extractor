# WIDA feature inventory

`features.json` lists every WIDA language feature the tool knows about. It is the
only place WIDA terminology enters the code. Every WIDA-derived value is copied
exactly from a source listed in `reference/sources.md` — never paraphrased or
invented.

## Shape of one entry

```json
{
  "id": "example-feature-id",
  "widaName": "Exact wording from the WIDA document",
  "dimension": "word",
  "gradeBands": ["exact grade-band labels from the source"],
  "keyLanguageUses": ["exact Key Language Use names from the source"],
  "proficiencyRows": ["chart row(s) the feature appears in, as labeled in the source"],
  "source": { "ref": "S1", "location": "page / table / row where it appears" },
  "mapping": {
    "construct": "Grammatical construct(s) a detector looks for",
    "rationale": "Why this construct is evidence of the WIDA feature",
    "status": "unvalidated",
    "reviewedBy": null,
    "reviewedOn": null
  },
  "detectors": []
}
```

| Field | Meaning |
|---|---|
| `id` | Short, stable, lowercase-with-hyphens name used in code and tests. Ours, not WIDA's. |
| `widaName` | The feature exactly as WIDA words it. |
| `dimension` | `word`, `sentence`, or `discourse` — the detection `level` in the engine. |
| `gradeBands`, `keyLanguageUses` | Copied exactly from the source. |
| `proficiencyRows` | Where the feature sits on the chart. Recorded for reference only — the app never turns detections into a proficiency level. |
| `source.ref` | An ID from `reference/sources.md`; `location` says where in that document. |
| `mapping` | Our interpretation: which grammar a detector looks for and why. |
| `mapping.status` | `unvalidated` (default) → `reviewed` (Brett checked the rationale) → `validated` (measured on the annotated test set). |
| `detectors` | `ruleId`s of the detectors that produce this feature. |
