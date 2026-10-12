# WIDA Language Feature Extractor

Finds evidence of WIDA language features in a piece of writing and shows exactly
where each one appears and which rule found it. Rule-based: no AI service is ever
called, and the tool never scores writing or estimates proficiency.

Standing project rules are in `CLAUDE.md`.

| Folder | Contents |
|---|---|
| `engine/` | The analysis code (plain JavaScript). Entry point: `analyze(text, options)`. |
| `inventory/` | The WIDA feature list and the reasoning behind each detector. |
| `reference/` | Which WIDA documents the feature list cites. (The documents themselves are not stored here.) |
| `apps-script/` | The Google Apps Script app: web app plus Docs and Sheets sidebars. |
| `build/` | Copies the engine into `apps-script/Engine.html`. |
| `tests/` | Synthetic annotated samples and the accuracy report. |

## Commands (need Node.js)

- `npm test` — checks the engine and reports precision/recall per detector.
- `npm run build` — regenerates `apps-script/Engine.html` after engine changes.
