# Reference

This repository is public, so the WIDA documents and their full text are **not**
stored here. Brett keeps the PDF. The repository records:

- `sources.md`: which WIDA documents are used (S1, S2, …), with edition and pages.
- In `inventory/features.json`: each feature's exact WIDA name, the page it is
  defined on, and the chart cells (page, grade cluster, mode, level, column) that
  name it, but not the descriptor or definition text.

## Regenerating chart links from the PDF (needs poppler-utils and Python 3)

```
pdftotext -bbox -f 9 -l 22 WIDA-Language-Charts.pdf charts-bbox.html
python3 build/extract_charts.py charts-bbox.html > reference/language-charts.local.json
python3 build/link_charts.py reference/language-charts.local.json inventory/features.json
```

`*.local.json` files hold WIDA text and are git-ignored. Don't commit them.
