import json
import os
import pandas as pd

# Load projects overview
df_overview = pd.read_csv('ciptagroup_projects_overview.csv')
# Load units price data
df_units = pd.read_csv('data_harga_booking_cicilan.csv')
# Load all resources
df_resources = pd.read_csv('ciptagroup_all_resources.csv')
# Load complete json
with open('ciptagroup_complete.json', 'r', encoding='utf-8') as f:
    complete_data = json.load(f)

projects_list = []

for _, p_row in df_overview.iterrows():
    p_name = p_row['Project Name']
    
    # Filter units for this project
    p_units = df_units[df_units['Proyek'] == p_name].to_dict(orient='records')
    
    # Filter resources for this project
    p_res = df_resources[df_resources['Project Name'] == p_name].to_dict(orient='records')
    
    # Find matching project in complete_data for local thumbnail
    c_proj = next((p for p in complete_data['projects'] if p['project_name'] == p_name), {})
    
    # Determine category
    if any(u['Kategori'] == 'Ruko' for u in p_units):
        cat = 'Ruko'
    elif any(u['Kategori'] == 'Villa' for u in p_units):
        cat = 'Villa'
    else:
        cat = 'Rumah'
        
    prices = [u['Harga Jual (Rp)'] for u in p_units if pd.notna(u['Harga Jual (Rp)'])]
    cicilans = [u['Cicilan Bertahap / Bln (Rp)'] for u in p_units if pd.notna(u['Cicilan Bertahap / Bln (Rp)'])]
    bookings = [u['Booking Fee / UTJ (Rp)'] for u in p_units if pd.notna(u['Booking Fee / UTJ (Rp)'])]
    
    min_price = min(prices) if prices else 0
    max_price = max(prices) if prices else 0
    min_cicilan = min(cicilans) if cicilans else 0
    max_cicilan = max(cicilans) if cicilans else 0
    
    # Format booking fee string
    if bookings:
        unique_b = sorted(list(set(bookings)))
        if len(unique_b) == 1:
            booking_str = f"Rp {unique_b[0]:,.0f}".replace(',', '.')
        else:
            booking_str = f"Rp {min(unique_b):,.0f} - Rp {max(unique_b):,.0f}".replace(',', '.')
    else:
        booking_str = "Rp 3.000.000 - Rp 5.000.000"

    safe_name = p_name.replace(' ', '_').replace('/', '_')
    local_pdf = f"pricelists/{safe_name}.pdf"
    if not os.path.exists(local_pdf):
        local_pdf = None

    proj_obj = {
        "id": int(p_row['No']),
        "name": p_name,
        "category": cat,
        "tagline": p_row['Description'] if pd.notna(p_row['Description']) else "Hunian & Properti Unggulan Cipta Group Batam",
        "linktree_url": p_row['Linktree URL'],
        "thumbnail": c_proj.get('local_thumbnail') or c_proj.get('thumbnail'),
        "online_thumbnail": c_proj.get('thumbnail'),
        "pricelist_link": p_row['Pricelist Link'] if pd.notna(p_row['Pricelist Link']) else None,
        "local_pdf": local_pdf,
        "brochure_link": p_row['Brochure Link'] if pd.notna(p_row['Brochure Link']) else None,
        "siteplan_link": p_row['Siteplan Link'] if pd.notna(p_row['Siteplan Link']) else None,
        "location_map": p_row['Location Map'] if pd.notna(p_row['Location Map']) else None,
        "booking_fee_str": booking_str,
        "min_price": min_price,
        "max_price": max_price,
        "min_cicilan": min_cicilan,
        "max_cicilan": max_cicilan,
        "tenor_str": "60 Bulan (5 Tahun)" if p_name != "Cipta Green Ville" else "60 & 72 Bulan (5 - 6 Tahun)",
        "total_units_recorded": len(p_units),
        "units": p_units,
        "resources": p_res
    }
    projects_list.append(proj_obj)

app_dataset = {
    "company": {
        "name": "Cipta Group Official",
        "tagline": "Mengerti Kebutuhan Anda - Lebih dari 30 Tahun Membangun Batam",
        "experience": "30+ Tahun",
        "city": "Batam, Kepulauan Riau",
        "facebook": "https://www.facebook.com/ciptagroupofficial",
        "instagram": "https://instagram.com/ciptagroupofficial",
        "linktree": "https://linktr.ee/ciptagroupofficial"
    },
    "projects": projects_list
}

# Write JSON
with open('data.json', 'w', encoding='utf-8') as f:
    json.dump(app_dataset, f, indent=2, ensure_ascii=False)

# Write JS file so it can be loaded directly without local file:// CORS restrictions
with open('data.js', 'w', encoding='utf-8') as f:
    f.write("window.CIPTA_DATA = " + json.dumps(app_dataset, indent=2, ensure_ascii=False) + ";\n")

print(f"Generated data.js and data.json with {len(projects_list)} projects.")
