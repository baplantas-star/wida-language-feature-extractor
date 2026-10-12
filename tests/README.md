# Tests

`npm test` does two things:

1. **Contract check** (`contract.js`) — makes sure the engine's output always has
   the agreed shape and that every span points at the right characters.
2. **Detector scoring** (`run.js`) — runs the engine on every annotated sample in
   `samples/` and reports, per feature: correct detections, misses, false
   positives, precision, recall, and how many annotated examples the numbers
   come from. Features with no annotated examples are reported as
   **unvalidated**.

## Sample file format

Every sample is synthetic or authored — never student work — and must start with
the header line exactly as shown.

```
# SYNTHETIC — no student data
# Any other line starting with # is a comment.
TEXT:
The passage to analyze goes here. It can run
over several lines.
EXPECT:
+ feature-id | words the detector should mark
- feature-id | a near-miss the detector must NOT mark
```

- `+` lines are things the detector **should** find. The quoted words must appear
  exactly once in the passage (quote more words if needed to make it unique).
- `-` lines are near-misses: look-alikes that should **not** fire. Any detection of
  that feature touching those words counts as a false positive, and the report
  lists it separately.
- A detection matches a `+` line if it is the same feature and overlaps the
  quoted words.
