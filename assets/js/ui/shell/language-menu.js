import { SUPPORTED_LANGS } from '../../core/config.js';
import { applyLang, normalizeLang } from '../../i18n/apply.js';

export const LANG_HEADER_CODE = { en: 'EN', el: 'EL', ru: 'RU', ka: 'KA' };
export const LANG_MENU_LABEL = {
  en: 'English',
  el: 'Ελληνικά',
  ru: 'Русский',
  ka: 'ქართული',
};

export function buildDrawerLangOptionsHtml() {
  return SUPPORTED_LANGS.map((code) => {
    const label = LANG_MENU_LABEL[code] ?? code.toUpperCase();
    return `<option value="${code}">${label}</option>`;
  }).join('');
}

export function buildHeaderLangListHtml() {
  return SUPPORTED_LANGS.map(
    (code) => /* html */ `
  <li class="header__lang-item" role="none">
    <button type="button" class="header__lang-option" role="option" data-lang="${code}">${LANG_MENU_LABEL[code]}</button>
  </li>`
  ).join('');
}

export function wireLangSelects() {
  document.querySelectorAll('.j-lang-select').forEach((sel) => {
    sel.addEventListener('change', () => applyLang(sel.value));
  });
}

export function syncHeaderLangButton() {
  const lang = normalizeLang(document.documentElement.getAttribute('data-lang'));
  const codeEl = document.querySelector('.header__lang-code');
  if (codeEl) codeEl.textContent = LANG_HEADER_CODE[lang] ?? 'EN';
  document.querySelectorAll('.header__lang-option').forEach((b) => {
    b.setAttribute('aria-selected', String(b.dataset.lang === lang));
  });
}

/** Custom header lang menu — avoids iOS/WebKit bugs with a styled native select. */
export function wireHeaderLangMenu() {
  const wrap = document.querySelector('.header__lang-wrap');
  const btn = document.getElementById('j-header-lang-btn');
  const list = document.getElementById('j-header-lang-list');
  if (!wrap || !btn || !list) return;

  const close = () => {
    list.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
  };

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const next = list.hidden;
    list.hidden = !next;
    btn.setAttribute('aria-expanded', String(next));
  });

  list.querySelectorAll('.header__lang-option').forEach((opt) => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      const code = opt.getAttribute('data-lang');
      if (code) applyLang(code);
      close();
    });
  });

  document.addEventListener('click', (e) => {
    if (!wrap.contains(/** @type {Node} */ (e.target))) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !list.hidden) {
      close();
      btn.focus();
    }
  });

  document.addEventListener('justice:lang', () => syncHeaderLangButton());
  syncHeaderLangButton();
}
