import os
import pypdf

text_files = [
    'Amalfi.pdf',
    'Era_Cipta_Square.pdf',
    'Pertokoan_Marina_Central.pdf',
    'Pertokoan_Graha_Namarina.pdf',
    'Sunny_Bay.pdf',
    'Aster_Hills.pdf',
    'Buana_Duta_Bandara.pdf',
    'Gabana.pdf',
    'Plumeria.pdf',
    'Villa_Foresta.pdf'
]

for tf in text_files:
    path = os.path.join('pricelists', tf)
    print(f"==================== {tf} ====================")
    try:
        reader = pypdf.PdfReader(path)
        for i, page in enumerate(reader.pages):
            txt = page.extract_text() or ""
            print(f"--- Page {i+1} ({len(txt)} chars) ---")
            lines = [line.strip() for line in txt.split('\n') if line.strip()]
            for line in lines[:25]:
                print(line)
            if len(lines) > 25:
                print(f"... and {len(lines) - 25} more lines ...")
                # print last lines for notes / booking fee
                print("--- NOTES / FOOTER ---")
                for line in lines[-10:]:
                    print(line)
    except Exception as e:
        print(f"Error reading {tf}: {e}")
