// Cipta Group Web Application Logic - Synchronized Version with 60x vs 72x vs KPR Comparison
// Note: Skema Cash Bertahap 72x (+6%) hanya berlaku khusus untuk proyek Cipta Green Ville.
document.addEventListener('DOMContentLoaded', () => {
  const data = window.CIPTA_DATA;
  if (!data || !data.projects) {
    console.error("Data CIPTA_DATA tidak ditemukan!");
    return;
  }

  // DOM Elements - Catalog & Filters
  const projectGrid = document.getElementById('projectGrid');
  const emptyState = document.getElementById('emptyState');
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const categoryFilter = document.getElementById('categoryFilter');
  const priceFilter = document.getElementById('priceFilter');
  const sortFilter = document.getElementById('sortFilter');
  const catPills = document.querySelectorAll('.cat-pill');
  const resultCountText = document.getElementById('resultCountText');
  const resetFilterBtn = document.getElementById('resetFilterBtn');

  // Modal Elements
  const projectModal = document.getElementById('projectModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const modalLogo = document.getElementById('modalLogo');
  const modalTitle = document.getElementById('modalTitle');
  const modalCategory = document.getElementById('modalCategory');
  const modalTagline = document.getElementById('modalTagline');
  const modalResourceLinks = document.getElementById('modalResourceLinks');
  const modalUnitTableBody = document.getElementById('modalUnitTableBody');
  const modalLinktreeBtn = document.getElementById('modalLinktreeBtn');
  const modalSimulateBtn = document.getElementById('modalSimulateBtn');
  const modalWaBtn = document.getElementById('modalWaBtn');

  // Master Table Elements
  const masterTableBody = document.getElementById('masterTableBody');
  const tableSearchInput = document.getElementById('tableSearchInput');

  // Calculator Mode Switcher Tabs
  const tabCashBertahap60 = document.getElementById('tabCashBertahap60');
  const tabCashBertahap72 = document.getElementById('tabCashBertahap72');
  const tabKprBank = document.getElementById('tabKprBank');
  const badgeCurrentMode = document.getElementById('badgeCurrentMode');

  // Calculator Form Controls
  const calcUnitSelect = document.getElementById('calcUnitSelect');
  const calcPriceInput = document.getElementById('calcPriceInput');
  const calcPriceFormatted = document.getElementById('calcPriceFormatted');
  const calcBookingSelect = document.getElementById('calcBookingSelect');
  const calcTenorSelect = document.getElementById('calcTenorSelect');
  const tenorLabel = document.getElementById('tenorLabel');

  // Uang Muka (DP) Controls
  const dpControlContainer = document.getElementById('dpControlContainer');
  const dpDescText = document.getElementById('dpDescText');
  const dpModeZeroBtn = document.getElementById('dpModeZeroBtn');
  const dpModeCustomBtn = document.getElementById('dpModeCustomBtn');
  const dpSliderBox = document.getElementById('dpSliderBox');
  const calcDpSlider = document.getElementById('calcDpSlider');
  const dpPercentValue = document.getElementById('dpPercentValue');

  // Waterfall Bars
  const barBooking = document.getElementById('barBooking');
  const barDp = document.getElementById('barDp');
  const barRemaining = document.getElementById('barRemaining');
  const waterfallTotalLabel = document.getElementById('waterfallTotalLabel');

  // Active Highlight Results
  const labelMonthlyTitle = document.getElementById('labelMonthlyTitle');
  const resMonthlyCicilan = document.getElementById('resMonthlyCicilan');
  const resTenorText = document.getElementById('resTenorText');
  const resTotalPrice = document.getElementById('resTotalPrice');
  const resBookingFee = document.getElementById('resBookingFee');
  const resLabelDp = document.getElementById('resLabelDp');
  const resDpValue = document.getElementById('resDpValue');
  const rowNetDp = document.getElementById('rowNetDp');
  const resNetDpValue = document.getElementById('resNetDpValue');
  const resLabelRemaining = document.getElementById('resLabelRemaining');
  const resRemainingPrice = document.getElementById('resRemainingPrice');
  const resFormulaVerification = document.getElementById('resFormulaVerification');
  const resFirstInstallmentDate = document.getElementById('resFirstInstallmentDate');
  const calcWaBtn = document.getElementById('calcWaBtn');

  // Comparison Matrix Cards Elements
  const cmpPrice60 = document.getElementById('cmpPrice60');
  const cmpBooking60 = document.getElementById('cmpBooking60');
  const cmpCicilan60 = document.getElementById('cmpCicilan60');

  const cmpPrice72 = document.getElementById('cmpPrice72');
  const cmpDiff72 = document.getElementById('cmpDiff72');
  const cmpBooking72 = document.getElementById('cmpBooking72');
  const cmpCicilan72 = document.getElementById('cmpCicilan72');
  const cmpHemat72 = document.getElementById('cmpHemat72');

  const cmpPriceKpr = document.getElementById('cmpPriceKpr');
  const cmpLabelDpKpr = document.getElementById('cmpLabelDpKpr');
  const cmpTotalDpKpr = document.getElementById('cmpTotalDpKpr');
  const cmpCicilanDpKpr = document.getElementById('cmpCicilanDpKpr');
  const cmpPlafonKpr = document.getElementById('cmpPlafonKpr');
  const cmpAngsuranBankKpr = document.getElementById('cmpAngsuranBankKpr');

  // State Variables
  let currentCategory = 'ALL';
  let currentActiveProject = null;
  let currentCalculatorProject = 'Cipta Green Ville'; // Track project selected in calculator
  let calcMode = 'BERTAHAP_60'; // 'BERTAHAP_60' | 'BERTAHAP_72' | 'KPR'
  let dpMode = 'ZERO'; // 'ZERO' (Tanpa DP) | 'CUSTOM' (Pakai DP)

  // ==================== AUTO-SYNC API & WIDGET LOGIC ====================
  const topSyncBtn = document.getElementById('topSyncBtn');
  const topSyncIcon = document.getElementById('topSyncIcon');
  const topLastSyncText = document.getElementById('topLastSyncText');
  const syncProgressBanner = document.getElementById('syncProgressBanner');
  const syncProgressMsg = document.getElementById('syncProgressMsg');

  let syncPollingInterval = null;

  async function checkSyncStatus() {
    try {
      const res = await fetch('/api/sync/status?t=' + Date.now());
      if (!res.ok) return;
      const statusData = await res.json();

      if (statusData.last_sync_formatted) {
        topLastSyncText.textContent = statusData.last_sync_formatted;
      } else if (data.last_sync) {
        topLastSyncText.textContent = data.last_sync;
      }

      if (statusData.is_syncing) {
        syncProgressBanner.classList.remove('hidden');
        topSyncIcon.classList.add('animate-spin');
        topSyncBtn.disabled = true;
        topSyncBtn.classList.add('opacity-75', 'cursor-not-allowed');
      } else {
        topSyncIcon.classList.remove('animate-spin');
        topSyncBtn.disabled = false;
        topSyncBtn.classList.remove('opacity-75', 'cursor-not-allowed');
      }

      return statusData;
    } catch (e) {
      console.warn("Auto-sync API offline/static mode:", e);
      if (data.last_sync) {
        topLastSyncText.textContent = data.last_sync;
      }
    }
  }

  async function triggerManualSync() {
    try {
      topSyncBtn.disabled = true;
      topSyncIcon.classList.add('animate-spin');
      syncProgressBanner.classList.remove('hidden');
      syncProgressMsg.textContent = 'Sedang mengambil data terbaru langsung dari https://linktr.ee/ciptagroupofficial...';

      const res = await fetch('/api/sync', { method: 'POST' });
      const triggerData = await res.json();

      if (triggerData.data) {
        window.CIPTA_DATA = triggerData.data;
        applyFilters();
        renderMasterTable();
        updateCalculator();
        if (triggerData.last_sync) {
          topLastSyncText.textContent = triggerData.last_sync;
        }
        syncProgressMsg.textContent = '✓ Data berhasil disinkronkan dari Linktree!';
        setTimeout(() => {
          syncProgressBanner.classList.add('hidden');
          topSyncIcon.classList.remove('animate-spin');
          topSyncBtn.disabled = false;
        }, 2000);
        return;
      }

      if (syncPollingInterval) clearInterval(syncPollingInterval);

      syncPollingInterval = setInterval(async () => {
        const s = await checkSyncStatus();
        if (s && !s.is_syncing) {
          clearInterval(syncPollingInterval);
          syncPollingInterval = null;

          try {
            const freshRes = await fetch('data.json?t=' + Date.now());
            if (freshRes.ok) {
              const freshData = await freshRes.json();
              window.CIPTA_DATA = freshData;
              applyFilters();
              renderMasterTable();
              updateCalculator();
            }
          } catch (err) {
            console.error("Gagal memuat data.json baru:", err);
          }

          syncProgressMsg.textContent = '✓ Data berhasil disinkronkan!';
          setTimeout(() => {
            syncProgressBanner.classList.add('hidden');
            topSyncIcon.classList.remove('animate-spin');
            topSyncBtn.disabled = false;
          }, 2000);
        }
      }, 2500);

    } catch (err) {
      console.error("Gagal memicu sync:", err);
      syncProgressBanner.classList.add('hidden');
      topSyncIcon.classList.remove('animate-spin');
      topSyncBtn.disabled = false;
      alert("Gagal menghubungi endpoint auto-sync.");
    }
  }

  if (topSyncBtn) {
    topSyncBtn.addEventListener('click', triggerManualSync);
  }

  checkSyncStatus();
  setInterval(checkSyncStatus, 45000);

  // Format IDR Helper
  function formatIDR(num) {
    if (isNaN(num) || num === null || num === undefined) return 'Rp 0';
    return 'Rp ' + Math.round(num).toLocaleString('id-ID');
  }

  // 1. Render Project Cards
  function renderProjects(projects) {
    projectGrid.innerHTML = '';
    
    if (projects.length === 0) {
      emptyState.classList.remove('hidden');
      resultCountText.textContent = 'Menampilkan 0 proyek';
      return;
    }

    emptyState.classList.add('hidden');
    resultCountText.textContent = `Menampilkan ${projects.length} proyek`;

    projects.forEach(p => {
      const isGreenville = p.name.toLowerCase().includes('green ville') || p.name.toLowerCase().includes('greenville');
      const card = document.createElement('div');
      card.className = "bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group";

      let badgeClass = "bg-emerald-100 text-emerald-800 border-emerald-200";
      if (p.category === 'Ruko') badgeClass = "bg-blue-100 text-blue-800 border-blue-200";
      if (p.category === 'Villa') badgeClass = "bg-purple-100 text-purple-800 border-purple-200";

      const thumbSrc = p.thumbnail || p.online_thumbnail || 'assets/thumbnails/cipta_green_ville.jpeg';

      card.innerHTML = `
        <div class="relative h-48 overflow-hidden bg-slate-100">
          <img 
            src="${thumbSrc}" 
            alt="${p.name}" 
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onerror="this.onerror=null; this.src='assets/thumbnails/cipta_green_ville.jpeg';"
          >
          <div class="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-black/20"></div>
          
          <div class="absolute top-3 left-3 flex items-center gap-1.5">
            <span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border shadow-sm ${badgeClass}">
              ${p.category}
            </span>
            ${p.total_units_recorded > 0 ? `<span class="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full">${p.total_units_recorded} Unit</span>` : ''}
          </div>

          <div class="absolute bottom-3 left-3 right-3 text-white">
            <h3 class="font-extrabold text-lg leading-tight text-white drop-shadow">${p.name}</h3>
            <p class="text-xs text-slate-200 line-clamp-1 drop-shadow-sm">${p.tagline}</p>
          </div>
        </div>

        <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div class="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
            <div>
              <span class="text-[10px] font-semibold text-slate-400 block uppercase">Harga Mulai (60x)</span>
              <span class="font-extrabold text-slate-900 text-sm">${p.min_price > 0 ? formatIDR(p.min_price) : 'Hubungi CS'}</span>
            </div>
            <div>
              <span class="text-[10px] font-semibold text-slate-400 block uppercase">Booking Fee (UTJ)</span>
              <span class="font-bold text-amber-600 text-xs">${p.booking_fee_str}</span>
            </div>
            <div class="col-span-2 pt-2 border-t border-slate-200/60 flex items-center justify-between">
              <div>
                <span class="text-[10px] font-semibold text-slate-400 block uppercase">Cash Bertahap (DP 0%)</span>
                <span class="font-extrabold text-emerald-600 text-xs">Mulai ${p.min_cicilan > 0 ? formatIDR(p.min_cicilan) + '/bln' : '-'}</span>
              </div>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded ${isGreenville ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}">
                ${isGreenville ? '60x & 72x (Promo)' : 'Tenor 60x'}
              </span>
            </div>
          </div>

          <div class="space-y-2 pt-1">
            <button 
              class="open-modal-btn w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
              data-id="${p.id}"
            >
              <i data-lucide="layers" class="w-4 h-4 text-amber-400"></i>
              ${isGreenville ? 'Lihat Perbandingan 60x, 72x & KPR' : 'Lihat Rincian Unit & Tabel Harga'}
            </button>

            <div class="grid grid-cols-3 gap-1 sm:gap-1.5 text-center text-[10px] sm:text-[11px] font-semibold">
              ${p.pricelist_link ? `
                <a href="${p.pricelist_link}" target="_blank" class="py-1.5 px-1 sm:px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center justify-center gap-1">
                  <i data-lucide="file-text" class="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 flex-shrink-0"></i> <span>Pricelist</span>
                </a>` : `<span class="py-1.5 px-1 sm:px-2 rounded-lg bg-slate-50 text-slate-300 cursor-not-allowed">Pricelist</span>`}
              
              ${p.brochure_link ? `
                <a href="${p.brochure_link}" target="_blank" class="py-1.5 px-1 sm:px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center justify-center gap-1">
                  <i data-lucide="image" class="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 flex-shrink-0"></i> <span>Brosur</span>
                </a>` : `<span class="py-1.5 px-1 sm:px-2 rounded-lg bg-slate-50 text-slate-300 cursor-not-allowed">Brosur</span>`}
              
              ${p.location_map ? `
                <a href="${p.location_map}" target="_blank" class="py-1.5 px-1 sm:px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center justify-center gap-1">
                  <i data-lucide="map-pin" class="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-500 flex-shrink-0"></i> <span>Maps</span>
                </a>` : `<span class="py-1.5 px-1 sm:px-2 rounded-lg bg-slate-50 text-slate-300 cursor-not-allowed">Maps</span>`}
            </div>
          </div>
        </div>
      `;

      projectGrid.appendChild(card);
    });

    lucide.createIcons();
    attachCardListeners();
  }

  // 2. Filters & Search Logic
  function applyFilters() {
    let result = [...data.projects];

    const q = searchInput.value.toLowerCase().trim();
    if (q) {
      clearSearchBtn.classList.remove('hidden');
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.units.some(u => u['Tipe Unit'].toLowerCase().includes(q))
      );
    } else {
      clearSearchBtn.classList.add('hidden');
    }

    if (currentCategory !== 'ALL') {
      result = result.filter(p => p.category === currentCategory);
    }

    const pf = priceFilter.value;
    if (pf === 'UNDER_400') {
      result = result.filter(p => p.min_price > 0 && p.min_price < 400000000);
    } else if (pf === '400_800') {
      result = result.filter(p => (p.min_price >= 400000000 && p.min_price <= 800000000) || (p.max_price >= 400000000 && p.max_price <= 800000000));
    } else if (pf === 'OVER_800') {
      result = result.filter(p => p.max_price > 800000000);
    }

    const sf = sortFilter.value;
    if (sf === 'PRICE_LOW') {
      result.sort((a, b) => (a.min_price || 9999999999) - (b.min_price || 9999999999));
    } else if (sf === 'PRICE_HIGH') {
      result.sort((a, b) => (b.max_price || 0) - (a.max_price || 0));
    } else if (sf === 'CICILAN_LOW') {
      result.sort((a, b) => (a.min_cicilan || 9999999999) - (b.min_cicilan || 9999999999));
    } else if (sf === 'NAME_ASC') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    renderProjects(result);
  }

  searchInput.addEventListener('input', applyFilters);
  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    applyFilters();
  });

  categoryFilter.addEventListener('change', (e) => {
    currentCategory = e.target.value;
    updatePillsActive(currentCategory);
    applyFilters();
  });

  priceFilter.addEventListener('change', applyFilters);
  sortFilter.addEventListener('change', applyFilters);

  catPills.forEach(pill => {
    pill.addEventListener('click', () => {
      currentCategory = pill.getAttribute('data-cat');
      categoryFilter.value = currentCategory;
      updatePillsActive(currentCategory);
      applyFilters();
    });
  });

  function updatePillsActive(cat) {
    catPills.forEach(p => {
      if (p.getAttribute('data-cat') === cat) {
        p.className = 'cat-pill active px-3 py-1 rounded-full font-semibold transition bg-slate-900 text-white';
      } else {
        p.className = 'cat-pill px-3 py-1 rounded-full font-semibold transition bg-slate-100 text-slate-600 hover:bg-slate-200';
      }
    });
  }

  resetFilterBtn.addEventListener('click', () => {
    searchInput.value = '';
    currentCategory = 'ALL';
    categoryFilter.value = 'ALL';
    priceFilter.value = 'ALL';
    sortFilter.value = 'DEFAULT';
    updatePillsActive('ALL');
    applyFilters();
  });

  function attachCardListeners() {
    document.querySelectorAll('.open-modal-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'));
        const proj = data.projects.find(p => p.id === id);
        if (proj) openModal(proj);
      });
    });
  }

  // 3. Open Modal Detail with 60x vs 72x (Khusus Greenville) vs KPR
  function openModal(proj) {
    currentActiveProject = proj;
    const isGreenville = proj.name.toLowerCase().includes('green ville') || proj.name.toLowerCase().includes('greenville');

    modalLogo.src = proj.thumbnail || proj.online_thumbnail || 'assets/thumbnails/cipta_green_ville.jpeg';
    modalLogo.onerror = () => { modalLogo.src = 'assets/thumbnails/cipta_green_ville.jpeg'; };
    modalTitle.textContent = proj.name;
    modalCategory.textContent = proj.category;
    modalTagline.textContent = proj.tagline;

    modalResourceLinks.innerHTML = '';
    const resources = [
      { name: 'Pricelist Resmi (Drive)', url: proj.pricelist_link, icon: 'file-text', color: 'bg-blue-50 text-blue-700 border-blue-200' },
      { name: 'E-Brosur / Flyer', url: proj.brochure_link, icon: 'image', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      { name: 'Siteplan & Denah', url: proj.siteplan_link, icon: 'map', color: 'bg-amber-50 text-amber-700 border-amber-200' },
      { name: 'Titik Lokasi Maps', url: proj.location_map, icon: 'map-pin', color: 'bg-rose-50 text-rose-700 border-rose-200' }
    ];

    resources.forEach(r => {
      if (r.url) {
        const a = document.createElement('a');
        a.href = r.url;
        a.target = '_blank';
        a.className = `px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 hover:opacity-80 transition ${r.color}`;
        a.innerHTML = `<i data-lucide="${r.icon}" class="w-3.5 h-3.5"></i> ${r.name}`;
        modalResourceLinks.appendChild(a);
      }
    });

    // Populate Modal Unit Table
    modalUnitTableBody.innerHTML = '';
    if (proj.units && proj.units.length > 0) {
      proj.units.forEach((u, idx) => {
        const tr = document.createElement('tr');
        tr.className = idx % 2 === 0 ? 'bg-white hover:bg-slate-50/80 transition' : 'bg-slate-50/60 hover:bg-slate-50/80 transition';
        
        const p60 = u['Harga Bertahap 60x (Rp)'] || u['Harga Jual (Rp)'];
        const c60 = u['Cicilan Bertahap 60x / Bln (Rp)'] || u['Cicilan Cash Bertahap / Bln (Rp)'];
        
        let col72Content = '';
        if (isGreenville) {
          const p72 = u['Harga Bertahap 72x (Rp)'] || (u['Booking Fee / UTJ (Rp)'] + Math.round((p60 - u['Booking Fee / UTJ (Rp)']) * 1.06));
          const c72 = u['Cicilan Bertahap 72x / Bln (Rp)'] || Math.round((p72 - u['Booking Fee / UTJ (Rp)']) / 72);
          const hemat72 = u['Hemat Cicilan 72x / Bln (Rp)'] || Math.max(0, c60 - c72);
          col72Content = `
            <td class="py-2.5 px-3.5 text-right border-l border-slate-200 bg-emerald-50/40">
              <span class="font-extrabold text-slate-900 block">${formatIDR(p72)}</span>
              <span class="text-[11px] font-bold text-emerald-600 block">${formatIDR(c72)}/bln</span>
              <span class="text-[9px] font-semibold text-emerald-700 bg-emerald-100/70 px-1 py-0.2 rounded inline-block mt-0.5">Hemat ${formatIDR(hemat72)}/bln</span>
            </td>
          `;
        } else {
          col72Content = `
            <td class="py-2.5 px-3.5 text-center border-l border-slate-200 bg-slate-50/50">
              <span class="text-slate-400 text-xs font-semibold block">-</span>
              <span class="text-[9px] text-slate-400 block font-normal">Hanya di Green Ville</span>
            </td>
          `;
        }
        
        const cicilanDpKpr = u['Cicilan DP KPR / Bln (Rp)'] || Math.round((p60 * 0.2 - u['Booking Fee / UTJ (Rp)']) / 15);
        const estBankKpr = u['Estimasi Angsuran KPR Bank 15 Thn / Bln (Rp)'] || Math.round((p60 * 0.8) * 0.008988);

        tr.innerHTML = `
          <td class="py-2.5 px-3 font-bold text-slate-900">${u['Tipe Unit']}</td>
          <td class="py-2.5 px-3">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${u['Posisi'] === 'Hook' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}">${u['Posisi'] || 'Standar'}</span>
            ${u['LB'] && u['LT'] ? `<span class="text-[10px] text-slate-400 block mt-0.5 font-medium">${u['LB']}/${u['LT']} m²</span>` : ''}
          </td>
          <td class="py-2.5 px-3 text-right font-bold text-blue-600">${formatIDR(u['Booking Fee / UTJ (Rp)'])}</td>
          <td class="py-2.5 px-3.5 text-right border-l border-slate-200 bg-amber-50/40">
            <span class="font-extrabold text-slate-900 block">${formatIDR(p60)}</span>
            <span class="text-[11px] font-bold text-amber-600 block">${formatIDR(c60)}/bln</span>
          </td>
          ${col72Content}
          <td class="py-2.5 px-3.5 text-right border-l border-slate-200 bg-blue-50/40">
            <span class="font-semibold text-slate-700 text-[11px] block">DP 15x: ${formatIDR(cicilanDpKpr)}/bln</span>
            <span class="text-[10px] text-blue-600 font-bold block">Est. Bank: ${formatIDR(estBankKpr)}/bln</span>
          </td>
          <td class="py-2.5 px-3 text-center border-l border-slate-200">
            <button class="sim-from-modal-btn px-2.5 py-1.5 rounded-lg bg-cipta-blue hover:bg-blue-800 text-white font-bold text-[10px] transition shadow-sm flex items-center justify-center gap-1 mx-auto" 
              data-price="${p60}" 
              data-booking="${u['Booking Fee / UTJ (Rp)']}" 
              data-proj="${proj.name}"
              data-unit="${proj.name} - ${u['Tipe Unit']}">
              <i data-lucide="calculator" class="w-3 h-3"></i> Hitung
            </button>
          </td>
        `;
        modalUnitTableBody.appendChild(tr);
      });
    } else {
      modalUnitTableBody.innerHTML = `<tr><td colspan="7" class="text-center py-6 text-slate-400">Data unit terperinci dapat dilihat langsung di berkas Pricelist resmi.</td></tr>`;
    }

    modalLinktreeBtn.href = proj.linktree_url || 'https://linktr.ee/ciptagroupofficial';
    
    const waText = encodeURIComponent(`Halo Cipta Group, saya ingin informasi pricelist & simulasi untuk proyek *${proj.name}*.`);
    modalWaBtn.href = `https://wa.me/628117700000?text=${waText}`;

    modalSimulateBtn.onclick = () => {
      closeModal();
      window.location.hash = 'kalkulator';
      if (proj.units && proj.units.length > 0) {
        populateCalculatorWithUnit(proj.units[0], proj.name);
      } else {
        currentCalculatorProject = proj.name;
        calcPriceInput.value = proj.min_price || 500000000;
        updateCalculator();
      }
    };

    projectModal.classList.remove('hidden');
    lucide.createIcons();

    document.querySelectorAll('.sim-from-modal-btn').forEach(b => {
      b.addEventListener('click', () => {
        const pr = parseFloat(b.getAttribute('data-price'));
        const bk = parseFloat(b.getAttribute('data-booking'));
        const un = b.getAttribute('data-unit');
        const pj = b.getAttribute('data-proj');
        
        closeModal();
        window.location.hash = 'kalkulator';

        currentCalculatorProject = pj;
        calcPriceInput.value = pr;
        calcBookingSelect.value = bk;
        setCalculatorMode('BERTAHAP_60');
        updateCalculator(un);
      });
    });
  }

  function closeModal() {
    projectModal.classList.add('hidden');
  }

  closeModalBtn.addEventListener('click', closeModal);
  projectModal.addEventListener('click', (e) => {
    if (e.target === projectModal) closeModal();
  });

  // 4. Populate Master Unit Table: 72x ONLY active for Cipta Green Ville
  function renderMasterTable(filterText = '') {
    masterTableBody.innerHTML = '';
    const q = filterText.toLowerCase().trim();

    let count = 0;
    data.projects.forEach(p => {
      const isGreenville = p.name.toLowerCase().includes('green ville') || p.name.toLowerCase().includes('greenville');

      p.units.forEach(u => {
        const match = !q || 
          p.name.toLowerCase().includes(q) || 
          p.category.toLowerCase().includes(q) || 
          u['Tipe Unit'].toLowerCase().includes(q) ||
          (u['Posisi'] && u['Posisi'].toLowerCase().includes(q));

        if (match) {
          count++;
          const tr = document.createElement('tr');
          tr.className = "hover:bg-slate-50 transition border-b border-slate-100";

          const p60 = u['Harga Bertahap 60x (Rp)'] || u['Harga Jual (Rp)'];
          const c60 = u['Cicilan Bertahap 60x / Bln (Rp)'] || u['Cicilan Cash Bertahap / Bln (Rp)'];
          
          let col72Html = '';
          if (isGreenville) {
            const p72 = u['Harga Bertahap 72x (Rp)'] || (u['Booking Fee / UTJ (Rp)'] + Math.round((p60 - u['Booking Fee / UTJ (Rp)']) * 1.06));
            const c72 = u['Cicilan Bertahap 72x / Bln (Rp)'] || Math.round((p72 - u['Booking Fee / UTJ (Rp)']) / 72);
            const hemat72 = u['Hemat Cicilan 72x / Bln (Rp)'] || Math.max(0, c60 - c72);
            col72Html = `
              <td class="py-3 px-3.5 text-right border-l border-slate-100 bg-emerald-50/20">
                <div class="font-extrabold text-slate-900">${formatIDR(p72)}</div>
                <div class="text-[11px] font-bold text-emerald-600">${formatIDR(c72)}<span class="text-[10px] text-slate-400 font-normal">/bln (72x)</span></div>
                <div class="mt-0.5"><span class="inline-block text-[9px] font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">Hemat ${formatIDR(hemat72)}/bln</span></div>
              </td>
            `;
          } else {
            col72Html = `
              <td class="py-3 px-3.5 text-center border-l border-slate-100 bg-slate-50/40">
                <span class="text-slate-400 text-xs font-bold block">-</span>
                <span class="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded inline-block font-medium">Hanya 60x (Khusus Green Ville)</span>
              </td>
            `;
          }
          
          const cicilanDpKpr = u['Cicilan DP KPR / Bln (Rp)'] || Math.round((p60 * 0.2 - u['Booking Fee / UTJ (Rp)']) / 15);
          const estBankKpr = u['Estimasi Angsuran KPR Bank 15 Thn / Bln (Rp)'] || Math.round((p60 * 0.8) * 0.008988);

          tr.innerHTML = `
            <td class="py-3 px-3.5">
              <div class="font-bold text-slate-900">${p.name}</div>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold ${p.category === 'Ruko' ? 'bg-blue-100 text-blue-800' : (p.category === 'Villa' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800')}">${p.category}</span>
            </td>
            <td class="py-3 px-3.5">
              <div class="font-semibold text-slate-800">${u['Tipe Unit']}</div>
              <div class="flex items-center gap-1.5 mt-0.5">
                <span class="px-1.5 py-0.2 rounded text-[10px] font-medium ${u['Posisi'] === 'Hook' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}">${u['Posisi'] || 'Standar'}</span>
                ${u['LB'] && u['LT'] ? `<span class="text-[10px] text-slate-400 font-medium">${u['LB']}/${u['LT']} m²</span>` : ''}
              </div>
            </td>
            <td class="py-3 px-3.5 text-right font-bold text-blue-600">${formatIDR(u['Booking Fee / UTJ (Rp)'])}</td>
            <td class="py-3 px-3.5 text-right border-l border-slate-100 bg-amber-50/20">
              <div class="font-extrabold text-slate-900">${formatIDR(p60)}</div>
              <div class="text-[11px] font-bold text-amber-600">${formatIDR(c60)}<span class="text-[10px] text-slate-400 font-normal">/bln (60x)</span></div>
            </td>
            ${col72Html}
            <td class="py-3 px-3.5 text-right border-l border-slate-100 bg-blue-50/20">
              <div class="text-[11px] font-bold text-slate-700">DP 15x: ${formatIDR(cicilanDpKpr)}/bln</div>
              <div class="text-[11px] font-extrabold text-blue-600">Est. Bank: ${formatIDR(estBankKpr)}/bln</div>
              <div class="text-[9px] text-slate-400">(DP 20% | 15 Thn @7%)</div>
            </td>
            <td class="py-3 px-3.5 text-center border-l border-slate-100">
              <button class="sim-from-table-btn px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] transition shadow-sm flex items-center justify-center gap-1 mx-auto" 
                data-price="${p60}" 
                data-booking="${u['Booking Fee / UTJ (Rp)']}" 
                data-proj="${p.name}"
                data-unit="${p.name} - ${u['Tipe Unit']}">
                <i data-lucide="calculator" class="w-3.5 h-3.5 text-amber-400"></i> Hitung
              </button>
            </td>
          `;
          masterTableBody.appendChild(tr);
        }
      });
    });

    if (count === 0) {
      masterTableBody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-slate-400">Tidak ada unit yang sesuai pencarian.</td></tr>`;
    }

    lucide.createIcons();

    document.querySelectorAll('.sim-from-table-btn').forEach(b => {
      b.addEventListener('click', () => {
        const pr = parseFloat(b.getAttribute('data-price'));
        const bk = parseFloat(b.getAttribute('data-booking'));
        const un = b.getAttribute('data-unit');
        const pj = b.getAttribute('data-proj');
        
        window.location.hash = 'kalkulator';
        currentCalculatorProject = pj;
        calcPriceInput.value = pr;
        calcBookingSelect.value = bk;
        setCalculatorMode('BERTAHAP_60');
        updateCalculator(un);
      });
    });
  }

  tableSearchInput.addEventListener('input', (e) => {
    renderMasterTable(e.target.value);
  });

  // 5. Populate Calculator Dropdown
  data.projects.forEach(p => {
    const isGreenville = p.name.toLowerCase().includes('green ville') || p.name.toLowerCase().includes('greenville');
    const optGroup = document.createElement('optgroup');
    optGroup.label = isGreenville ? `${p.name} ⭐ (Tersedia Opsi 72x)` : p.name;
    
    p.units.forEach(u => {
      const opt = document.createElement('option');
      opt.value = JSON.stringify({
        project: p.name,
        type: u['Tipe Unit'],
        price: u['Harga Jual (Rp)'],
        booking: u['Booking Fee / UTJ (Rp)'],
        tenor: u['Tenor Bertahap (Bulan)'] || 60
      });
      const badgeText = isGreenville ? ' [Opsi 72x Tersedia]' : '';
      opt.textContent = `${p.name} - ${u['Tipe Unit']} (${u['Posisi'] || 'Std'}) - ${formatIDR(u['Harga Jual (Rp)'])} ${badgeText}`;
      optGroup.appendChild(opt);
    });
    calcUnitSelect.appendChild(optGroup);
  });

  calcUnitSelect.addEventListener('change', (e) => {
    if (!e.target.value) return;
    const u = JSON.parse(e.target.value);
    currentCalculatorProject = u.project;
    calcPriceInput.value = u.price;
    calcBookingSelect.value = u.booking;
    updateCalculator(`${u.project} - ${u.type}`);
  });

  function populateCalculatorWithUnit(unit, projectName) {
    currentCalculatorProject = projectName;
    calcPriceInput.value = unit['Harga Jual (Rp)'];
    calcBookingSelect.value = unit['Booking Fee / UTJ (Rp)'];
    setCalculatorMode('BERTAHAP_60');
    updateCalculator(`${projectName} - ${unit['Tipe Unit']}`);
  }

  // 6. Calculator Mode Switchers (60x vs 72x vs KPR)
  function setCalculatorMode(mode) {
    calcMode = mode;

    tabCashBertahap60.className = "flex-1 py-2.5 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 text-slate-300 hover:text-white";
    tabCashBertahap72.className = "flex-1 py-2.5 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 text-slate-300 hover:text-white";
    tabKprBank.className = "flex-1 py-2.5 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 text-slate-300 hover:text-white";

    if (calcMode === 'BERTAHAP_60') {
      tabCashBertahap60.className = "flex-1 py-2.5 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 bg-amber-500 text-slate-950 shadow-md";
      tenorLabel.textContent = "Tenor Cash Bertahap:";
      calcTenorSelect.innerHTML = `
        <option value="12">12 Bulan (1 Tahun)</option>
        <option value="24">24 Bulan (2 Tahun)</option>
        <option value="36">36 Bulan (3 Tahun)</option>
        <option value="48">48 Bulan (4 Tahun)</option>
        <option value="60" selected>60 Bulan (5 Tahun - Standar Base Cipta)</option>
      `;
      dpControlContainer.classList.remove('hidden');
      setDpMode('ZERO');
    } else if (calcMode === 'BERTAHAP_72') {
      tabCashBertahap72.className = "flex-1 py-2.5 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 bg-emerald-500 text-slate-950 shadow-md";
      tenorLabel.textContent = "Tenor Cash Bertahap Panjang:";
      calcTenorSelect.innerHTML = `
        <option value="72" selected>72 Bulan (6 Tahun - Khusus Green Ville)</option>
      `;
      dpControlContainer.classList.remove('hidden');
      setDpMode('ZERO');

      // If current project is not Greenville, auto-switch to Greenville unit so user sees working 72x figures
      const isGreenville = currentCalculatorProject && (currentCalculatorProject.toLowerCase().includes('green ville') || currentCalculatorProject.toLowerCase().includes('greenville'));
      if (!isGreenville) {
        const gvProj = data.projects.find(p => p.name.toLowerCase().includes('green ville') || p.name.toLowerCase().includes('greenville'));
        if (gvProj && gvProj.units && gvProj.units.length > 0) {
          currentCalculatorProject = gvProj.name;
          const gvUnit = gvProj.units[0];
          calcPriceInput.value = gvUnit['Harga Jual (Rp)'];
          calcBookingSelect.value = gvUnit['Booking Fee / UTJ (Rp)'];
          
          for (let i = 0; i < calcUnitSelect.options.length; i++) {
            const opt = calcUnitSelect.options[i];
            if (opt.value) {
              try {
                const parsed = JSON.parse(opt.value);
                if (parsed.project === gvProj.name) {
                  calcUnitSelect.selectedIndex = i;
                  break;
                }
              } catch(e) {}
            }
          }
          updateCalculator(`${gvProj.name} - ${gvUnit['Tipe Unit']}`);
          return;
        }
      }
    } else if (calcMode === 'KPR') {
      tabKprBank.className = "flex-1 py-2.5 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 bg-blue-500 text-white shadow-md";
      tenorLabel.textContent = "Lama Cicilan DP ke Developer:";
      calcTenorSelect.innerHTML = `
        <option value="12">12 Bulan</option>
        <option value="15" selected>15 Bulan (Standar Cipta)</option>
        <option value="18">18 Bulan</option>
        <option value="24">24 Bulan</option>
      `;
      dpControlContainer.classList.remove('hidden');
      setDpMode('CUSTOM');
    }

    updateCalculator();
  }

  tabCashBertahap60.addEventListener('click', () => setCalculatorMode('BERTAHAP_60'));
  tabCashBertahap72.addEventListener('click', () => setCalculatorMode('BERTAHAP_72'));
  tabKprBank.addEventListener('click', () => setCalculatorMode('KPR'));

  dpModeZeroBtn.addEventListener('click', () => setDpMode('ZERO'));
  dpModeCustomBtn.addEventListener('click', () => setDpMode('CUSTOM'));

  function setDpMode(mode) {
    dpMode = mode;
    if (dpMode === 'ZERO') {
      dpModeZeroBtn.className = "px-2.5 py-1 rounded font-bold transition bg-emerald-600 text-white text-[11px]";
      dpModeCustomBtn.className = "px-2.5 py-1 rounded font-bold transition text-slate-400 hover:text-white text-[11px]";
      dpSliderBox.classList.add('hidden');
      dpDescText.textContent = "Tanpa Uang Muka (Hanya bayar Booking Fee, sisa dibagi rata ke tenor)";
      rowNetDp.classList.add('hidden');
    } else {
      dpModeCustomBtn.className = "px-2.5 py-1 rounded font-bold transition bg-amber-500 text-slate-950 text-[11px]";
      dpModeZeroBtn.className = "px-2.5 py-1 rounded font-bold transition text-slate-400 hover:text-white text-[11px]";
      dpSliderBox.classList.remove('hidden');
      dpDescText.textContent = "Bayar DP untuk meringankan cicilan pokok bulanan";
      rowNetDp.classList.remove('hidden');
    }
    updateCalculator();
  }

  // 7. Master Synchronized Calculation Engine with Live 3-Way Comparison
  function updateCalculator(customUnitTitle = '') {
    const basePrice = parseFloat(calcPriceInput.value) || 0;
    const booking = parseFloat(calcBookingSelect.value) || 0;
    const tenor = parseInt(calcTenorSelect.value) || (calcMode === 'BERTAHAP_72' ? 72 : 60);
    const dpPercent = parseInt(calcDpSlider.value) || 20;

    const isGreenville = currentCalculatorProject && (currentCalculatorProject.toLowerCase().includes('green ville') || currentCalculatorProject.toLowerCase().includes('greenville'));

    calcPriceFormatted.textContent = formatIDR(basePrice);

    // --- Benchmark 1: Skema Cash Bertahap 60x (Base) ---
    const p60 = basePrice;
    const sisa60 = Math.max(0, p60 - booking);
    const cicilan60 = Math.round(sisa60 / 60);

    // --- Benchmark 2: Skema Cash Bertahap 72x (Khusus Cipta Green Ville) ---
    const sisa72 = Math.round(Math.max(0, basePrice - booking) * 1.06);
    const p72 = booking + sisa72;
    const diff72 = p72 - p60;
    const cicilan72 = Math.round(sisa72 / 72);
    const hemat72 = Math.max(0, cicilan60 - cicilan72);

    // --- Benchmark 3: Skema KPR Bank (DP dicicil 15x ke developer, bunga bank 7% p.a 15 tahun) ---
    const pKpr = basePrice;
    const totalDpKpr = Math.round(pKpr * (dpPercent / 100));
    const netDpKpr = Math.max(0, totalDpKpr - booking);
    const cicilanDpKpr = Math.round(netDpKpr / 15);
    const plafonKpr = Math.max(0, pKpr - totalDpKpr);
    const rBank = 0.07 / 12;
    const nBank = 15 * 12;
    const angsuranBankKpr = plafonKpr > 0 ? Math.round(plafonKpr * (rBank * Math.pow(1 + rBank, nBank)) / (Math.pow(1 + rBank, nBank) - 1)) : 0;

    // --- Update Direct Comparison Cards ---
    if (cmpPrice60) cmpPrice60.textContent = formatIDR(p60);
    if (cmpBooking60) cmpBooking60.textContent = formatIDR(booking);
    if (cmpCicilan60) cmpCicilan60.textContent = formatIDR(cicilan60) + '/bln';

    // Card 72x: Display calculation ONLY for Cipta Green Ville
    if (cmpPrice72) {
      if (isGreenville) {
        cmpPrice72.textContent = formatIDR(p72);
        if (cmpDiff72) cmpDiff72.textContent = `Selisih: +${formatIDR(diff72)} (+6% Tenor 6 Thn)`;
        if (cmpBooking72) cmpBooking72.textContent = formatIDR(booking);
        if (cmpCicilan72) cmpCicilan72.textContent = formatIDR(cicilan72) + '/bln';
        if (cmpHemat72) {
          cmpHemat72.textContent = `Hemat ${formatIDR(hemat72)}/bln`;
          cmpHemat72.className = 'text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-1 rounded border border-emerald-500/30 whitespace-nowrap';
        }
      } else {
        cmpPrice72.textContent = '-';
        if (cmpDiff72) cmpDiff72.textContent = 'Khusus Proyek Cipta Green Ville';
        if (cmpBooking72) cmpBooking72.textContent = '-';
        if (cmpCicilan72) cmpCicilan72.textContent = 'Hanya Tersedia di Green Ville';
        if (cmpHemat72) {
          cmpHemat72.textContent = 'Hanya 60x';
          cmpHemat72.className = 'text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded border border-slate-700 whitespace-nowrap';
        }
      }
    }

    if (cmpPriceKpr) cmpPriceKpr.textContent = formatIDR(pKpr);
    if (cmpLabelDpKpr) cmpLabelDpKpr.textContent = `Total DP (${dpPercent}%):`;
    if (cmpTotalDpKpr) cmpTotalDpKpr.textContent = formatIDR(totalDpKpr);
    if (cmpCicilanDpKpr) cmpCicilanDpKpr.textContent = formatIDR(cicilanDpKpr) + '/bln';
    if (cmpPlafonKpr) cmpPlafonKpr.textContent = formatIDR(plafonKpr);
    if (cmpAngsuranBankKpr) cmpAngsuranBankKpr.textContent = formatIDR(angsuranBankKpr) + '/bln';

    // --- Active Highlight Display Box Calculation ---
    let activePrice = basePrice;
    let totalDp = 0;
    let netDp = 0;
    let sisaPokok = 0;
    let monthlyCicilan = 0;

    resMonthlyCicilan.className = "text-2xl xs:text-3xl sm:text-4xl font-extrabold text-white mt-1 text-emerald-400 break-words";

    if (calcMode === 'BERTAHAP_60') {
      activePrice = p60;
      if (dpMode === 'ZERO') {
        badgeCurrentMode.textContent = "Cash Bertahap 60x (DP 0%)";
        badgeCurrentMode.className = "text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30";
        labelMonthlyTitle.textContent = "Cicilan Cash Bertahap per Bulan:";

        totalDp = 0;
        netDp = 0;
        sisaPokok = Math.max(0, activePrice - booking);
        monthlyCicilan = Math.round(sisaPokok / tenor);

        resTenorText.textContent = `selama ${tenor} bulan (${(tenor/12).toFixed(1)} tahun) tanpa bunga`;
        resLabelDp.textContent = "3. Uang Muka (DP):";
        resDpValue.textContent = "Rp 0 (DP 0% / Murni Bertahap)";
        rowNetDp.classList.add('hidden');

        resLabelRemaining.textContent = "4. Sisa Pokok yang Dicicil:";
        resRemainingPrice.textContent = formatIDR(sisaPokok);

        resFormulaVerification.innerHTML = `
          ${formatIDR(booking)} (Booking) + (${tenor} bln × ${formatIDR(monthlyCicilan)}) = <b>${formatIDR(activePrice)}</b>
        `;
      } else {
        badgeCurrentMode.textContent = `Cash Bertahap 60x (DP ${dpPercent}%)`;
        badgeCurrentMode.className = "text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30";
        labelMonthlyTitle.textContent = "Cicilan Pokok Bertahap per Bulan:";

        totalDp = Math.round(activePrice * (dpPercent / 100));
        netDp = Math.max(0, totalDp - booking);
        sisaPokok = Math.max(0, activePrice - totalDp);
        monthlyCicilan = Math.round(sisaPokok / tenor);

        dpPercentValue.textContent = `${dpPercent}% (${formatIDR(totalDp)})`;
        resTenorText.textContent = `selama ${tenor} bulan (setelah pelunasan DP)`;
        resLabelDp.textContent = `3. Total Uang Muka (${dpPercent}%):`;
        resDpValue.textContent = formatIDR(totalDp);
        rowNetDp.classList.remove('hidden');
        resNetDpValue.textContent = formatIDR(netDp);

        resLabelRemaining.textContent = "4. Sisa Pokok Harga Properti:";
        resRemainingPrice.textContent = formatIDR(sisaPokok);

        resFormulaVerification.innerHTML = `
          ${formatIDR(booking)} (Booking) + ${formatIDR(netDp)} (Sisa DP) + (${tenor} bln × ${formatIDR(monthlyCicilan)}) = <b>${formatIDR(activePrice)}</b>
        `;
      }
    } else if (calcMode === 'BERTAHAP_72') {
      if (!isGreenville) {
        // Warning when 72x is selected for non-Greenville project
        badgeCurrentMode.textContent = "Cash Bertahap 72x (Khusus Cipta Green Ville)";
        badgeCurrentMode.className = "text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30";
        labelMonthlyTitle.textContent = "Catatan Skema Cash Bertahap 72x:";
        resMonthlyCicilan.textContent = "Hanya di Green Ville";
        resMonthlyCicilan.className = "text-xl sm:text-2xl font-bold text-amber-400 mt-1";
        resTenorText.textContent = `Unit proyek ${currentCalculatorProject} hanya berlaku tenor bertahap maksimal 60x (5 tahun).`;
        resLabelDp.textContent = "3. Status Skema 72x:";
        resDpValue.textContent = "Tidak Tersedia di Proyek Ini";
        rowNetDp.classList.add('hidden');
        resLabelRemaining.textContent = "4. Rekomendasi Pilihan:";
        resRemainingPrice.textContent = "Gunakan Cash Bertahap 60x atau KPR";
        resFormulaVerification.innerHTML = `
          <span class="text-amber-300 font-semibold block">⚠️ Skema Cash Bertahap 72x hanya berlaku eksklusif untuk proyek <b>Cipta Green Ville</b>.</span>
          <span class="text-slate-300 text-[11px] block mt-1">Silakan ganti tab ke <b>Cash Bertahap 60x</b> atau pilih unit Cipta Green Ville pada menu dropdown.</span>
        `;
        monthlyCicilan = 0;
        activePrice = basePrice;
      } else {
        // Valid 72x calculation for Cipta Green Ville
        activePrice = p72;
        if (dpMode === 'ZERO') {
          badgeCurrentMode.textContent = "Cash Bertahap 72x (Khusus Green Ville)";
          badgeCurrentMode.className = "text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
          labelMonthlyTitle.textContent = "Cicilan Cash Bertahap 72x per Bulan:";

          totalDp = 0;
          netDp = 0;
          sisaPokok = sisa72;
          monthlyCicilan = cicilan72;

          resTenorText.textContent = `selama 72 bulan (6 tahun) • Hemat ${formatIDR(hemat72)}/bulan dibanding tenor 60x`;
          resLabelDp.textContent = "3. Uang Muka (DP):";
          resDpValue.textContent = "Rp 0 (DP 0% / Murni Bertahap 72x)";
          rowNetDp.classList.add('hidden');

          resLabelRemaining.textContent = "4. Sisa Pokok yang Dicicil (Markup +6%):";
          resRemainingPrice.textContent = formatIDR(sisaPokok);

          resFormulaVerification.innerHTML = `
            ${formatIDR(booking)} (Booking) + (72 bln × ${formatIDR(monthlyCicilan)}) = <b>${formatIDR(activePrice)}</b><br>
            <span class="text-emerald-300 font-semibold block mt-1">✓ Penghematan cicilan: ${formatIDR(hemat72)}/bulan dibanding tenor 60x (Rp ${formatIDR(cicilan60)}/bln)</span>
          `;
        } else {
          badgeCurrentMode.textContent = `Cash Bertahap 72x (DP ${dpPercent}%)`;
          badgeCurrentMode.className = "text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
          labelMonthlyTitle.textContent = "Cicilan Pokok Bertahap 72x per Bulan:";

          totalDp = Math.round(activePrice * (dpPercent / 100));
          netDp = Math.max(0, totalDp - booking);
          sisaPokok = Math.max(0, activePrice - totalDp);
          monthlyCicilan = Math.round(sisaPokok / 72);

          dpPercentValue.textContent = `${dpPercent}% (${formatIDR(totalDp)})`;
          resTenorText.textContent = `selama 72 bulan (setelah pelunasan DP)`;
          resLabelDp.textContent = `3. Total Uang Muka (${dpPercent}%):`;
          resDpValue.textContent = formatIDR(totalDp);
          rowNetDp.classList.remove('hidden');
          resNetDpValue.textContent = formatIDR(netDp);

          resLabelRemaining.textContent = "4. Sisa Pokok yang Dicicil (72x):";
          resRemainingPrice.textContent = formatIDR(sisaPokok);

          resFormulaVerification.innerHTML = `
            ${formatIDR(booking)} (Booking) + ${formatIDR(netDp)} (Sisa DP) + (72 bln × ${formatIDR(monthlyCicilan)}) = <b>${formatIDR(activePrice)}</b>
          `;
        }
      }
    } else {
      // SKEMA KPR BANK
      activePrice = pKpr;
      badgeCurrentMode.textContent = `Skema KPR Bank (DP ${dpPercent}%)`;
      badgeCurrentMode.className = "text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30";
      labelMonthlyTitle.textContent = "Cicilan DP ke Developer per Bulan:";

      totalDp = totalDpKpr;
      netDp = netDpKpr;
      sisaPokok = plafonKpr;
      monthlyCicilan = Math.round(netDp / tenor);

      dpPercentValue.textContent = `${dpPercent}% (${formatIDR(totalDp)})`;
      resTenorText.textContent = `dicicil selama ${tenor} bulan ke Developer sebelum akad KPR`;
      resLabelDp.textContent = `3. Total Uang Muka (${dpPercent}%):`;
      resDpValue.textContent = formatIDR(totalDp);
      rowNetDp.classList.remove('hidden');
      resNetDpValue.textContent = `${formatIDR(netDp)} (dicicil ${tenor}x)`;

      resLabelRemaining.textContent = "4. Plafon KPR (Diajukan ke Bank):";
      resRemainingPrice.textContent = formatIDR(sisaPokok);

      resFormulaVerification.innerHTML = `
        ${formatIDR(booking)} (Booking) + (${tenor} bln × ${formatIDR(monthlyCicilan)} DP) + ${formatIDR(sisaPokok)} (Plafon Bank) = <b>${formatIDR(activePrice)}</b><br>
        <span class="text-amber-300 font-semibold block mt-1">Estimasi Angsuran KPR Bank (15 Thn @7%): ${formatIDR(angsuranBankKpr)}/bulan</span>
      `;
    }

    if (calcMode !== 'BERTAHAP_72' || isGreenville) {
      resMonthlyCicilan.textContent = formatIDR(monthlyCicilan);
    }
    resTotalPrice.textContent = formatIDR(activePrice);
    resBookingFee.textContent = formatIDR(booking);

    // Update Waterfall Bar widths
    const pctBooking = activePrice > 0 ? (booking / activePrice) * 100 : 0;
    const pctDp = activePrice > 0 ? (netDp / activePrice) * 100 : 0;
    const pctRem = activePrice > 0 ? (sisaPokok / activePrice) * 100 : 0;

    barBooking.style.width = `${Math.min(100, Math.max(1, pctBooking))}%`;
    barDp.style.width = `${Math.min(100, pctDp)}%`;
    barRemaining.style.width = `${Math.min(100, pctRem)}%`;
    waterfallTotalLabel.textContent = `100% Sinkron (${formatIDR(activePrice)})`;

    // Estimate First Installment Date (H+14)
    const firstDate = new Date();
    firstDate.setDate(firstDate.getDate() + 14);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    resFirstInstallmentDate.textContent = firstDate.toLocaleDateString('id-ID', options);

    // WhatsApp Message
    const unitText = customUnitTitle ? `untuk unit *${customUnitTitle}*` : (currentCalculatorProject ? `proyek *${currentCalculatorProject}*` : '');
    let modeText = '';
    if (calcMode === 'BERTAHAP_60') {
      modeText = dpMode === 'ZERO' ? 'Cash Bertahap 60x Tanpa DP' : `Cash Bertahap 60x (DP ${dpPercent}%)`;
    } else if (calcMode === 'BERTAHAP_72') {
      modeText = dpMode === 'ZERO' ? 'Cash Bertahap 72x (Khusus Cipta Green Ville)' : `Cash Bertahap 72x (DP ${dpPercent}%)`;
    } else {
      modeText = `Skema KPR Bank (DP ${dpPercent}%, Cicil DP ${tenor}x)`;
    }
    
    let comparisonText = `Perbandingan Skema:\n- 60x: ${formatIDR(p60)} (Cicilan: ${formatIDR(cicilan60)}/bln)\n`;
    if (isGreenville) {
      comparisonText += `- 72x: ${formatIDR(p72)} (Cicilan: ${formatIDR(cicilan72)}/bln - Hemat ${formatIDR(hemat72)}/bln)\n`;
    } else {
      comparisonText += `- 72x: Tidak tersedia (Hanya berlaku di Cipta Green Ville)\n`;
    }
    comparisonText += `- KPR Bank: DP 15x @${formatIDR(cicilanDpKpr)}/bln, Bank 15 Thn @${formatIDR(angsuranBankKpr)}/bln`;

    const msg = encodeURIComponent(
      `Halo Cipta Group, saya ingin konsultasi simulasi pembiayaan ${unitText}:\n` +
      `• Pilihan Skema: ${modeText}\n` +
      `• Total Harga Jual: ${formatIDR(activePrice)}\n` +
      `• Booking Fee (UTJ): ${formatIDR(booking)}\n` +
      `• Uang Muka (DP): ${formatIDR(totalDp)}\n` +
      `• Sisa Pokok / Plafon: ${formatIDR(sisaPokok)}\n` +
      `• Estimasi Cicilan: ${formatIDR(monthlyCicilan)}/bulan\n\n` +
      `${comparisonText}\n\n` +
      `Mohon info ketersediaan unit dan jadwal visit lokasi. Terima kasih!`
    );
    calcWaBtn.onclick = () => {
      window.open(`https://wa.me/628117700000?text=${msg}`, '_blank');
    };
  }

  calcPriceInput.addEventListener('input', () => updateCalculator());
  calcBookingSelect.addEventListener('change', () => updateCalculator());
  calcTenorSelect.addEventListener('change', () => updateCalculator());
  calcDpSlider.addEventListener('input', () => {
    dpPercentValue.textContent = `${calcDpSlider.value}%`;
    updateCalculator();
  });

  // Mobile Menu Drawer Handler
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenuDrawer = document.getElementById('mobileMenuDrawer');
  const mobileMenuIcon = document.getElementById('mobileMenuIcon');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  if (mobileMenuBtn && mobileMenuDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      const isClosed = mobileMenuDrawer.classList.contains('hidden');
      if (isClosed) {
        mobileMenuDrawer.classList.remove('hidden');
        if (mobileMenuIcon) mobileMenuIcon.setAttribute('data-lucide', 'x');
      } else {
        mobileMenuDrawer.classList.add('hidden');
        if (mobileMenuIcon) mobileMenuIcon.setAttribute('data-lucide', 'menu');
      }
      lucide.createIcons();
    });

    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuDrawer.classList.add('hidden');
        if (mobileMenuIcon) mobileMenuIcon.setAttribute('data-lucide', 'menu');
        lucide.createIcons();
      });
    });
  }

  // Floating Back to Top Button Handler
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 350) {
        backToTopBtn.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-3');
        backToTopBtn.classList.add('opacity-100', 'translate-y-0');
      } else {
        backToTopBtn.classList.add('opacity-0', 'pointer-events-none', 'translate-y-3');
        backToTopBtn.classList.remove('opacity-100', 'translate-y-0');
      }
    });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Initial Run - default to Cipta Green Ville for showcase
  const gv = data.projects.find(p => p.name.toLowerCase().includes('green ville') || p.name.toLowerCase().includes('greenville'));
  if (gv && gv.units && gv.units.length > 0) {
    currentCalculatorProject = gv.name;
    calcPriceInput.value = gv.units[0]['Harga Jual (Rp)'];
    calcBookingSelect.value = gv.units[0]['Booking Fee / UTJ (Rp)'];
  }

  applyFilters();
  renderMasterTable();
  updateCalculator();
});
