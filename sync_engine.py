import os
import sys
import json
import time
import datetime
import requests
import re
import pandas as pd
from bs4 import BeautifulSoup

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
}

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATUS_FILE = os.path.join(BASE_DIR, 'sync_status.json')
LOG_FILE = os.path.join(BASE_DIR, 'sync.log')

def log(msg):
    now_str = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    line = f"[{now_str}] {msg}"
    print(line)
    try:
        with open(LOG_FILE, 'a', encoding='utf-8') as f:
            f.write(line + '\n')
    except Exception:
        pass

def update_status(status_str, message, details=None):
    current = {}
    if os.path.exists(STATUS_FILE):
        try:
            with open(STATUS_FILE, 'r', encoding='utf-8') as f:
                current = json.load(f)
        except Exception:
            pass

    current.update({
        'status': status_str,
        'message': message,
        'last_attempt': datetime.datetime.now().isoformat(),
    })
    if status_str == 'success':
        current['last_sync'] = datetime.datetime.now().isoformat()
        current['last_sync_formatted'] = datetime.datetime.now().strftime('%d %b %Y %H:%M:%S')
    if details:
        current.update(details)

    try:
        with open(STATUS_FILE, 'w', encoding='utf-8') as f:
            json.dump(current, f, indent=2, ensure_ascii=False)
    except Exception as e:
        log(f"Gagal menulis {STATUS_FILE}: {e}")

def fetch_linktree(url):
    try:
        clean_url = url.split('?')[0]
        res = requests.get(clean_url, headers=HEADERS, timeout=15)
        if res.status_code != 200:
            log(f"HTTP {res.status_code} untuk {clean_url}")
            return None
        soup = BeautifulSoup(res.text, 'html.parser')
        script = soup.find('script', id='__NEXT_DATA__')
        if not script or not script.string:
            log(f"Tidak ada __NEXT_DATA__ pada {clean_url}")
            return None
        data = json.loads(script.string)
        return data.get('props', {}).get('pageProps', {})
    except Exception as e:
        log(f"Error fetch_linktree {url}: {e}")
        return None

def categorize_link(title, url):
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

def run_sync():
    """Main synchronization workflow."""
    start_time = time.time()
    log("==========================================")
    log("MEMULAI PROSES AUTO SINKRONISASI LINKTREE")
    log("Target: https://linktr.ee/ciptagroupofficial")
    update_status("running", "Sedang mengambil data terbaru dari Linktree Cipta Group...")

    try:
        main_url = "https://linktr.ee/ciptagroupofficial"
        main_props = fetch_linktree(main_url)
        if not main_props:
            update_status("error", "Gagal menghubungi https://linktr.ee/ciptagroupofficial")
            log("[X] Gagal mengambil halaman utama Linktree.")
            return False

        profile_info = {
            'username': main_props.get('username'),
            'page_title': main_props.get('pageTitle'),
            'description': main_props.get('description'),
            'avatar_url': main_props.get('customAvatar') or (main_props.get('account') or {}).get('profilePictureUrl'),
            'social_links': main_props.get('socialLinks', []),
        }

        raw_links = main_props.get('links', [])
        log(f"Ditemukan {len(raw_links)} proyek pada akun @{profile_info['username']}.")

        projects_data = []
        all_flattened_links = []
        os.makedirs(os.path.join(BASE_DIR, 'assets', 'thumbnails'), exist_ok=True)

        for idx, item in enumerate(raw_links, 1):
            p_title = item.get('title')
            p_url = item.get('url')
            p_thumb = item.get('thumbnail')
            clean_url = p_url.split('?')[0] if p_url else ''

            log(f"[{idx}/{len(raw_links)}] Cek proyek: {p_title}")

            # Local thumbnail handling
            local_thumb = None
            if p_thumb:
                safe_name = p_title.replace(' ', '_').replace('/', '_').lower()
                ext = '.jpeg'
                if '.png' in p_thumb.lower(): ext = '.png'
                elif '.webp' in p_thumb.lower(): ext = '.webp'
                local_thumb_path = os.path.join(BASE_DIR, 'assets', 'thumbnails', f"{safe_name}{ext}")
                if not os.path.exists(local_thumb_path):
                    try:
                        r_img = requests.get(p_thumb, headers=HEADERS, timeout=10)
                        if r_img.status_code == 200:
                            with open(local_thumb_path, 'wb') as f_img:
                                f_img.write(r_img.content)
                            local_thumb = f"assets/thumbnails/{safe_name}{ext}"
                    except Exception:
                        pass
                else:
                    local_thumb = f"assets/thumbnails/{safe_name}{ext}"

            project_record = {
                'index': idx,
                'project_name': p_title,
                'linktree_url': clean_url,
                'thumbnail': local_thumb or p_thumb,
                'online_thumbnail': p_thumb,
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
                        project_record['sub_links'].append({
                            'title': s_title,
                            'url': s_url,
                            'category': category,
                            'type': s_type
                        })
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

        # Build overview rows
        projects_overview = []
        for p in projects_data:
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
                'Social Links': ' | '.join(p['sub_social_links']) if p['sub_social_links'] else '',
                'Pricelist Link': next((l['url'] for l in p['sub_links'] if l['category'] == 'Pricelist'), ''),
                'Brochure Link': next((l['url'] for l in p['sub_links'] if l['category'] == 'Brochure'), ''),
                'Siteplan Link': next((l['url'] for l in p['sub_links'] if 'Siteplan' in l['category']), ''),
                'Promo Link': next((l['url'] for l in p['sub_links'] if 'Promo' in l['category']), ''),
                'Location Map': map_link
            })

        df_projects = pd.DataFrame(projects_overview)
        df_projects.to_csv(os.path.join(BASE_DIR, 'ciptagroup_projects_overview.csv'), index=False, encoding='utf-8-sig')

        # Load existing units synchronized database to preserve accurate unit price models
        unit_csv_path = os.path.join(BASE_DIR, 'data_harga_booking_cicilan_lengkap.csv')
        if not os.path.exists(unit_csv_path):
            unit_csv_path = os.path.join(BASE_DIR, 'data_harga_booking_cicilan.csv')

        df_units = pd.read_csv(unit_csv_path)

        # Build app_dataset for web
        projects_web_list = []
        for _, p_row in df_projects.iterrows():
            p_name = p_row['Project Name']
            p_units = df_units[df_units['Proyek'] == p_name].to_dict(orient='records')
            p_res = [r for r in all_flattened_links if r['Project Name'] == p_name]
            c_proj = next((p for p in projects_data if p['project_name'] == p_name), {})

            if any(u.get('Kategori') == 'Ruko' for u in p_units): cat = 'Ruko'
            elif any(u.get('Kategori') == 'Villa' for u in p_units): cat = 'Villa'
            else: cat = 'Rumah'

            prices = [u['Harga Jual (Rp)'] for u in p_units if pd.notna(u.get('Harga Jual (Rp)'))]
            cicilans = [u.get('Cicilan Cash Bertahap / Bln (Rp)', u.get('Cicilan Bertahap / Bln (Rp)')) for u in p_units if pd.notna(u.get('Cicilan Cash Bertahap / Bln (Rp)', u.get('Cicilan Bertahap / Bln (Rp)')))]
            bookings = [u['Booking Fee / UTJ (Rp)'] for u in p_units if pd.notna(u.get('Booking Fee / UTJ (Rp)'))]

            min_price = min(prices) if prices else 0
            max_price = max(prices) if prices else 0
            min_cicilan = min(cicilans) if cicilans else 0
            max_cicilan = max(cicilans) if cicilans else 0

            if bookings:
                unique_b = sorted(list(set(bookings)))
                if len(unique_b) == 1:
                    booking_str = f"Rp {unique_b[0]:,.0f}".replace(',', '.')
                else:
                    booking_str = f"Rp {min(unique_b):,.0f} - Rp {max(unique_b):,.0f}".replace(',', '.')
            else:
                booking_str = "Rp 3.000.000 - Rp 5.000.000"

            proj_obj = {
                "id": int(p_row['No']),
                "name": p_name,
                "category": cat,
                "tagline": p_row['Description'] if pd.notna(p_row['Description']) else "Hunian & Properti Unggulan Cipta Group Batam",
                "linktree_url": p_row['Linktree URL'],
                "thumbnail": c_proj.get('thumbnail'),
                "online_thumbnail": c_proj.get('online_thumbnail'),
                "pricelist_link": p_row['Pricelist Link'] if pd.notna(p_row['Pricelist Link']) else None,
                "brochure_link": p_row['Brochure Link'] if pd.notna(p_row['Brochure Link']) else None,
                "siteplan_link": p_row['Siteplan Link'] if pd.notna(p_row['Siteplan Link']) else None,
                "location_map": p_row['Location Map'] if pd.notna(p_row['Location Map']) else None,
                "booking_fee_str": booking_str,
                "min_price": int(min_price),
                "max_price": int(max_price),
                "min_cicilan": int(min_cicilan),
                "max_cicilan": int(max_cicilan),
                "tenor_str": "60 Bulan (5 Tahun)" if p_name != "Cipta Green Ville" else "60 & 72 Bulan (5 - 6 Tahun)",
                "total_units_recorded": len(p_units),
                "units": p_units,
                "resources": p_res
            }
            projects_web_list.append(proj_obj)

        app_dataset = {
            "company": {
                "name": "Cipta Group Official",
                "tagline": "Mengerti Kebutuhan Anda - Lebih dari 30 Tahun Membangun Batam",
                "city": "Batam, Kepulauan Riau",
                "facebook": "https://www.facebook.com/ciptagroupofficial",
                "instagram": "https://instagram.com/ciptagroupofficial",
                "linktree": "https://linktr.ee/ciptagroupofficial"
            },
            "last_sync": datetime.datetime.now().strftime('%d %b %Y %H:%M:%S'),
            "projects": projects_web_list
        }

        with open(os.path.join(BASE_DIR, 'data.json'), 'w', encoding='utf-8') as f:
            json.dump(app_dataset, f, indent=2, ensure_ascii=False)

        with open(os.path.join(BASE_DIR, 'data.js'), 'w', encoding='utf-8') as f:
            f.write("window.CIPTA_DATA = " + json.dumps(app_dataset, indent=2, ensure_ascii=False) + ";\n")

        elapsed = round(time.time() - start_time, 1)
        log(f"Sinkronisasi selesai dalam {elapsed} detik.")
        update_status("success", f"Sinkronisasi berhasil ({elapsed} detik). 15 proyek & {len(df_units)} unit terdata.", {
            'total_projects': len(projects_web_list),
            'total_units': len(df_units),
            'elapsed_seconds': elapsed
        })
        return True

    except Exception as e:
        log(f"[X] Terjadi error saat sinkronisasi: {e}")
        update_status("error", f"Error sinkronisasi: {str(e)}")
        return False

if __name__ == '__main__':
    run_sync()
