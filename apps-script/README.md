# Apps Script app

One Apps Script project serves all three surfaces with the same code:

- **Web app** — `doGet()` in `Code.gs` serves `Index.html`.
- **Docs and Sheets sidebars** — `showSidebar()` serves the same `Index.html`, with a
  "Use my selection" button that reads selected text through `getSelectedText()`.

Analysis runs in the browser. `Code.gs` never sees or sends the text anywhere.

| File | What it is | Edit by hand? |
|---|---|---|
| `Code.gs` | Serves pages, reads selection | yes |
| `Index.html` | Page shell; pulls in the files below with `include()` | yes |
| `Styles.html` | Shared styles | yes |
| `Ui.html` | Shared interface | yes |
| `Engine.html` | The analysis engine, bundled from `engine/` | **no** — run `npm run build` |
| `appsscript.json` | Project settings (shown in the editor when "Show appsscript.json" is on) | yes |

## Releases

Each release lists, in order, exactly which files to paste into the Apps Script
editor. Files not listed are unchanged.

### Release 0 — first setup

Create a new Apps Script project, then add these files (names must match exactly,
without the extension for HTML files):

1. `appsscript.json`
2. `Code.gs`
3. `Index` (HTML)
4. `Styles` (HTML)
5. `Ui` (HTML)
6. `Engine` (HTML)
