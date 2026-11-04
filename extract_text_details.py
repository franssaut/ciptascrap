import os
import pypdf
import re
import json

def parse_pdf(filename):
    path = os.path.join('pricelists', filename)
    reader = pypdf.PdfReader(path)
    full_text = ""
    for idx, page in enumerate(reader.pages):
        full_text += f"\n--- PAGE {idx+1} ---\n" + (page.extract_text() or "")
    return full_text

# Let's inspect Era Cipta Square, Marina Central, Graha Namarina, Sunny Bay, Aster Hills, Buana Duta Bandara, Gabana, Plumeria
targets = [
    'Era_Cipta_Square.pdf',
    'Pertokoan_Marina_Central.pdf',
    'Pertokoan_Graha_Namarina.pdf',
    'Sunny_Bay.pdf',
    'Aster_Hills.pdf',
    'Buana_Duta_Bandara.pdf',
    'Gabana.pdf',
    'Plumeria.pdf'
]

for t in targets:
    print(f"\n==================== {t} ====================")
    txt = parse_pdf(t)
    for line in txt.split('\n'):
        l = line.strip()
        # Look for booking fee / UTJ
        if any(k in l.lower() for k in ['booking', 'utj', 'tanda jadi', 'cash bertahap', 'bertahap', 'angsuran']):
            print(f"  [KEY] {l}")
        # Look for headers
        elif any(k in l.lower() for k in ['type', 'tipe', 'luas', 'harga', 'blok']):
            if len(l) < 120:
                print(f"  [HDR] {l}")
