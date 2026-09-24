// Prayer Requests Store — Persisted in localStorage ('2ms_prayers')
// Shared between the public site (app.js) and admin panel (admin.js).

const STORAGE_KEY = '2ms_prayers';

export function getPrayers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (_) {}
  return [];
}

export function savePrayers(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('2ms:prayers:updated', { detail: list }));
  } catch (_) {}
}

export function addPrayer({ name, email, urgency, msg }) {
  const list = getPrayers();
  const entry = {
    id: `pr-${Date.now()}`,
    name: (name || '').trim() || 'Anonymous',
    email: (email || '').trim(),
    urgency: urgency || 'General',
    msg: (msg || '').trim(),
    status: 'New',
    date: new Date().toISOString().split('T')[0]
  };
  list.unshift(entry);
  savePrayers(list);
  return entry;
}

export function deletePrayer(id) {
  const list = getPrayers().filter(p => p.id !== id);
  savePrayers(list);
}
