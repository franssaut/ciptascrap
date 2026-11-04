import pypdf

for f in ['Sunny_Bay.pdf', 'Aster_Hills.pdf', 'Buana_Duta_Bandara.pdf', 'Plumeria.pdf', 'Amalfi.pdf']:
    print(f"\n==================== {f} ====================")
    reader = pypdf.PdfReader(f'pricelists/{f}')
    for i, p in enumerate(reader.pages):
        txt = p.extract_text() or ""
        lines = txt.split('\n')
        print(f"--- Page {i+1} ---")
        for l in lines:
            if any(k in l for k in ['Booking', 'UTJ', 'HARGA', 'Harga Jual', 'Cash Bertahap', 'BERTAHAP', 'Cicilan', '60X', '60x', '36/']):
                print(l)
