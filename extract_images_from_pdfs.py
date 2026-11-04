import os
import pypdf

os.makedirs('pdf_images', exist_ok=True)

image_pdfs = [
    'Aster_Garden.pdf',
    'Cipta_Green_Ville.pdf',
    'Cipta_Village_Marina.pdf',
    'Buana_Central_Park.pdf'
]

extracted = []
for ipdf in image_pdfs:
    path = os.path.join('pricelists', ipdf)
    reader = pypdf.PdfReader(path)
    base = ipdf.replace('.pdf', '')
    print(f"[*] Processing {ipdf} ({len(reader.pages)} pages)...")
    for p_idx, page in enumerate(reader.pages):
        for img_idx, img in enumerate(page.images):
            img_filename = f"{base}_p{p_idx+1}_{img_idx+1}_{img.name}"
            img_path = os.path.join('pdf_images', img_filename)
            with open(img_path, 'wb') as f:
                f.write(img.data)
            print(f"    Saved {img_path} ({len(img.data)} bytes)")
            extracted.append(img_path)

print("Total extracted images:", len(extracted))
