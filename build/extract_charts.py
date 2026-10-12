"""Extracts the descriptor text of the WIDA Language Charts into JSON.

Reads word positions produced by `pdftotext -bbox` (poppler-utils) from the
chart pages and rebuilds each chart's rows and columns. Text is copied as
printed; only line breaks are joined.

Usage:
  pdftotext -bbox -f 9 -l 22 WIDA-Language-Charts.pdf charts-bbox.html
  python3 build/extract_charts.py charts-bbox.html > inventory/language-charts.json
"""

import html
import json
import re
import sys

FIRST_CHART_PAGE = 9
WORD = re.compile(r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</word>')
DIMENSIONS = ['discourse', 'sentence', 'word/phrase']
LEVEL_LABELS = ['Level 6', 'End of Level 5', 'End of Level 4', 'End of Level 3', 'End of Level 2', 'End of Level 1']
GRADE_LABELS = ['Grades 9–12', 'Grades 6–8', 'Grades 4–5', 'Grades 2–3', 'Grade 1', 'Kindergarten']


def words_by_page(path):
    pages = open(path, encoding='utf-8').read().split('<page ')[1:]
    for page in pages:
        yield [
            {'x0': float(a), 'y0': float(b), 'x1': float(c), 'y1': float(d), 't': html.unescape(t)}
            for a, b, c, d, t in WORD.findall(page)
        ]


def lines(words):
    """Groups words into lines (same baseline), left to right."""
    mid = lambda w: (w['y0'] + w['y1']) / 2
    rows = []
    for w in sorted(words, key=mid):
        if rows and abs(mid(rows[-1][0]) - mid(w)) < 4:
            rows[-1].append(w)
        else:
            rows.append([w])
    return [sorted(r, key=lambda w: w['x0']) for r in rows]


def find_labels(words, labels, x_limit):
    """Finds the y-centre of each row label in the left-hand column."""
    found = []
    for line in lines([w for w in words if w['x1'] < x_limit]):
        text = ' '.join(w['t'] for w in line)
        if text in labels:
            found.append((text, (line[0]['y0'] + line[0]['y1']) / 2))
    return found


def join_lines(words):
    text = ''
    for line in lines(words):
        part = ' '.join(w['t'] for w in line)
        if text.endswith('-') and not text.endswith(' -'):
            text += part  # hyphen at a line break stays as printed (e.g. subject-verb)
        else:
            text += (' ' if text else '') + part
    return text


def parse_chart(words, page_number):
    title = lines([w for w in words if w['y0'] < 28])[0]
    heading = ' '.join(w['t'] for w in title)
    m = re.match(r'(.+) (EXPRESSIVE|INTERPRETIVE)$', heading)
    if not m:
        raise ValueError(f'page {page_number}: unexpected heading {heading!r}')
    cluster, mode = m.group(1), m.group(2).lower()

    header_bottom = max(w['y1'] for w in words if 'Uses' == w['t'] and w['y0'] < 140)
    body = [w for w in words if w['y0'] > header_bottom and w['y1'] < 560]
    # Column left edges: every line of a cell starts at the same x, so the
    # three most common starting x positions (right of the labels) are the columns.
    starts = {}
    for line in lines(body):
        for i, w in enumerate(line):
            if w['x0'] > 140 and (i == 0 or w['x0'] - line[i - 1]['x1'] > 15):
                starts[round(w['x0'])] = starts.get(round(w['x0']), 0) + 1
    left_edges = sorted(sorted(starts, key=starts.get, reverse=True)[:3])
    first_col_x = left_edges[0]
    col_bounds = []
    for i, left in enumerate(left_edges):
        col_bounds.append((left - 2, left_edges[i + 1] - 2 if i + 1 < len(left_edges) else 10_000))

    by_grade = cluster == 'End of Level 1'
    labels = find_labels(body, GRADE_LABELS if by_grade else LEVEL_LABELS, first_col_x - 2)
    expected = 6
    if len(labels) != expected:
        raise ValueError(f'page {page_number}: found {len(labels)} row labels, expected {expected}')
    footer_top = min(w['y0'] for w in body if w['t'] == 'Planning' and w['y0'] > labels[-1][1])

    # Each column holds six cells stacked top to bottom; cells are separated
    # by a vertical gap larger than the normal line spacing.
    columns = {}
    for dim, (x0, x1) in zip(DIMENSIONS, col_bounds):
        col_lines = lines([w for w in body if x0 <= w['x0'] < x1 and w['y0'] < footer_top])
        cells = [[col_lines[0]]]
        for prev, line in zip(col_lines, col_lines[1:]):
            if line[0]['y0'] - prev[0]['y0'] > 18:
                cells.append([])
            cells[-1].append(line)
        if len(cells) != expected:
            raise ValueError(f'page {page_number}: {dim} column has {len(cells)} cells, expected {expected}')
        columns[dim] = [join_lines([w for line in cell for w in line]) for cell in cells]

    rows = []
    for i, (label, _) in enumerate(labels):
        row = {'gradeCluster': label, 'level': 'End of Level 1'} if by_grade else {'gradeCluster': cluster, 'level': label}
        for dim in DIMENSIONS:
            row[dim] = columns[dim][i]
        rows.append(row)
    return {'page': page_number, 'chart': cluster, 'mode': mode, 'rows': rows}


def main(path):
    charts = [parse_chart(words, FIRST_CHART_PAGE + i) for i, words in enumerate(words_by_page(path))]
    out = {
        'source': 'S1',
        'note': 'Descriptor text copied from the WIDA Language Charts (2025). '
                'Rows are proficiency-level boundaries, recorded for reference only; '
                'the app never maps detections to a level.',
        'charts': charts,
    }
    json.dump(out, sys.stdout, ensure_ascii=False, indent=2)
    sys.stdout.write('\n')


if __name__ == '__main__':
    main(sys.argv[1])
