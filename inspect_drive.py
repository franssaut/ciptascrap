import re
import json

with open('debug_drive.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Let's search for filenames ending in pdf, jpg, png, xlsx
files = re.findall(r'"([^"]+\.(?:pdf|jpg|jpeg|png|xlsx|csv))"', html, re.IGNORECASE)
print('Found files:', set(files))

# Look for drive file IDs
# In Google Drive folder html, file metadata is often in window['_DRIVE_ivd'] or similar
patterns = re.findall(r'\["([a-zA-Z0-9_-]{25,})",\["([^"]+)"', html)
print('Patterns found:', len(patterns))
for pid, name in patterns[:10]:
    print(pid, name)
