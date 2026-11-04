import pypdf

files = [
    'Pertokoan_Marina_Central.pdf',
    'Pertokoan_Graha_Namarina.pdf',
    'Gabana.pdf',
    'Villa_Foresta.pdf',
    'Era_Cipta_Square.pdf'
]

for f in files:
    print(f"\n******************** {f} ********************")
    reader = pypdf.PdfReader(f'pricelists/{f}')
    for i, p in enumerate(reader.pages):
        lines = (p.extract_text() or "").split('\n')
        for l in lines:
            # print rows that contain numbers and price-like values
            if any(c.isdigit() for c in l) and any(x in l for x in ['.000', ',000', 'Hook', 'Std', 'STD', 'Ruko', 'Type', 'TYPE', 'UTJ', 'Booking', 'Cash']):
                print(l)
