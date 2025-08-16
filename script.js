const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTIZDBgdpifoBo-nowTeGDgf4nr_N8RMqtmQTgUZfW-Eet4NF26bprwnCNNIkUg4XZoRtkGjty7Lltz/pub?output=csv";
const FORM_LOST_URL = "https://forms.gle/DTwq9ViT6AW7a8dK8";
const FORM_FOUND_URL = "https://forms.gle/7N9KFK6QZqMp8oCm7";
// Hook up report buttons (hidden if no links provided)
const lostBtn = document.getElementById('btnReportLost');
const foundBtn = document.getElementById('btnReportFound');
if (FORM_LOST_URL) { lostBtn.href = FORM_LOST_URL; } else { lostBtn.style.display = 'none'; }
if (FORM_FOUND_URL) { foundBtn.href = FORM_FOUND_URL; } else { foundBtn.style.display = 'none'; }

// Year
document.getElementById('year').textContent = new Date().getFullYear();

// Filters state
let STATE = {
    filter: 'all',
    q: '',
    sort: 'date-desc',
    rows: [],
};

// Minimal CSV parser (RFC 4180-ish)
function parseCSV(text) {
    const rows = [];
    let cur = '', row = [], inQuotes = false;
    for (let i = 0; i < text.length; i++) {
        const c = text[i], n = text[i + 1];
        if (inQuotes) {
            if (c === '"' && n === '"') { cur += '"'; i++; }
            else if (c === '"') { inQuotes = false; }
            else { cur += c; }
        } else {
            if (c === '"') inQuotes = true;
            else if (c === ',') { row.push(cur); cur = ''; }
            else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
            else if (c === '\r') { /* skip */ }
            else { cur += c; }
        }
    }
    if (cur.length || row.length) { row.push(cur); rows.push(row); }
    return rows;
}

function normalizeHeader(h) { return (h || '').trim().toLowerCase(); }

function csvToObjects(csvText) {
    const rows = parseCSV(csvText);
    if (!rows.length) return [];
    const header = rows[0].map(normalizeHeader);
    const idx = {
        status: header.indexOf('status'),
        title: header.indexOf('title'),
        description: header.indexOf('description'),
        location: header.indexOf('location'),
        date: header.indexOf('date'),
        reporter: header.indexOf('reporter'),
        contact: header.indexOf('contact'),
    };
    return rows.slice(1).filter(r => r.some(Boolean)).map(r => ({
        status: (r[idx.status] || '').trim(),
        title: (r[idx.title] || '').trim(),
        description: (r[idx.description] || '').trim(),
        location: (r[idx.location] || '').trim(),
        date: (r[idx.date] || '').trim(),
        reporter: (r[idx.reporter] || '').trim(),
        contact: (r[idx.contact] || '').trim(),
    }));
}

function parseDateLike(s) {
    if (!s) return null;
    const tryISO = Date.parse(s);
    if (!Number.isNaN(tryISO)) return new Date(tryISO);
    // Try M/D/YYYY
    const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
    if (m) {
        const [_, mm, dd, yyyy] = m;
        return new Date(Number(yyyy.length === 2 ? ('20' + yyyy) : yyyy), Number(mm) - 1, Number(dd));
    }
    return null;
}

function compare(a, b) {
    switch (STATE.sort) {
        case 'title-asc': return a.title.localeCompare(b.title);
        case 'title-desc': return b.title.localeCompare(a.title);
        case 'date-asc': {
            const da = parseDateLike(a.date) || new Date(0);
            const db = parseDateLike(b.date) || new Date(0);
            return da - db;
        }
        case 'date-desc':
        default: {
            const da = parseDateLike(a.date) || new Date(0);
            const db = parseDateLike(b.date) || new Date(0);
            return db - da;
        }
    }
}

function matches(item) {
    const f = STATE.filter;
    if (f !== 'all' && item.status.toLowerCase() !== f) return false;
    if (!STATE.q) return true;
    const q = STATE.q.toLowerCase();
    return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.reporter.toLowerCase().includes(q) ||
        item.contact.toLowerCase().includes(q)
    );
}

function badge(status) {
    const s = (status || '').toLowerCase();
    const cls = s === 'found' ? 'found' : 'lost';
    const txt = s === 'found' ? 'Found' : 'Lost';
    return `<span class="badge ${cls}">● ${txt}</span>`;
}

function render() {
    const container = document.getElementById('board');
    const empty = document.getElementById('empty');
    container.innerHTML = '';
    const items = STATE.rows.filter(matches).sort(compare);
    if (!items.length) {
        empty.hidden = false; return;
    } else empty.hidden = true;

    for (const it of items) {
        const el = document.createElement('article');
        el.className = 'card';
        el.innerHTML = `
          <div class="actions" style="justify-content: space-between;">
            ${badge(it.status)}
            <button class="btn" data-open>View</button>
          </div>
          <div class="title-sm">${escapeHTML(it.title || '(No title)')}</div>
          <div class="muted">${escapeHTML(it.description || '')}</div>
          <div class="meta">
            <div><b>Location</b>${escapeHTML(it.location || '')}</div>
            <div><b>Date</b>${escapeHTML(it.date || '')}</div>
            <div><b>Reporter</b>${escapeHTML(it.reporter || '')}</div>
            <div><b>Contact</b>${escapeHTML(it.contact || '')}</div>
          </div>
        `;
        el.querySelector('[data-open]').addEventListener('click', () => openModal(it));
        container.appendChild(el);
    }
}

function escapeHTML(s) {
    return (s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }[c]));
}

// Modal
const modal = document.getElementById('itemModal');
modal.querySelector('.close').addEventListener('click', () => modal.close());
modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });
function openModal(it) {
    document.getElementById('modalTitle').textContent = it.title || '';
    document.getElementById('modalDesc').textContent = it.description || '';
    document.getElementById('modalStatus').textContent = it.status || '';
    document.getElementById('modalLocation').textContent = it.location || '';
    document.getElementById('modalDate').textContent = it.date || '';
    document.getElementById('modalReporter').textContent = it.reporter || '';
    document.getElementById('modalContact').textContent = it.contact || '';
    if (typeof modal.showModal === 'function') modal.showModal(); else alert(`${it.title}\n\n${it.description}`);
}

// Data load with tiny cache to avoid rate limits on GitHub Pages refreshes
async function loadCSV() {
    if (!SHEET_CSV_URL || !/^https:\/\//i.test(SHEET_CSV_URL)) {
        console.warn('Configure SHEET_CSV_URL in the script header.');
        document.getElementById('board').innerHTML = `<div class="empty">⚠️ Set <b>SHEET_CSV_URL</b> in the script to your published Google Sheet CSV link.</div>`;
        return;
    }
    const cacheKey = 'lf_cache_v1';
    const cache = JSON.parse(localStorage.getItem(cacheKey) || 'null');
    const now = Date.now();
    if (cache && (now - cache.t < 60_000) && cache.url === SHEET_CSV_URL) {
        STATE.rows = cache.rows; render(); return;
    }
    const res = await fetch(SHEET_CSV_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch CSV: ' + res.status);
    const text = await res.text();
    const rows = csvToObjects(text);
    STATE.rows = rows;
    localStorage.setItem(cacheKey, JSON.stringify({ t: now, url: SHEET_CSV_URL, rows }));
    render();
}

// Controls wiring
document.getElementById('q').addEventListener('input', (e) => { STATE.q = e.target.value.trim(); render(); });
document.getElementById('clear').addEventListener('click', () => { document.getElementById('q').value = ''; STATE.q = ''; render(); });
document.querySelectorAll('.chip').forEach(ch => ch.addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    ch.classList.add('active'); STATE.filter = ch.dataset.filter; render();
}));
document.getElementById('sort').addEventListener('change', (e) => { STATE.sort = e.target.value; render(); });

document.getElementById('btnView').addEventListener('click', () => {
    if (!SHEET_CSV_URL) return;
    const sheetUrl = SHEET_CSV_URL.replace(/\?.*$/, '');
    window.open(sheetUrl, '_blank', 'noopener');
});

// Kickoff
loadCSV().catch(err => {
    console.error(err);
    document.getElementById('board').innerHTML = `<div class="empty">Error: ${escapeHTML(err.message)}. Make sure the sheet is published to the web and accessible to anyone with the link.</div>`;
});
