import {
  DEFAULT_LANG,
  LANG_STORAGE_KEY,
  LANG_LEGACY_KEYS,
  SUPPORTED_LANGS,
} from '../config.js';
import { STRINGS } from './strings.js';

export function normalizeLang(code) {
  return SUPPORTED_LANGS.includes(code) ? code : DEFAULT_LANG;
}

export function getStrings(lang) {
  return STRINGS[normalizeLang(lang)];
}

export function readStoredLang() {
  try {
    const v = localStorage.getItem(LANG_STORAGE_KEY);
    if (v) return normalizeLang(v);
    for (const legacy of LANG_LEGACY_KEYS) {
      const old = localStorage.getItem(legacy);
      if (old) {
        localStorage.setItem(LANG_STORAGE_KEY, normalizeLang(old));
        localStorage.removeItem(legacy);
        return normalizeLang(old);
      }
    }
  } catch (_) {}
  return DEFAULT_LANG;
}

function storeLang(lang) {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch (_) {}
}

function applyMeta(s) {
  const titleEl = document.querySelector('title');
  if (titleEl) {
    const body = document.body;
    titleEl.textContent =
      body?.classList.contains('page--studio') && s.studio_meta_title
        ? s.studio_meta_title
        : body?.classList.contains('page--schedule') && s.schedule_meta_title
          ? s.schedule_meta_title
          : s.meta_title;
  }
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute('content', s.meta_description);
}

function applyMapIframe(lang) {
  const iframe = document.querySelector('.studio-map iframe');
  if (!iframe) return;
  const hl = lang === 'el' ? 'el' : lang === 'ru' ? 'ru' : 'en';
  try {
    const u = new URL(iframe.src);
    u.searchParams.set('hl', hl);
    iframe.src = u.toString();
  } catch (_) {}
}

export function applyLang(lang) {
  const L = normalizeLang(lang);
  const s = getStrings(L);

  document.documentElement.lang = L;
  document.documentElement.setAttribute('data-lang', L);
  storeLang(L);
  applyMeta(s);
  applyMapIframe(L);

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (!key || !(key in s)) return;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.value = s[key];
    } else {
      el.textContent = s[key];
    }
  });

  document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    const spec = el.getAttribute('data-i18n-attr');
    if (!spec) return;
    spec.trim().split(/\s+/).forEach((pair) => {
      const c = pair.indexOf(':');
      if (c < 0) return;
      const attr = pair.slice(0, c).trim();
      const k = pair.slice(c + 1).trim();
      if (attr && k && k in s) el.setAttribute(attr, s[k]);
    });
  });

  document.querySelectorAll('.j-lang-select').forEach((sel) => {
    sel.value = L;
  });

  document.dispatchEvent(new CustomEvent('justice:lang', { detail: { lang: L } }));
}
