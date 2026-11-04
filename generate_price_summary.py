import pandas as pd

records = [
    # 1. Aster Tropika
    {"Proyek": "Aster Tropika", "Kategori": "Rumah", "Tipe Unit": "Type 30/60", "Posisi": "Standar", "LB": 30, "LT": 60, "Harga Jual (Rp)": 295000000, "Booking Fee / UTJ (Rp)": 3000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 4866667, "Catatan": "Angsuran ke-1 dilakukan 2 minggu setelah UTJ"},
    {"Proyek": "Aster Tropika", "Kategori": "Rumah", "Tipe Unit": "Type 36+/72", "Posisi": "Standar", "LB": 36, "LT": 72, "Harga Jual (Rp)": 485000000, "Booking Fee / UTJ (Rp)": 3000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 8033333, "Catatan": "Blok D"},
    {"Proyek": "Aster Tropika", "Kategori": "Rumah", "Tipe Unit": "Type 36+/72", "Posisi": "Standar", "LB": 36, "LT": 72, "Harga Jual (Rp)": 500000000, "Booking Fee / UTJ (Rp)": 3000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 8283333, "Catatan": "Blok F (Ready Juni 2029)"},
    {"Proyek": "Aster Tropika", "Kategori": "Rumah", "Tipe Unit": "Type 36+/96.34", "Posisi": "Hook", "LB": 36, "LT": 96.34, "Harga Jual (Rp)": 598020000, "Booking Fee / UTJ (Rp)": 3000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 9917000, "Catatan": "Blok F No. 12"},
    {"Proyek": "Aster Tropika", "Kategori": "Rumah", "Tipe Unit": "Type 36+/139.62", "Posisi": "Hook", "LB": 36, "LT": 139.62, "Harga Jual (Rp)": 727860000, "Booking Fee / UTJ (Rp)": 3000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 12081000, "Catatan": "Blok F No. 1"},

    # 2. Amalfi
    {"Proyek": "Amalfi", "Kategori": "Rumah", "Tipe Unit": "Type 30/66", "Posisi": "Standar", "LB": 30, "LT": 66, "Harga Jual (Rp)": 290000000, "Booking Fee / UTJ (Rp)": 2000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 4800000, "Catatan": "Bisa Cash Bertahap 60x"},
    {"Proyek": "Amalfi", "Kategori": "Rumah", "Tipe Unit": "Type 30/82.5", "Posisi": "Hook", "LB": 30, "LT": 82.5, "Harga Jual (Rp)": 350000000, "Booking Fee / UTJ (Rp)": 3000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 5783333, "Catatan": "Bisa Cash Bertahap 60x"},
    {"Proyek": "Amalfi", "Kategori": "Rumah", "Tipe Unit": "Type 36/72", "Posisi": "Standar", "LB": 36, "LT": 72, "Harga Jual (Rp)": 310000000, "Booking Fee / UTJ (Rp)": 2000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 5133333, "Catatan": "Blok B5"},
    {"Proyek": "Amalfi", "Kategori": "Rumah", "Tipe Unit": "Type 36/72", "Posisi": "Standar", "LB": 36, "LT": 72, "Harga Jual (Rp)": 350000000, "Booking Fee / UTJ (Rp)": 2000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 5800000, "Catatan": "Blok A4"},
    {"Proyek": "Amalfi", "Kategori": "Rumah", "Tipe Unit": "Type 36/96", "Posisi": "Hook", "LB": 36, "LT": 96, "Harga Jual (Rp)": 401500000, "Booking Fee / UTJ (Rp)": 3000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 6641667, "Catatan": "Blok B5 Hook"},
    {"Proyek": "Amalfi", "Kategori": "Rumah", "Tipe Unit": "Type 36/96", "Posisi": "Hook", "LB": 36, "LT": 96, "Harga Jual (Rp)": 495000000, "Booking Fee / UTJ (Rp)": 3000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 8200000, "Catatan": "Blok A4 Hook"},

    # 3. Era Cipta Square
    {"Proyek": "Era Cipta Square", "Kategori": "Ruko", "Tipe Unit": "Ruko 2 Lantai 107.5/68.75", "Posisi": "Standar", "LB": 107.5, "LT": 68.75, "Harga Jual (Rp)": 892500000, "Booking Fee / UTJ (Rp)": 5000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 14791667, "Catatan": "Blok B1 No. 20-28"},
    {"Proyek": "Era Cipta Square", "Kategori": "Ruko", "Tipe Unit": "Ruko 2 Lantai 96.75/61.88", "Posisi": "Standar", "LB": 96.75, "LT": 61.88, "Harga Jual (Rp)": 918750000, "Booking Fee / UTJ (Rp)": 5000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 15229167, "Catatan": "Blok B1 No. 16"},
    {"Proyek": "Era Cipta Square", "Kategori": "Ruko", "Tipe Unit": "Ruko 2 Lantai 107.5/68.75", "Posisi": "Standar", "LB": 107.5, "LT": 68.75, "Harga Jual (Rp)": 945000000, "Booking Fee / UTJ (Rp)": 5000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 15666667, "Catatan": "Blok A1 No. 12A-12B / B1 No. 11-15"},
    {"Proyek": "Era Cipta Square", "Kategori": "Ruko", "Tipe Unit": "Ruko 2 Lantai 107.5/68.75", "Posisi": "Standar", "LB": 107.5, "LT": 68.75, "Harga Jual (Rp)": 997500000, "Booking Fee / UTJ (Rp)": 5000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 16541667, "Catatan": "Blok B1 No. 7-10"},
    {"Proyek": "Era Cipta Square", "Kategori": "Ruko", "Tipe Unit": "Ruko 2 Lantai 119/89.38", "Posisi": "Hook", "LB": 119.0, "LT": 89.38, "Harga Jual (Rp)": 1260000000, "Booking Fee / UTJ (Rp)": 10000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 20833333, "Catatan": "Blok B1 No. 29"},
    {"Proyek": "Era Cipta Square", "Kategori": "Ruko", "Tipe Unit": "Ruko 2 Lantai 119/89.38", "Posisi": "Hook", "LB": 119.0, "LT": 89.38, "Harga Jual (Rp)": 1365000000, "Booking Fee / UTJ (Rp)": 10000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 22583333, "Catatan": "Blok B1 No. 6"},

    # 4. Pertokoan Marina Central
    {"Proyek": "Pertokoan Marina Central", "Kategori": "Ruko", "Tipe Unit": "Ruko (5x12) LB 112.5", "Posisi": "Standar", "LB": 112.5, "LT": 60.0, "Harga Jual (Rp)": 910000000, "Booking Fee / UTJ (Rp)": 10000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 15000000, "Catatan": "Unit 2, 3, 3a, 5"},
    {"Proyek": "Pertokoan Marina Central", "Kategori": "Ruko", "Tipe Unit": "Ruko (5x12) LB 112.5", "Posisi": "Hook", "LB": 112.5, "LT": 60.0, "Harga Jual (Rp)": 1010000000, "Booking Fee / UTJ (Rp)": 10000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 16666667, "Catatan": "Unit 1, 12a"},

    # 5. Pertokoan Graha Namarina
    {"Proyek": "Pertokoan Graha Namarina", "Kategori": "Ruko", "Tipe Unit": "Ruko Blok A (5x15) LB 107.5", "Posisi": "Standar", "LB": 107.5, "LT": 75.0, "Harga Jual (Rp)": 910000000, "Booking Fee / UTJ (Rp)": 10000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 15000000, "Catatan": "Blok A Standar"},
    {"Proyek": "Pertokoan Graha Namarina", "Kategori": "Ruko", "Tipe Unit": "Ruko Blok B (5x15) LB 107.5", "Posisi": "Standar", "LB": 107.5, "LT": 75.0, "Harga Jual (Rp)": 950000000, "Booking Fee / UTJ (Rp)": 10000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 15666667, "Catatan": "Blok B No. 6"},

    # 6. Sunny Bay
    {"Proyek": "Sunny Bay", "Kategori": "Rumah", "Tipe Unit": "Type 36/66", "Posisi": "Standar", "LB": 36, "LT": 66, "Harga Jual (Rp)": 300000000, "Booking Fee / UTJ (Rp)": 2000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 4966667, "Catatan": "Blok C1, C2, D1, D2"},
    {"Proyek": "Sunny Bay", "Kategori": "Rumah", "Tipe Unit": "Type 36/66", "Posisi": "Standar", "LB": 36, "LT": 66, "Harga Jual (Rp)": 325000000, "Booking Fee / UTJ (Rp)": 2000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 5383333, "Catatan": "Blok C2, C3"},
    {"Proyek": "Sunny Bay", "Kategori": "Rumah", "Tipe Unit": "Type 36/82.5", "Posisi": "Hook", "LB": 36, "LT": 82.5, "Harga Jual (Rp)": 366500000, "Booking Fee / UTJ (Rp)": 3000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 6058333, "Catatan": "Blok D2"},
    {"Proyek": "Sunny Bay", "Kategori": "Rumah", "Tipe Unit": "Type 36/98", "Posisi": "Hook", "LB": 36, "LT": 98, "Harga Jual (Rp)": 412000000, "Booking Fee / UTJ (Rp)": 3000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 6816667, "Catatan": "Blok C2, C3 Hook"},

    # 7. Aster Garden
    {"Proyek": "Aster Garden", "Kategori": "Rumah", "Tipe Unit": "Type 36/72", "Posisi": "Standar", "LB": 36, "LT": 72, "Harga Jual (Rp)": 400000000, "Booking Fee / UTJ (Rp)": 5000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 6583333, "Catatan": "Blok A (Unit 52-59)"},
    {"Proyek": "Aster Garden", "Kategori": "Rumah", "Tipe Unit": "Type 36/96", "Posisi": "Hook", "LB": 36, "LT": 96, "Harga Jual (Rp)": 504000000, "Booking Fee / UTJ (Rp)": 5000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 8316667, "Catatan": "Blok A (51,60) & C (31,10)"},

    # 8. Aster Hills
    {"Proyek": "Aster Hills", "Kategori": "Rumah", "Tipe Unit": "Type 36/66", "Posisi": "Standar", "LB": 36, "LT": 66, "Harga Jual (Rp)": 290000000, "Booking Fee / UTJ (Rp)": 2000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 4800000, "Catatan": "Cash Bertahap Tanpa Bunga 60X"},
    {"Proyek": "Aster Hills", "Kategori": "Rumah", "Tipe Unit": "Type 36/82.5", "Posisi": "Hook", "LB": 36, "LT": 82.5, "Harga Jual (Rp)": 350000000, "Booking Fee / UTJ (Rp)": 3000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 5783333, "Catatan": "Cash Bertahap Tanpa Bunga 60X"},

    # 9. Buana Central Park
    {"Proyek": "Buana Central Park", "Kategori": "Rumah", "Tipe Unit": "Miniapolis 36/72", "Posisi": "Standar", "LB": 36, "LT": 72, "Harga Jual (Rp)": 543600000, "Booking Fee / UTJ (Rp)": 5000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 8976667, "Catatan": "Unit 32, 150, 153a, 158, 161"},
    {"Proyek": "Buana Central Park", "Kategori": "Rumah", "Tipe Unit": "Miniapolis 36/96", "Posisi": "Hook", "LB": 36, "LT": 96, "Harga Jual (Rp)": 690000000, "Booking Fee / UTJ (Rp)": 5000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 11416667, "Catatan": "Unit 155"},
    {"Proyek": "Buana Central Park", "Kategori": "Rumah", "Tipe Unit": "Cordoba 36+/72", "Posisi": "Standar", "LB": 36, "LT": 72, "Harga Jual (Rp)": 624000000, "Booking Fee / UTJ (Rp)": 5000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 10316667, "Catatan": "Unit 146-153"},
    {"Proyek": "Buana Central Park", "Kategori": "Rumah", "Tipe Unit": "Cordoba 36+/134.48", "Posisi": "Hook", "LB": 36, "LT": 134.48, "Harga Jual (Rp)": 908928000, "Booking Fee / UTJ (Rp)": 5000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 15065467, "Catatan": "Unit 142"},
    {"Proyek": "Buana Central Park", "Kategori": "Rumah", "Tipe Unit": "Toscana 48/84", "Posisi": "Standar", "LB": 48, "LT": 84, "Harga Jual (Rp)": 626102400, "Booking Fee / UTJ (Rp)": 5000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 10351707, "Catatan": "Unit 67"},
    {"Proyek": "Buana Central Park", "Kategori": "Rumah", "Tipe Unit": "Toscana 48+/84", "Posisi": "Standar", "LB": 48, "LT": 84, "Harga Jual (Rp)": 711700000, "Booking Fee / UTJ (Rp)": 5000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 11778333, "Catatan": "Unit 31-37"},
    {"Proyek": "Buana Central Park", "Kategori": "Rumah", "Tipe Unit": "Athena 58/105", "Posisi": "Standar", "LB": 58, "LT": 105, "Harga Jual (Rp)": 876000000, "Booking Fee / UTJ (Rp)": 5000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 14516667, "Catatan": "Unit 5, 11"},
    {"Proyek": "Buana Central Park", "Kategori": "Rumah", "Tipe Unit": "Athena 58/135", "Posisi": "Hook", "LB": 58, "LT": 135, "Harga Jual (Rp)": 1056000000, "Booking Fee / UTJ (Rp)": 5000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 17516667, "Catatan": "Unit 6"},
    {"Proyek": "Buana Central Park", "Kategori": "Rumah", "Tipe Unit": "Atlantis 88/180", "Posisi": "Couple", "LB": 88, "LT": 180, "Harga Jual (Rp)": 1580400000, "Booking Fee / UTJ (Rp)": 5000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 26256667, "Catatan": "Unit 100-107"},
    {"Proyek": "Buana Central Park", "Kategori": "Rumah", "Tipe Unit": "Emerald 36/72", "Posisi": "Standar", "LB": 36, "LT": 72, "Harga Jual (Rp)": 570000000, "Booking Fee / UTJ (Rp)": 5000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 9416667, "Catatan": "Emerald Standar"},

    # 10. Buana Duta Bandara
    {"Proyek": "Buana Duta Bandara", "Kategori": "Ruko", "Tipe Unit": "Ruko 2 Lantai 90/56", "Posisi": "Standar", "LB": 90, "LT": 56, "Harga Jual (Rp)": 700000000, "Booking Fee / UTJ (Rp)": 10000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 11500000, "Catatan": "Blok C No. 32-41 (LTD 4x10, LT2 4x12.5)"},
    {"Proyek": "Buana Duta Bandara", "Kategori": "Ruko", "Tipe Unit": "Ruko 2 Lantai 90/64.8", "Posisi": "Hook", "LB": 90, "LT": 64.8, "Harga Jual (Rp)": 758000000, "Booking Fee / UTJ (Rp)": 10000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 12466667, "Catatan": "Blok C No. 31 Hook Tengah"},
    {"Proyek": "Buana Duta Bandara", "Kategori": "Ruko", "Tipe Unit": "Ruko 2 Lantai 90/56", "Posisi": "Hook", "LB": 90, "LT": 56, "Harga Jual (Rp)": 775000000, "Booking Fee / UTJ (Rp)": 10000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 12750000, "Catatan": "Blok C No. 42 Hook Jalan"},
    {"Proyek": "Buana Duta Bandara", "Kategori": "Ruko", "Tipe Unit": "Ruko 3 Lantai 175/70", "Posisi": "Standar", "LB": 175, "LT": 70, "Harga Jual (Rp)": 1290000000, "Booking Fee / UTJ (Rp)": 10000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 21333333, "Catatan": "Blok C No. 23-29 (3 Lantai)"},
    {"Proyek": "Buana Duta Bandara", "Kategori": "Ruko", "Tipe Unit": "Ruko 3 Lantai 175/78.8", "Posisi": "Hook", "LB": 175, "LT": 78.8, "Harga Jual (Rp)": 1348000000, "Booking Fee / UTJ (Rp)": 10000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 22300000, "Catatan": "Blok C No. 30 Hook Tengah"},
    {"Proyek": "Buana Duta Bandara", "Kategori": "Ruko", "Tipe Unit": "Ruko 3 Lantai 175/70", "Posisi": "Hook", "LB": 175, "LT": 70, "Harga Jual (Rp)": 1365000000, "Booking Fee / UTJ (Rp)": 10000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 22583333, "Catatan": "Blok C No. 22 Hook Jalan"},

    # 11. Cipta Green Ville
    {"Proyek": "Cipta Green Ville", "Kategori": "Rumah", "Tipe Unit": "Meteora 48/98", "Posisi": "Standar", "LB": 48, "LT": 98, "Harga Jual (Rp)": 625800000, "Booking Fee / UTJ (Rp)": 5000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 10346667, "Catatan": "Opsi 72x: Rp 9.143.722/bln"},
    {"Proyek": "Cipta Green Ville", "Kategori": "Rumah", "Tipe Unit": "Meteora 48/189", "Posisi": "Hook", "LB": 48, "LT": 189, "Harga Jual (Rp)": 964950000, "Booking Fee / UTJ (Rp)": 5000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 15999167, "Catatan": "Opsi 72x: Rp 14.136.764/bln"},
    {"Proyek": "Cipta Green Ville", "Kategori": "Rumah", "Tipe Unit": "Aurora 48/98", "Posisi": "Standar", "LB": 48, "LT": 98, "Harga Jual (Rp)": 596000000, "Booking Fee / UTJ (Rp)": 5000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 9850000, "Catatan": "Opsi 72x: Rp 8.705.000/bln"},
    {"Proyek": "Cipta Green Ville", "Kategori": "Rumah", "Tipe Unit": "Pinnata 48/105", "Posisi": "Standar", "LB": 48, "LT": 105, "Harga Jual (Rp)": 617000000, "Booking Fee / UTJ (Rp)": 5000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 10200000, "Catatan": "Opsi 72x: Rp 9.014.167/bln"},
    {"Proyek": "Cipta Green Ville", "Kategori": "Rumah", "Tipe Unit": "Victoria 58/98", "Posisi": "Standar", "LB": 58, "LT": 98, "Harga Jual (Rp)": 686000000, "Booking Fee / UTJ (Rp)": 5000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 11350000, "Catatan": "Opsi 72x: Rp 10.030.000/bln"},
    {"Proyek": "Cipta Green Ville", "Kategori": "Rumah", "Tipe Unit": "Caribean 58/105", "Posisi": "Standar", "LB": 58, "LT": 105, "Harga Jual (Rp)": 720300000, "Booking Fee / UTJ (Rp)": 5000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 11921667, "Catatan": "Opsi 72x: Rp 10.534.972/bln"},
    {"Proyek": "Cipta Green Ville", "Kategori": "Rumah", "Tipe Unit": "Caribean 68/105", "Posisi": "Standar", "LB": 68, "LT": 105, "Harga Jual (Rp)": 786450000, "Booking Fee / UTJ (Rp)": 10000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 12940833, "Catatan": "Opsi 72x: Rp 11.439.403/bln"},
    {"Proyek": "Cipta Green Ville", "Kategori": "Rumah", "Tipe Unit": "Canyon 106/150 (2 Lt)", "Posisi": "Couple", "LB": 106, "LT": 150, "Harga Jual (Rp)": 1297800000, "Booking Fee / UTJ (Rp)": 10000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 21463333, "Catatan": "Opsi 72x: Rp 18.967.611/bln"},
    {"Proyek": "Cipta Green Ville", "Kategori": "Rumah", "Tipe Unit": "Mandeville 138/105 (2 Lt)", "Posisi": "Standar", "LB": 138, "LT": 105, "Harga Jual (Rp)": 1512000000, "Booking Fee / UTJ (Rp)": 10000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 25033333, "Catatan": "Opsi 72x: Rp 22.121.111/bln"},

    # 12. Cipta Village Marina
    {"Proyek": "Cipta Village Marina", "Kategori": "Rumah", "Tipe Unit": "Type 28/60", "Posisi": "Standar", "LB": 28, "LT": 60, "Harga Jual (Rp)": 270000000, "Booking Fee / UTJ (Rp)": 2000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 4466667, "Catatan": "Blok 63-65"},
    {"Proyek": "Cipta Village Marina", "Kategori": "Rumah", "Tipe Unit": "Type 28/60", "Posisi": "Standar", "LB": 28, "LT": 60, "Harga Jual (Rp)": 280000000, "Booking Fee / UTJ (Rp)": 2000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 4633333, "Catatan": "Blok 68-70"},
    {"Proyek": "Cipta Village Marina", "Kategori": "Rumah", "Tipe Unit": "Type 28/90", "Posisi": "Hook", "LB": 28, "LT": 90, "Harga Jual (Rp)": 357500000, "Booking Fee / UTJ (Rp)": 3000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 5908333, "Catatan": "Blok 62, 66"},
    {"Proyek": "Cipta Village Marina", "Kategori": "Rumah", "Tipe Unit": "Type 28/90", "Posisi": "Hook", "LB": 28, "LT": 90, "Harga Jual (Rp)": 367500000, "Booking Fee / UTJ (Rp)": 3000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 6075000, "Catatan": "Blok 67, 71"},

    # 13. Gabana
    {"Proyek": "Gabana", "Kategori": "Rumah", "Tipe Unit": "Type 60+/133", "Posisi": "Couple", "LB": 60, "LT": 133, "Harga Jual (Rp)": 960000000, "Booking Fee / UTJ (Rp)": 10000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 15833333, "Catatan": "Unit 16, Angsuran 1 dilakukan 2 minggu setelah UTJ"},

    # 14. Plumeria
    {"Proyek": "Plumeria", "Kategori": "Rumah", "Tipe Unit": "Type 36/66", "Posisi": "Standar", "LB": 36, "LT": 66, "Harga Jual (Rp)": 310000000, "Booking Fee / UTJ (Rp)": 2000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 5133333, "Catatan": "Cash Bertahap 60x"},
    {"Proyek": "Plumeria", "Kategori": "Rumah", "Tipe Unit": "Type 36/88", "Posisi": "Hook", "LB": 36, "LT": 88, "Harga Jual (Rp)": 380000000, "Booking Fee / UTJ (Rp)": 3000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 6283333, "Catatan": "Cash Bertahap 60x"},
    {"Proyek": "Plumeria", "Kategori": "Rumah", "Tipe Unit": "Type 40/105", "Posisi": "Standar", "LB": 40, "LT": 105, "Harga Jual (Rp)": 460000000, "Booking Fee / UTJ (Rp)": 2500000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 7625000, "Catatan": "Cash Bertahap 60x"},

    # 15. Villa Foresta
    {"Proyek": "Villa Foresta", "Kategori": "Villa", "Tipe Unit": "Type 75/140", "Posisi": "Couple", "LB": 75, "LT": 140, "Harga Jual (Rp)": 990000000, "Booking Fee / UTJ (Rp)": 10000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 16333333, "Catatan": "No. Unit 10"},
    {"Proyek": "Villa Foresta", "Kategori": "Villa", "Tipe Unit": "Type 75/180", "Posisi": "Couple", "LB": 75, "LT": 180, "Harga Jual (Rp)": 1350000000, "Booking Fee / UTJ (Rp)": 10000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 22333333, "Catatan": "No. Unit 12b"},
    {"Proyek": "Villa Foresta", "Kategori": "Villa", "Tipe Unit": "Type 93/171", "Posisi": "Couple", "LB": 93, "LT": 171, "Harga Jual (Rp)": 1500000000, "Booking Fee / UTJ (Rp)": 10000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 24833333, "Catatan": "No. Unit 2, 3, 3a, 5"},
    {"Proyek": "Villa Foresta", "Kategori": "Villa", "Tipe Unit": "Type 93/209", "Posisi": "Single", "LB": 93, "LT": 209, "Harga Jual (Rp)": 1752000000, "Booking Fee / UTJ (Rp)": 10000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 29033333, "Catatan": "No. Unit 1, 6"},
    {"Proyek": "Villa Foresta", "Kategori": "Villa", "Tipe Unit": "Type 150/171", "Posisi": "Single", "LB": 150, "LT": 171, "Harga Jual (Rp)": 2300000000, "Booking Fee / UTJ (Rp)": 10000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 38166667, "Catatan": "No. Unit 2, 3"},
    {"Proyek": "Villa Foresta", "Kategori": "Villa", "Tipe Unit": "Type 150/209", "Posisi": "Single", "LB": 150, "LT": 209, "Harga Jual (Rp)": 2602000000, "Booking Fee / UTJ (Rp)": 10000000, "Tenor (Bulan)": 60, "Cicilan Bertahap / Bln (Rp)": 43200000, "Catatan": "No. Unit 1"}
]

df = pd.DataFrame(records)

# Export to CSV
csv_file = 'data_harga_booking_cicilan.csv'
df.to_csv(csv_file, index=False, encoding='utf-8-sig')

# Export to Excel
xlsx_file = 'data_harga_booking_cicilan.xlsx'
with pd.ExcelWriter(xlsx_file, engine='openpyxl') as writer:
    df.to_excel(writer, sheet_name='Booking & Cash Bertahap', index=False)

print(f"Exported {len(df)} records to {csv_file} and {xlsx_file}")
