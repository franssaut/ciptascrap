import requests
import json
import re
from bs4 import BeautifulSoup

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def extract_drive_folder_id(url):
    m = re.search(r'/folders/([a-zA-Z0-9_-]+)', url)
    if m:
        return m.group(1)
    return None

def get_folder_files(folder_url):
    try:
        res = requests.get(folder_url, headers=HEADERS, timeout=15)
        if res.status_code != 200:
            return []
        
        html = res.text
        # Find elements like: <div ... aria-label="filename.ext ..." ... data-id="file_id"
        # Or data-id="..." with nearby filename
        files = []
        
        # Regex to find data-id and aria-label or data-tooltip
        # Look for pattern: aria-label="([^"]+)" ... data-id="([^"]+)" or vice-versa
        items = re.findall(r'data-id="([a-zA-Z0-9_-]{25,})"[^>]*?data-tooltip="([^"]+)"', html)
        if not items:
            items = re.findall(r'data-tooltip="([^"]+)"[^>]*?data-id="([a-zA-Z0-9_-]{25,})"', html)
            items = [(fid, name) for name, fid in items]
            
        if not items:
            # Fallback search
            labels = re.findall(r'aria-label="([^"]+\.(?:pdf|jpg|jpeg|png|xlsx|xls|docx))[^"]*"', html, re.IGNORECASE)
            ids = re.findall(r'data-id="([a-zA-Z0-9_-]{25,})"', html)
            print(f"Fallback found labels: {len(labels)}, ids: {len(ids)}")
            
        seen = set()
        for fid, name in items:
            if fid not in seen:
                seen.add(fid)
                files.append({'id': fid, 'name': name})
                
        return files
    except Exception as e:
        print(f"Error inspecting {folder_url}: {e}")
        return []

def main():
    with open('ciptagroup_projects_overview.csv', 'r', encoding='utf-8') as f:
        import pandas as pd
        df = pd.read_csv(f)

    results = {}
    for _, row in df.iterrows():
        pname = row['Project Name']
        plink = row['Pricelist Link']
        if pd.isna(plink) or not str(plink).strip():
            print(f"[ ] {pname}: No pricelist link")
            continue
            
        print(f"[*] Checking {pname}: {plink}")
        files = get_folder_files(str(plink))
        results[pname] = {
            'pricelist_link': plink,
            'files': files
        }
        for f in files:
            print(f"    - {f['name']} (ID: {f['id']})")
            
    with open('pricelist_files_found.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print("\nSaved pricelist_files_found.json")

if __name__ == '__main__':
    main()
