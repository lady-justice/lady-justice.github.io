/**
 * Mounts layout chrome used on every page:
 *   #j-header  — shared template; visually brand-only bar (cream). Lang + nav links live in the bottom “More” drawer.
 *   #j-dock    — bottom nav (include on every page that needs “More” / drawer access)
 *
 * Pages declare mount points with empty `<div id="…">` — omitted nodes are skipped.
 */
import {
  PHONE_TEL,
  PHONE_DISPLAY,
  ICON_192,
  SUPPORTED_LANGS,
} from '../config.js';
import { applyLang, normalizeLang, readStoredLang, getStrings } from '../i18n/apply.js';

const langOptionsDrawer = SUPPORTED_LANGS.map((code) => {
  const label = code === 'el' ? 'Ελληνικά' : code === 'ru' ? 'Русский' : 'English';
  return `<option value="${code}">${label}</option>`;
}).join('');

const LANG_HEADER_CODE = { en: 'EN', el: 'EL', ru: 'RU' };
const LANG_MENU_LABEL = { en: 'English', el: 'Ελληνικά', ru: 'Русский' };

const headerLangListHtml = SUPPORTED_LANGS.map(
  (code) => /* html */ `
  <li class="header__lang-item" role="none">
    <button type="button" class="header__lang-option" role="option" data-lang="${code}">${LANG_MENU_LABEL[code]}</button>
  </li>`,
).join('');

const langChevronSvg = `<svg class="header__lang-chevron" width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2.5 4.25L6 7.75l3.5-3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const phoneSvg = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8.5 4.5c.8 0 1.5.6 1.7 1.4l.5 2.2c.2.7 0 1.4-.5 1.9l-1.2 1.2a12 12 0 006.1 6.1l1.2-1.2c.5-.5 1.2-.7 1.9-.5l2.2.5c.8.2 1.4.9 1.4 1.7v1.4c0 1-1 1.9-2 1.7A19 19 0 013 5.5c-.2-1 .7-2 1.7-2h1.8z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>`;
const drawerBackChevron = `<svg class="drawer__back-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const headerTpl = () => /* html */ `
<header class="header">
  <a class="brand" href="index.html" data-i18n-attr="aria-label:brand_alt">
    <span class="brand__mark" aria-hidden="true">
      <img class="brand__logo" src="${ICON_192}" width="192" height="192" alt="" decoding="async" />
    </span>
    <span class="brand__text">
      <span class="brand__name" data-i18n="brand_name">JusticeApp</span>
      <span class="brand__tagline" data-i18n="brand_tagline">Fitness &amp; Dance</span>
    </span>
  </a>
  <div class="header__actions">
    <div class="header__lang-wrap">
      <button type="button" id="j-header-lang-btn" class="header__lang-btn" aria-expanded="false" aria-haspopup="listbox" aria-controls="j-header-lang-list" data-i18n-attr="aria-label:lang_aria">
        <span class="header__lang-code">EN</span>
        ${langChevronSvg}
      </button>
      <ul id="j-header-lang-list" class="header__lang-list" role="listbox" hidden>
        ${headerLangListHtml}
      </ul>
    </div>
    <button type="button" id="j-nav-toggle" class="header__menu" aria-expanded="false" aria-controls="j-drawer" data-i18n-attr="aria-label:nav_menu_open">
      <span class="header__menu-bars" aria-hidden="true"><span></span><span></span><span></span></span>
    </button>
  </div>
</header>
<div id="j-backdrop" class="drawer-backdrop" aria-hidden="true"></div>
<aside id="j-drawer" class="drawer" inert>
  <nav class="drawer__nav" data-i18n-attr="aria-label:nav_aria">
    <a href="index.html" data-nav-key="home" data-i18n="nav_home">Home</a>
    <a href="schedule.html" data-nav-key="schedule" data-i18n="nav_schedule">Schedule</a>
    <a href="book.html" data-nav-key="book" data-i18n="nav_book">Book</a>
    <a href="studio.html" data-nav-key="studio" data-i18n="nav_studio">Studio</a>
    <a href="contact.html" data-nav-key="contact" data-i18n="nav_contact">Contact</a>
  </nav>
  <select class="drawer__lang j-lang-select" data-i18n-attr="aria-label:lang_aria" autocomplete="off">${langOptionsDrawer}</select>
  <div class="drawer__extras">
    <a class="drawer__call" href="tel:${PHONE_TEL}">
      <span class="drawer__call-icon" aria-hidden="true">${phoneSvg}</span>
      <span class="drawer__call-copy">
        <span class="drawer__call-number">${PHONE_DISPLAY}</span>
        <span class="drawer__call-hint" data-i18n="nav_drawer_call_hint">Private lessons &amp; bookings</span>
      </span>
    </a>
    <button type="button" class="drawer__back" id="j-drawer-back" data-i18n-attr="aria-label:nav_drawer_back">
      ${drawerBackChevron}
      <span data-i18n="nav_drawer_back">Back</span>
    </button>
  </div>
</aside>`;

const dockHomeIcon = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
const dockScheduleIcon = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="14" rx="2.5" stroke="currentColor" stroke-width="1.6"/><path d="M3.5 10.5h17" stroke="currentColor" stroke-width="1.6"/><path d="M8 3.5V7M16 3.5V7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`;
const dockStudioIcon = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="12" cy="13" r="1.4" fill="currentColor"/></svg>`;
const dockPlusIcon = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>`;

const dockTpl = () => /* html */ `
<nav class="dock" data-i18n-attr="aria-label:dock_nav_aria">
  <a class="dock__btn" href="index.html" data-nav-key="home">
    <span class="dock__icon">${dockHomeIcon}</span>
    <span class="dock__label" data-i18n="dock_home">Home</span>
  </a>
  <a class="dock__btn" href="schedule.html" data-nav-key="schedule">
    <span class="dock__icon">${dockScheduleIcon}</span>
    <span class="dock__label" data-i18n="dock_schedule">Schedule</span>
  </a>
  <a class="dock__btn dock__btn--fab" href="book.html" data-nav-key="book" data-i18n-attr="aria-label:dock_book_center">
    <span class="dock__icon">${dockPlusIcon}</span>
    <span class="dock__label" data-i18n="dock_book_center">Book</span>
  </a>
  <a class="dock__btn" href="studio.html" data-nav-key="studio">
    <span class="dock__icon">${dockStudioIcon}</span>
    <span class="dock__label" data-i18n="dock_studio">Studio</span>
  </a>
  <button type="button" class="dock__btn" id="j-dock-more" data-nav-key="more" aria-haspopup="dialog" aria-controls="j-drawer">
    <span class="dock__icon"><span class="dock__more-dots" aria-hidden="true"><span></span><span></span><span></span></span></span>
    <span class="dock__label" data-i18n="dock_more">More</span>
  </button>
</nav>`;

function replaceMount(id, html) {
  const node = document.getElementById(id);
  if (!node) return null;
  node.outerHTML = html;
  return true;
}

function activeNavKey() {
  const body = document.body;
  if (body.classList.contains('page--home')) return 'home';
  if (body.classList.contains('page--schedule')) return 'schedule';
  if (body.classList.contains('page--book')) return 'book';
  if (body.classList.contains('page--contact')) return 'contact';
  if (body.classList.contains('page--studio')) return 'studio';
  return null;
}

function markActiveNav() {
  const key = activeNavKey();
  if (!key) return;
  document.querySelectorAll('.drawer__nav a').forEach((a) => {
    a.classList.toggle('is-active', a.dataset.navKey === key);
  });
  document.querySelectorAll('.dock .dock__btn').forEach((el) => {
    if (el.dataset.navKey === key) {
      el.setAttribute('aria-current', 'page');
    } else {
      el.removeAttribute('aria-current');
    }
  });
}

function wireDrawer() {
  const toggle = document.getElementById('j-nav-toggle');
  const drawer = document.getElementById('j-drawer');
  const backdrop = document.getElementById('j-backdrop');
  const moreBtn = document.getElementById('j-dock-more');
  if (!drawer || !backdrop) return;

  let open = false;
  const setOpen = (next) => {
    open = next;
    document.body.classList.toggle('drawer-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (toggle) toggle.setAttribute('aria-expanded', String(open));
    if (moreBtn) moreBtn.setAttribute('aria-expanded', String(open));
    backdrop.setAttribute('aria-hidden', String(!open));
    if (open) drawer.removeAttribute('inert');
    else drawer.setAttribute('inert', '');
    const s = getStrings(document.documentElement.getAttribute('data-lang'));
    if (toggle) toggle.setAttribute('aria-label', open ? s.nav_menu_close : s.nav_menu_open);
    if (moreBtn) moreBtn.setAttribute('aria-label', open ? s.nav_menu_close : s.nav_menu_open);
  };

  if (toggle) toggle.addEventListener('click', () => setOpen(!open));
  if (moreBtn) moreBtn.addEventListener('click', () => setOpen(!open));
  document.getElementById('j-drawer-back')?.addEventListener('click', () => setOpen(false));
  backdrop.addEventListener('click', () => setOpen(false));
  drawer.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) setOpen(false);
  });
}

function wireLangSelects() {
  document.querySelectorAll('.j-lang-select').forEach((sel) => {
    sel.addEventListener('change', () => applyLang(sel.value));
  });
}

function syncHeaderLangButton() {
  const lang = normalizeLang(document.documentElement.getAttribute('data-lang'));
  const codeEl = document.querySelector('.header__lang-code');
  if (codeEl) codeEl.textContent = LANG_HEADER_CODE[lang] ?? 'EN';
  document.querySelectorAll('.header__lang-option').forEach((b) => {
    b.setAttribute('aria-selected', String(b.dataset.lang === lang));
  });
}

/** Custom header lang menu — avoids iOS/WebKit bugs with a styled native select. */
function wireHeaderLangMenu() {
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

function fillYear() {
  const stamp = String(new Date().getFullYear());
  document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = stamp));
}

/**
 * Mounts header, dock based on which mount nodes exist in HTML.
 * Then applies i18n once and wires interactivity.
 */
export function initShell() {
  replaceMount('j-header', headerTpl());

  replaceMount('j-dock', dockTpl());

  applyLang(normalizeLang(readStoredLang()));
  wireDrawer();
  wireLangSelects();
  wireHeaderLangMenu();
  fillYear();
  markActiveNav();
}
