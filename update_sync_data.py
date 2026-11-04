import json
import pandas as pd
import numpy as np

# Load existing data
df = pd.read_csv('data_harga_booking_cicilan.csv')

# Add synchronized DP & Cash Bertahap columns
# For Cash Bertahap:
# Option 1: Standard Cash Bertahap (DP 0%, only Booking Fee at start, remainder divided by Tenor)
df['DP Cash Bertahap'] = '0% (Hanya Booking Fee)'
df['Nominal DP Bertahap (Rp)'] = 0
df['Sisa Pokok Bertahap (Rp)'] = df['Harga Jual (Rp)'] - df['Booking Fee / UTJ (Rp)']
# Check monthly installment: Sisa Pokok / Tenor
df['Cicilan Bertahap / Bln (Rp)'] = np.round(df['Sisa Pokok Bertahap (Rp)'] / df['Tenor (Bulan)']).astype(int)

# For KPR Scheme (comparison):
# Standard DP is 20% (or 5% for Buana Central Park, 25% for Foresta/Bandara)
def get_kpr_dp_pct(proyek):
    if 'Foresta' in proyek or 'Bandara' in proyek:
        return 0.25
    elif 'Central Park' in proyek:
        return 0.05
    elif 'Green Ville' in proyek:
        return 0.10
    else:
        return 0.20

df['Estimasi DP KPR (%)'] = df['Proyek'].apply(lambda p: int(get_kpr_dp_pct(p) * 100))
df['Nominal DP KPR (Rp)'] = (df['Harga Jual (Rp)'] * df['Estimasi DP KPR (%)'] / 100).astype(int)
df['Sisa DP KPR Dibayar (Rp)'] = df['Nominal DP KPR (Rp)'] - df['Booking Fee / UTJ (Rp)']
# DP installment duration (usually 15x or 24x)
df['Tenor Cicilan DP (Bln)'] = 15
df['Cicilan DP KPR / Bln (Rp)'] = np.round(df['Sisa DP KPR Dibayar (Rp)'] / df['Tenor Cicilan DP (Bln)']).astype(int)
df['Plafon KPR Bank (Rp)'] = df['Harga Jual (Rp)'] - df['Nominal DP KPR (Rp)']

# Save updated CSV
df.to_csv('data_harga_booking_cicilan.csv', index=False, encoding='utf-8-sig')

# Save updated Excel
with pd.ExcelWriter('data_harga_booking_cicilan.xlsx', engine='openpyxl') as writer:
    df.to_excel(writer, sheet_name='Harga, DP & Cicilan', index=False)

print(f"Updated CSV and Excel with synchronized DP & Cash Bertahap ({len(df)} rows).")
print(df[['Proyek', 'Tipe Unit', 'Harga Jual (Rp)', 'Booking Fee / UTJ (Rp)', 'Sisa Pokok Bertahap (Rp)', 'Cicilan Bertahap / Bln (Rp)', 'Nominal DP KPR (Rp)']].head(10).to_string())
