import re

with open('debug_drive.html', 'r', encoding='utf-8') as f:
    html = f.read()

target = 'Astro_PL_start 010926.pdf'
pos = html.find(target)
if pos != -1:
    print("Found target at position:", pos)
    start = max(0, pos - 500)
    end = min(len(html), pos + 500)
    print("Context around target:")
    print(html[start:end])
else:
    print("Target not found directly.")
