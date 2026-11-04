const fs = require('fs');
const path = require('path');

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': '*/*',
  'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
};

const IS_VERCEL = !!process.env.VERCEL;
const BASE_DIR = __dirname;
const WRITABLE_DIR = IS_VERCEL ? '/tmp' : BASE_DIR;

const STATUS_FILE = path.join(WRITABLE_DIR, 'sync_status.json');
const LOG_FILE = path.join(WRITABLE_DIR, 'sync.log');
const THUMB_DIR = path.join(WRITABLE_DIR, 'assets', 'thumbnails');

function log(msg) {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const line = `[${now}] [Node.js] ${msg}`;
  console.log(line);
  try {
    fs.appendFileSync(LOG_FILE, line + '\n', 'utf-8');
  } catch (err) {}
}

function updateStatus(status, message, details = {}) {
  let current = {};
  if (fs.existsSync(STATUS_FILE)) {
    try {
      current = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf-8'));
    } catch (e) {}
  } else if (fs.existsSync(path.join(BASE_DIR, 'sync_status.json'))) {
    try {
      current = JSON.parse(fs.readFileSync(path.join(BASE_DIR, 'sync_status.json'), 'utf-8'));
    } catch (e) {}
  }

  const now = new Date();
  const formatted = now.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }) + ' ' + now.toTimeString().substring(0, 8);

  const updated = {
    ...current,
    status,
    message,
    last_attempt: now.toISOString(),
    engine: 'Node.js v' + process.versions.node + (IS_VERCEL ? ' (Vercel Serverless)' : ''),
    ...details
  };

  if (status === 'success') {
    updated.last_sync = now.toISOString();
    updated.last_sync_formatted = formatted;
  }

  try {
    fs.writeFileSync(STATUS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (err) {
    log(`Gagal menulis status: ${err.message}`);
  }
  return updated;
}

async function fetchLinktreePage(url) {
  try {
    const cleanUrl = url.split('?')[0];
    const res = await fetch(cleanUrl, { headers: HEADERS });
    if (!res.ok) {
      log(`HTTP ${res.status} ${res.statusText} untuk ${cleanUrl}`);
      return null;
    }
    const html = await res.text();
    const match = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
    if (!match) {
      log(`Tidak ada __NEXT_DATA__ pada ${cleanUrl}`);
      return null;
    }
    const data = JSON.parse(match[1]);
    return data?.props?.pageProps || null;
  } catch (err) {
    log(`Error fetchLinktreePage ${url}: ${err.message}`);
    return null;
  }
}

function categorizeLink(title = '', url = '') {
  const t = title.toLowerCase().trim();
  const u = url.toLowerCase().trim();

  if (['price', 'harga', 'price list', 'pricelist', 'biaya'].some(k => t.includes(k))) {
    return 'Pricelist';
  } else if (['brosur', 'brochure', 'flyer', 'katalog', 'leaflet', 'detail rumah', 'informasi detail'].some(k => t.includes(k))) {
    return 'Brochure';
  } else if (['siteplan', 'site plan', 'masterplan', 'master plan', 'denah', 'floor plan', 'floorplan'].some(k => t.includes(k))) {
    return 'Siteplan & Floor Plan';
  } else if (['progres', 'progress'].some(k => t.includes(k))) {
    return 'Construction Progress';
  } else if (['render', 'fasad', 'gambar rumah', 'desain', 'design', 'virtual tour', '3d', 'foto lokasi', 'video kawasan'].some(k => t.includes(k))) {
    return 'Visuals & 3D Render';
  } else if (['promo', 'diskon', 'cashback', 'promosi', 'promotion', 'voucher'].some(k => t.includes(k))) {
    return 'Promo & Offers';
  } else if (['maps', 'lokasi', 'location', 'g.page', 'goo.gl'].some(k => t.includes(k) || u.includes(k))) {
    return 'Location & Map';
  } else if (['wa.me', 'whatsapp', 'hubungi', 'marketing', 'contact', 'konsultasi'].some(k => t.includes(k) || u.includes(k))) {
    return 'Contact';
  } else if (['instagram', 'facebook', 'tiktok', 'youtube', 'sosmed'].some(k => t.includes(k))) {
    return 'Social Media';
  } else if (['news', 'berita', 'update'].some(k => t.includes(k))) {
    return 'News';
  } else if (['type rumah', 'tipe rumah'].some(k => t.includes(k))) {
    return 'Unit Types';
  } else if (['faq'].some(k => t.includes(k))) {
    return 'FAQ';
  }
  return 'General';
}

async function downloadThumbnail(title, url) {
  if (!url) return null;
  if (IS_VERCEL) return url; // Use direct CDN on serverless
  try {
    fs.mkdirSync(THUMB_DIR, { recursive: true });
    const safeName = title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    let ext = '.jpeg';
    if (url.includes('.png')) ext = '.png';
    else if (url.includes('.webp')) ext = '.webp';

    const localFileName = `${safeName}${ext}`;
    const localFilePath = path.join(THUMB_DIR, localFileName);
    const relPath = `assets/thumbnails/${localFileName}`;

    if (!fs.existsSync(localFilePath)) {
      const res = await fetch(url, { headers: HEADERS });
      if (res.ok) {
        const buffer = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync(localFilePath, buffer);
      }
    }
    return relPath;
  } catch (e) {
    return url;
  }
}

function parseUnitsCSV() {
  const candidates = [
    path.join(BASE_DIR, 'data_harga_booking_cicilan_lengkap.csv'),
    path.join(BASE_DIR, 'data_harga_booking_cicilan.csv')
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      try {
        const content = fs.readFileSync(c, 'utf-8').trim();
        const lines = content.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const rows = [];
        for (let i = 1; i < lines.length; i++) {
          const l = lines[i].trim();
          if (!l) continue;
          const parts = l.split(',');
          const obj = {};
          headers.forEach((h, idx) => {
            let val = parts[idx] ? parts[idx].trim().replace(/^"|"$/g, '') : '';
            if (!isNaN(val) && val !== '') {
              val = Number(val);
            }
            obj[h] = val;
          });
          rows.push(obj);
        }
        if (rows.length > 0) return rows;
      } catch (err) {
        log(`Error reading CSV ${c}: ${err.message}`);
      }
    }
  }

  // Fallback to bundled data.json
  const dataJsonPath = path.join(BASE_DIR, 'data.json');
  if (fs.existsSync(dataJsonPath)) {
    try {
      const dj = JSON.parse(fs.readFileSync(dataJsonPath, 'utf-8'));
      const units = [];
      (dj.projects || []).forEach(p => {
        (p.units || []).forEach(u => units.push(u));
      });
      return units;
    } catch (e) {}
  }
  return [];
}

async function runSync() {
  const startTime = Date.now();
  log('======================================================');
  log(`MEMULAI AUTO SINKRONISASI LINKTREE (${IS_VERCEL ? 'VERCEL' : 'LOCAL'})`);
  log('Target: https://linktr.ee/ciptagroupofficial');
  updateStatus('running', 'Sedang mengambil data terbaru dari Linktree...');

  try {
    const mainProps = await fetchLinktreePage('https://linktr.ee/ciptagroupofficial');
    if (!mainProps) {
      const statusObj = updateStatus('error', 'Gagal mengakses https://linktr.ee/ciptagroupofficial');
      return { success: false, status: statusObj };
    }

    const rawLinks = mainProps.links || [];
    log(`Ditemukan ${rawLinks.length} proyek aktif di akun @${mainProps.username}`);

    const existingUnits = parseUnitsCSV();
    log(`Dimuat ${existingUnits.length} unit terverifikasi.`);

    const projectsData = await Promise.all(rawLinks.map(async (item, idx) => {
      const pTitle = item.title;
      const pUrl = item.url || '';
      const pThumb = item.thumbnail;
      const cleanUrl = pUrl.split('?')[0];

      log(`[${idx + 1}/${rawLinks.length}] Memproses: ${pTitle}`);

      const localThumb = await downloadThumbnail(pTitle, pThumb);

      const projectRecord = {
        index: idx + 1,
        project_name: pTitle,
        linktree_url: cleanUrl,
        thumbnail: localThumb || pThumb,
        online_thumbnail: pThumb,
        sub_profile_title: null,
        sub_profile_description: null,
        sub_social_links: [],
        sub_links: []
      };

      if (cleanUrl.includes('linktr.ee')) {
        try {
          const subProps = await fetchLinktreePage(cleanUrl);
          if (subProps) {
            projectRecord.sub_profile_title = subProps.pageTitle;
            projectRecord.sub_profile_description = subProps.description;
            projectRecord.sub_social_links = (subProps.socialLinks || []).map(s => s.url);

            for (const sItem of (subProps.links || [])) {
              const cat = categorizeLink(sItem.title, sItem.url);
              projectRecord.sub_links.push({
                title: sItem.title,
                url: sItem.url,
                category: cat,
                type: sItem.type
              });
            }
          }
        } catch (subErr) {
          log(`Peringatan sub-linktree ${pTitle}: ${subErr.message}`);
        }
      }

      return projectRecord;
    }));

    const allFlattenedLinks = [];
    for (const p of projectsData) {
      for (const sItem of p.sub_links) {
        allFlattenedLinks.push({
          'Project Name': p.project_name,
          'Project Linktree': p.linktree_url,
          'Resource Title': sItem.title,
          'Category': sItem.category,
          'Resource URL': sItem.url
        });
      }
    }

    // Build Web Projects Array
    const webProjects = projectsData.map(p => {
      const rawUnits = existingUnits.filter(u => u['Proyek'] === p.project_name);
      const pUnits = rawUnits.map(u => {
        const h60 = Number(u['Harga Jual (Rp)'] || u['Harga Bertahap 60x (Rp)']);
        const b = Number(u['Booking Fee / UTJ (Rp)']);
        const sisa60 = h60 - b;
        const c60 = Math.round(sisa60 / 60);

        const sisa72 = Math.round(sisa60 * 1.06);
        const h72 = b + sisa72;
        const c72 = Math.round(sisa72 / 72);

        const dpPct = Number(u['DP KPR (%)'] || 20);
        const dpKpr = Math.round(h60 * (dpPct / 100));
        const netDp = Math.max(0, dpKpr - b);
        const tenorDp = Number(u['Tenor Cicilan DP (Bln)'] || 15);
        const cDp = tenorDp ? Math.round(netDp / tenorDp) : 0;
        const plafon = h60 - dpKpr;

        return {
          ...u,
          'Harga Jual (Rp)': h60,
          'Booking Fee / UTJ (Rp)': b,
          'Harga Bertahap 60x (Rp)': h60,
          'Cicilan Bertahap 60x / Bln (Rp)': c60,
          'Harga Bertahap 72x (Rp)': h72,
          'Cicilan Bertahap 72x / Bln (Rp)': c72,
          'Selisih Harga 72x vs 60x (Rp)': h72 - h60,
          'Hemat Cicilan 72x / Bln (Rp)': c60 - c72,
          'Harga KPR (Rp)': h60,
          'Plafon KPR (Rp)': plafon,
          'Cicilan DP KPR / Bln (Rp)': cDp
        };
      });
      const pRes = allFlattenedLinks.filter(r => r['Project Name'] === p.project_name);

      let cat = 'Rumah';
      if (pUnits.some(u => u['Kategori'] === 'Ruko')) cat = 'Ruko';
      else if (pUnits.some(u => u['Kategori'] === 'Villa')) cat = 'Villa';

      const prices = pUnits.map(u => Number(u['Harga Jual (Rp)'])).filter(n => !isNaN(n) && n > 0);
      const cicilans = pUnits.map(u => Number(u['Cicilan Cash Bertahap / Bln (Rp)'] || u['Cicilan Bertahap / Bln (Rp)'])).filter(n => !isNaN(n) && n > 0);
      const bookings = pUnits.map(u => Number(u['Booking Fee / UTJ (Rp)'])).filter(n => !isNaN(n) && n > 0);

      const minPrice = prices.length ? Math.min(...prices) : 0;
      const maxPrice = prices.length ? Math.max(...prices) : 0;
      const minCicilan = cicilans.length ? Math.min(...cicilans) : 0;
      const maxCicilan = cicilans.length ? Math.max(...cicilans) : 0;

      let bookingStr = 'Rp 3.000.000 - Rp 5.000.000';
      if (bookings.length) {
        const uniqueB = Array.from(new Set(bookings)).sort((a,b)=>a-b);
        if (uniqueB.length === 1) {
          bookingStr = `Rp ${uniqueB[0].toLocaleString('id-ID')}`;
        } else {
          bookingStr = `Rp ${uniqueB[0].toLocaleString('id-ID')} - Rp ${uniqueB[uniqueB.length-1].toLocaleString('id-ID')}`;
        }
      }

      const pricelistLink = p.sub_links.find(l => l.category === 'Pricelist')?.url || null;
      const brochureLink = p.sub_links.find(l => l.category === 'Brochure')?.url || null;
      const siteplanLink = p.sub_links.find(l => l.category.includes('Siteplan'))?.url || null;
      let mapLink = p.sub_links.find(l => l.url.includes('maps') || l.url.includes('goo.gl'))?.url;
      if (!mapLink) mapLink = p.sub_links.find(l => l.category === 'Location & Map')?.url || null;

      return {
        id: p.index,
        name: p.project_name,
        category: cat,
        tagline: p.sub_profile_description || "Hunian & Properti Unggulan Cipta Group Batam",
        linktree_url: p.linktree_url,
        thumbnail: p.thumbnail,
        online_thumbnail: p.online_thumbnail,
        pricelist_link: pricelistLink,
        brochure_link: brochureLink,
        siteplan_link: siteplanLink,
        location_map: mapLink,
        booking_fee_str: bookingStr,
        min_price: minPrice,
        max_price: maxPrice,
        min_cicilan: minCicilan,
        max_cicilan: maxCicilan,
        tenor_str: p.project_name === 'Cipta Green Ville' ? '60 & 72 Bulan (5 - 6 Tahun)' : '60 Bulan (5 Tahun)',
        total_units_recorded: pUnits.length,
        units: pUnits,
        resources: pRes
      };
    });

    const now = new Date();
    const formattedDate = now.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }) + ' ' + now.toTimeString().substring(0, 8);

    const appDataset = {
      company: {
        name: "Cipta Group Official",
        tagline: "Mengerti Kebutuhan Anda - Lebih dari 30 Tahun Membangun Batam",
        city: "Batam, Kepulauan Riau",
        facebook: "https://www.facebook.com/ciptagroupofficial",
        instagram: "https://instagram.com/ciptagroupofficial",
        linktree: "https://linktr.ee/ciptagroupofficial"
      },
      last_sync: formattedDate,
      sync_engine: IS_VERCEL ? 'Node.js (Vercel Serverless)' : 'Node.js',
      projects: webProjects
    };

    // Save to writable directory if possible
    try {
      fs.writeFileSync(path.join(WRITABLE_DIR, 'data.json'), JSON.stringify(appDataset, null, 2), 'utf-8');
      fs.writeFileSync(path.join(WRITABLE_DIR, 'data.js'), 'window.CIPTA_DATA = ' + JSON.stringify(appDataset, null, 2) + ';\n', 'utf-8');
    } catch (e) {}

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    log(`[✓] Sinkronisasi selesai dalam ${elapsed} detik.`);
    const statusObj = updateStatus('success', `Sinkronisasi berhasil (${elapsed} detik). 15 proyek & ${existingUnits.length} unit terdata.`, {
      total_projects: webProjects.length,
      total_units: existingUnits.length,
      elapsed_seconds: Number(elapsed)
    });

    return {
      success: true,
      data: appDataset,
      status: statusObj
    };

  } catch (err) {
    log(`[X] Error: ${err.message}`);
    const statusObj = updateStatus('error', `Error: ${err.message}`);
    return { success: false, status: statusObj, error: err.message };
  }
}

if (require.main === module) {
  runSync();
}

module.exports = { runSync, updateStatus, STATUS_FILE, BASE_DIR };
