import requests
import json
import os
import re
from bs4 import BeautifulSoup
import pandas as pd

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
}

def fetch_linktree(url):
    """Fetch and parse Linktree page using __NEXT_DATA__ SSR payload."""
    try:
        clean_url = url.split('?')[0]
        res = requests.get(clean_url, headers=HEADERS, timeout=15)
        if res.status_code != 200:
            print(f"[!] HTTP {res.status_code} for {clean_url}")
            return None
        
        soup = BeautifulSoup(res.text, 'html.parser')
        script = soup.find('script', id='__NEXT_DATA__')
        if not script or not script.string:
            print(f"[!] No __NEXT_DATA__ found for {clean_url}")
            return None
        
        data = json.loads(script.string)
        return data.get('props', {}).get('pageProps', {})
    except Exception as e:
        print(f"[!] Error fetching {url}: {e}")
        return None

def categorize_link(title, url):
    """Categorize link based on title and URL for easier navigation."""
    t = (title or '').lower().strip()
    u = (url or '').lower().strip()
    
    if any(k in t for k in ['price', 'harga', 'price list', 'pricelist', 'biaya']):
        return 'Pricelist'
    elif any(k in t for k in ['brosur', 'brochure', 'flyer', 'katalog', 'leaflet', 'detail rumah', 'informasi detail']):
        return 'Brochure'
    elif any(k in t for k in ['siteplan', 'site plan', 'masterplan', 'master plan', 'denah', 'floor plan', 'floorplan']):
        return 'Siteplan & Floor Plan'
    elif any(k in t for k in ['progres', 'progress']):
        return 'Construction Progress'
    elif any(k in t for k in ['render', 'fasad', 'gambar rumah', 'desain', 'design', 'virtual tour', '3d', 'foto lokasi', 'video kawasan']):
        return 'Visuals & 3D Render'
    elif any(k in t for k in ['promo', 'diskon', 'cashback', 'promosi', 'promotion', 'voucher']):
        return 'Promo & Offers'
    elif any(k in t for k in ['maps', 'lokasi', 'location', 'g.page', 'goo.gl']):
        return 'Location & Map'
    elif any(k in t for k in ['wa.me', 'whatsapp', 'hubungi', 'marketing', 'contact', 'konsultasi']):
        return 'Contact'
    elif any(k in t for k in ['instagram', 'facebook', 'tiktok', 'youtube', 'sosmed']):
        return 'Social Media'
    elif any(k in t for k in ['news', 'berita', 'update']):
        return 'News'
    elif any(k in t for k in ['type rumah', 'tipe rumah']):
        return 'Unit Types'
    elif any(k in t for k in ['faq']):
        return 'FAQ'
    else:
        return 'General'

def main():
    main_url = "https://linktr.ee/ciptagroupofficial"
    print(f"[*] Fetching main profile: {main_url} ...")
    main_props = fetch_linktree(main_url)
    
    if not main_props:
        print("[X] Failed to fetch main profile.")
        return

    profile_info = {
        'username': main_props.get('username'),
        'page_title': main_props.get('pageTitle'),
        'description': main_props.get('description'),
        'avatar_url': main_props.get('customAvatar') or (main_props.get('account') or {}).get('profilePictureUrl'),
        'social_links': main_props.get('socialLinks', []),
    }
    print(f"[+] Found profile: {profile_info['page_title']} (@{profile_info['username']})")
    
    raw_links = main_props.get('links', [])
    print(f"[+] Total projects: {len(raw_links)}")
    
    projects_data = []
    all_flattened_links = []
    
    for idx, item in enumerate(raw_links, 1):
        p_title = item.get('title')
        p_url = item.get('url')
        p_thumb = item.get('thumbnail')
        clean_url = p_url.split('?')[0] if p_url else ''
        
        print(f"[{idx}/{len(raw_links)}] Processing: {p_title}")
        
        project_record = {
            'index': idx,
            'project_name': p_title,
            'linktree_url': clean_url,
            'thumbnail': p_thumb,
            'sub_profile_title': None,
            'sub_profile_description': None,
            'sub_social_links': [],
            'sub_links': []
        }
        
        if 'linktr.ee' in clean_url:
            sub_props = fetch_linktree(clean_url)
            if sub_props:
                project_record['sub_profile_title'] = sub_props.get('pageTitle')
                project_record['sub_profile_description'] = sub_props.get('description')
                project_record['sub_social_links'] = [s.get('url') for s in sub_props.get('socialLinks', [])]
                
                for s_item in sub_props.get('links', []):
                    s_title = s_item.get('title')
                    s_url = s_item.get('url')
                    s_type = s_item.get('type')
                    category = categorize_link(s_title, s_url)
                    
                    sub_link_entry = {
                        'title': s_title,
                        'url': s_url,
                        'category': category,
                        'type': s_type
                    }
                    project_record['sub_links'].append(sub_link_entry)
                    
                    all_flattened_links.append({
                        'Project Name': p_title,
                        'Project Linktree': clean_url,
                        'Resource Title': s_title,
                        'Category': category,
                        'Resource URL': s_url,
                    })
        else:
            all_flattened_links.append({
                'Project Name': p_title,
                'Project Linktree': clean_url,
                'Resource Title': 'Direct Link',
                'Category': categorize_link(p_title, clean_url),
                'Resource URL': clean_url,
            })
            
        projects_data.append(project_record)

    # 1. Save Full JSON
    full_output = {
        'profile': profile_info,
        'projects': projects_data
    }
    with open('ciptagroup_complete.json', 'w', encoding='utf-8') as f:
        json.dump(full_output, f, indent=2, ensure_ascii=False)

    # 2. Save Flattened Links CSV
    df_all_links = pd.DataFrame(all_flattened_links)
    df_all_links.to_csv('ciptagroup_all_resources.csv', index=False, encoding='utf-8-sig')

    # 3. Save Projects Overview CSV
    projects_overview = []
    for p in projects_data:
        # Prefer actual google maps link if available
        map_link = next((l['url'] for l in p['sub_links'] if 'maps' in l['url'].lower() or 'goo.gl' in l['url'].lower()), '')
        if not map_link:
            map_link = next((l['url'] for l in p['sub_links'] if l['category'] == 'Location & Map'), '')

        projects_overview.append({
            'No': p['index'],
            'Project Name': p['project_name'],
            'Linktree URL': p['linktree_url'],
            'Page Title': p['sub_profile_title'],
            'Description': p['sub_profile_description'],
            'Total Resources': len(p['sub_links']),
            'Social Links': " | ".join(p['sub_social_links']) if p['sub_social_links'] else '',
            'Pricelist Link': next((l['url'] for l in p['sub_links'] if l['category'] == 'Pricelist'), ''),
            'Brochure Link': next((l['url'] for l in p['sub_links'] if l['category'] == 'Brochure'), ''),
            'Siteplan Link': next((l['url'] for l in p['sub_links'] if 'Siteplan' in l['category']), ''),
            'Promo Link': next((l['url'] for l in p['sub_links'] if 'Promo' in l['category']), ''),
            'Location Map': map_link
        })
    df_projects = pd.DataFrame(projects_overview)
    df_projects.to_csv('ciptagroup_projects_overview.csv', index=False, encoding='utf-8-sig')

    # 4. Save to Excel with multiple sheets
    with pd.ExcelWriter('ciptagroup_data.xlsx', engine='openpyxl') as writer:
        df_projects.to_excel(writer, sheet_name='Projects Overview', index=False)
        df_all_links.to_excel(writer, sheet_name='All Resources & Links', index=False)
        
        # Profile summary sheet
        df_profile = pd.DataFrame([
            {'Field': 'Username', 'Value': profile_info['username']},
            {'Field': 'Page Title', 'Value': profile_info['page_title']},
            {'Field': 'Description', 'Value': profile_info['description'] or '-'},
            {'Field': 'Avatar URL', 'Value': profile_info['avatar_url']},
            {'Field': 'Total Projects', 'Value': len(projects_data)},
            {'Field': 'Total Sub-resources', 'Value': len(all_flattened_links)},
        ])
        df_profile.to_excel(writer, sheet_name='Main Profile', index=False)

    print("\n[✓] Scraping & export completed successfully!")

if __name__ == '__main__':
    main()
