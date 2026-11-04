import os
import requests
import json

os.makedirs('assets/thumbnails', exist_ok=True)

with open('ciptagroup_complete.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

headers = {'User-Agent': 'Mozilla/5.0'}

for p in d['projects']:
    name = p['project_name']
    thumb_url = p.get('thumbnail')
    if thumb_url:
        safe_name = name.replace(' ', '_').replace('/', '_').lower()
        ext = '.jpg'
        if '.png' in thumb_url.lower():
            ext = '.png'
        elif '.webp' in thumb_url.lower():
            ext = '.webp'
        elif '.jpeg' in thumb_url.lower():
            ext = '.jpeg'
        
        local_path = os.path.join('assets/thumbnails', f"{safe_name}{ext}")
        print(f"Downloading {name} thumbnail...")
        try:
            res = requests.get(thumb_url, headers=headers, timeout=10)
            if res.status_code == 200:
                with open(local_path, 'wb') as f:
                    f.write(res.content)
                p['local_thumbnail'] = local_path.replace('\\', '/')
                print(f"  Saved to {local_path}")
        except Exception as e:
            print(f"  Error: {e}")

with open('ciptagroup_complete.json', 'w', encoding='utf-8') as f:
    json.dump(d, f, indent=2, ensure_ascii=False)

print("Finished downloading thumbnails.")
