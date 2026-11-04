import os
import requests
import json
import pypdf

os.makedirs('pricelists', exist_ok=True)

with open('pricelist_files_found.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Add Buana Central Park
data['Buana Central Park'] = {
    'pricelist_link': 'https://drive.google.com/drive/folders/1V9NePPHxwf30KpiB6Rhdhn8_pikiLbUz',
    'files': [{'id': '13njJMwAi_m3hBs4SPXfL8spOix6qjhND', 'name': 'BuCePa_PL_011026_311026.pdf'}]
}

headers = {'User-Agent': 'Mozilla/5.0'}

downloaded_info = []

for project_name, pdata in data.items():
    files = pdata.get('files', [])
    if not files:
        continue
    # Pick the best/latest pricelist file (prefer 'start' or latest date, or first)
    target_file = files[0]
    for f in files:
        if 'start' in f['name'].lower() or '2026' in f['name'] or 'sep' in f['name'].lower() or 'okt' in f['name'].lower():
            target_file = f
            break
            
    fid = target_file['id']
    fname = target_file['name'].replace(' PDF', '').strip()
    safe_pname = project_name.replace(' ', '_').replace('/', '_')
    local_pdf = os.path.join('pricelists', f"{safe_pname}.pdf")
    
    print(f"[*] Downloading {project_name}: {fname} ...")
    url = f"https://drive.usercontent.google.com/download?id={fid}&export=download"
    try:
        res = requests.get(url, headers=headers, timeout=30)
        if res.status_code == 200:
            with open(local_pdf, 'wb') as pf:
                pf.write(res.content)
            
            # Check if text extractable
            reader = pypdf.PdfReader(local_pdf)
            full_text = ""
            for p in reader.pages:
                full_text += p.extract_text() or ""
            
            is_text = len(full_text.strip()) > 50
            downloaded_info.append({
                'project': project_name,
                'filename': fname,
                'file_id': fid,
                'path': local_pdf,
                'num_pages': len(reader.pages),
                'is_text': is_text,
                'text_sample': full_text.strip()[:200] if is_text else 'IMAGE_BASED'
            })
            print(f"    [+] Saved ({len(res.content)} bytes, {len(reader.pages)} pages, is_text: {is_text})")
        else:
            print(f"    [!] Failed to download: HTTP {res.status_code}")
    except Exception as e:
        print(f"    [!] Error downloading: {e}")

with open('downloaded_pricelists_summary.json', 'w', encoding='utf-8') as f:
    json.dump(downloaded_info, f, indent=2, ensure_ascii=False)
