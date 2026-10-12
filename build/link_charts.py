"""Records where each inventory feature is named in the WIDA Language Charts.

For every feature, finds the chart cells whose descriptor contains one of the
feature's `chartTerms` (exact phrases from the charts) and writes their
locations into `chartMentions`. Only locations and the matched phrase are
stored, not the descriptor text.

Usage: python3 build/link_charts.py language-charts.json inventory/features.json
(language-charts.json comes from build/extract_charts.py and stays local.)
"""

import json
import re
import sys


def main(charts_path, features_path):
    charts = json.load(open(charts_path, encoding='utf-8'))['charts']
    inventory = json.load(open(features_path, encoding='utf-8'))
    for feature in inventory['features']:
        mentions = []
        for chart in charts:
            for row in chart['rows']:
                for dimension in ('discourse', 'sentence', 'word/phrase'):
                    for term in feature['chartTerms']:
                        if re.search(r'\b' + re.escape(term) + r'\b', row[dimension], re.IGNORECASE):
                            mentions.append({
                                'page': chart['page'],
                                'gradeCluster': row['gradeCluster'],
                                'mode': chart['mode'],
                                'level': row['level'],
                                'column': dimension,
                                'term': term,
                            })
                            break
        feature['chartMentions'] = mentions
    with open(features_path, 'w', encoding='utf-8') as f:
        json.dump(inventory, f, ensure_ascii=False, indent=2)
        f.write('\n')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
