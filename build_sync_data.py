import json
import pandas as pd
import numpy as np

# Load CSV
try:
    df_units = pd.read_csv('data_harga_booking_cicilan.csv')
except Exception:
    df_units = pd.read_csv('data_harga_booking_cicilan_backup.csv')

# Build synchronized columns
def get_kpr_dp_pct(proyek):
    if 'Foresta' in str(proyek) or 'Bandara' in str(proyek):
        return 0.25
    elif 'Central Park' in str(proyek):
        return 0.05
    elif 'Green Ville' in str(proyek):
        return 0.10
    else:
        return 0.20

records = []
for _, r in df_units.iterrows():
    p = float(r['Harga Jual (Rp)'])
    b = float(r['Booking Fee / UTJ (Rp)'])
    t = int(r['Tenor (Bulan)'])
    
    # 1. Cash Bertahap (Tanpa DP - Murni)
    sisa_bertahap = p - b
    cicilan_bertahap = round(sisa_bertahap / t)
    
    # 2. Cash Bertahap (Dengan DP 20% Contoh)
    dp_20_nominal = p * 0.20
    sisa_pokok_dp20 = p - dp_20_nominal
    cicilan_dp20 = round(sisa_pokok_dp20 / t)
    
    # 3. KPR Bank
    kpr_dp_pct = get_kpr_dp_pct(r['Proyek'])
    kpr_dp_nominal = round(p * kpr_dp_pct)
    sisa_dp_kpr = max(0, kpr_dp_nominal - b)
    tenor_cicil_dp = 15
    cicilan_dp_kpr_bln = round(sisa_dp_kpr / tenor_cicil_dp)
    plafon_kpr = p - kpr_dp_nominal
    
    rec = {
        'Proyek': r['Proyek'],
        'Kategori': r['Kategori'],
        'Tipe Unit': r['Tipe Unit'],
        'Posisi': r.get('Posisi', 'Standar'),
        'LB': r.get('LB'),
        'LT': r.get('LT'),
        'Harga Jual (Rp)': int(p),
        'Booking Fee / UTJ (Rp)': int(b),
        
        # Cash Bertahap (Tanpa DP)
        'Tenor Bertahap (Bulan)': t,
        'DP Cash Bertahap (Rp)': 0,
        'Sisa Pokok Bertahap (Rp)': int(sisa_bertahap),
        'Cicilan Cash Bertahap / Bln (Rp)': int(cicilan_bertahap),
        
        # KPR Bank
        'DP KPR (%)': int(kpr_dp_pct * 100),
        'Nominal DP KPR (Rp)': int(kpr_dp_nominal),
        'Sisa DP KPR setelah UTJ (Rp)': int(sisa_dp_kpr),
        'Tenor Cicilan DP (Bln)': tenor_cicil_dp,
        'Cicilan DP KPR / Bln (Rp)': int(cicilan_dp_kpr_bln),
        'Plafon KPR (Rp)': int(plafon_kpr),
        
        'Catatan': r.get('Catatan', '')
    }
    records.append(rec)

df_sync = pd.DataFrame(records)

# Try saving to data_harga_booking_cicilan_lengkap.xlsx
xlsx_out = 'data_harga_booking_cicilan_lengkap.xlsx'
csv_out = 'data_harga_booking_cicilan_lengkap.csv'
df_sync.to_excel(xlsx_out, sheet_name='Harga DP & Cicilan Sinkron', index=False)
df_sync.to_csv(csv_out, index=False, encoding='utf-8-sig')

# Also try writing to original if not locked
try:
    df_sync.to_csv('data_harga_booking_cicilan.csv', index=False, encoding='utf-8-sig')
    df_sync.to_excel('data_harga_booking_cicilan.xlsx', index=False)
    print("Also successfully updated original data_harga_booking_cicilan.csv/.xlsx")
except Exception as e:
    print(f"Original file is locked by Excel: {e} (saved to {csv_out} instead)")

# Now rebuild data.js and data.json
with open('data.json', 'r', encoding='utf-8') as f:
    app_data = json.load(f)

for proj in app_data['projects']:
    p_name = proj['name']
    proj_units = [r for r in records if r['Proyek'] == p_name]
    proj['units'] = proj_units
    
    # Update min/max cicilan to match exact formula
    cicilans = [u['Cicilan Cash Bertahap / Bln (Rp)'] for u in proj_units]
    if cicilans:
        proj['min_cicilan'] = min(cicilans)
        proj['max_cicilan'] = max(cicilans)

with open('data.json', 'w', encoding='utf-8') as f:
    json.dump(app_data, f, indent=2, ensure_ascii=False)

with open('data.js', 'w', encoding='utf-8') as f:
    f.write("window.CIPTA_DATA = " + json.dumps(app_data, indent=2, ensure_ascii=False) + ";\n")

print("Successfully regenerated data.js and data.json with synchronized DP and Cash Bertahap.")
