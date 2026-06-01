const HISTORY_KEY = 'zipter_history';
const FORM_KEY = 'zipter_form';
const PREFS_KEY = 'zipter_prefs';
const MAX_HISTORY = 10;

function safeGet(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key, value) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable
  }
}

export function getHistory() {
  return safeGet(HISTORY_KEY, []);
}

export function addHistory(item) {
  const list = getHistory().filter((h) => h.id !== item.id);
  const next = [item, ...list].slice(0, MAX_HISTORY);
  safeSet(HISTORY_KEY, next);
  return next;
}

export function deleteHistory(id) {
  const next = getHistory().filter((h) => h.id !== id);
  safeSet(HISTORY_KEY, next);
  return next;
}

export function getFormData() {
  return safeGet(FORM_KEY, { asset: '', income: '', work: '' });
}

export function setFormData(data) {
  safeSet(FORM_KEY, data);
}

export function getPrefsData() {
  return safeGet(PREFS_KEY, { housing: '전월세', homeType: '무관', transport: '대중교통' });
}

export function setPrefsData(data) {
  safeSet(PREFS_KEY, data);
}
