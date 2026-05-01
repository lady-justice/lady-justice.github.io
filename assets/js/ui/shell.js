/**
 * Mounts the three layout chrome regions used on every page:
 *   #j-header  → top bar + slide-in drawer + backdrop
 *   #j-footer  → footer (full or minimal, controlled by data-variant)
 *   #j-dock    → bottom mobile dock (book/studio CTAs)
 *
 * Pages declare which they want via empty `<div id="…">` mount points
 * (omit `#j-footer` / `#j-dock` on home, schedule, book, contact, studio).
 * Drawer interactivity is wired here; nothing else listens for nav events.
 */
import {
  PHONE_TEL,
  PHONE_DISPLAY,
  EMAIL,
  ICON_192,
  INSTAGRAM_ARTIST,
  INSTAGRAM_STUDIO,
  STUDIO_ADDRESS,
  STUDIO_MAPS_QUERY,
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

const arrowSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const phoneSvg = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8.5 4.5c.8 0 1.5.6 1.7 1.4l.5 2.2c.2.7 0 1.4-.5 1.9l-1.2 1.2a12 12 0 006.1 6.1l1.2-1.2c.5-.5 1.2-.7 1.9-.5l2.2.5c.8.2 1.4.9 1.4 1.7v1.4c0 1-1 1.9-2 1.7A19 19 0 013 5.5c-.2-1 .7-2 1.7-2h1.8z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>`;
const igSvg = `<svg class="footer__social-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" stroke-width="1.4"/><circle cx="12" cy="12" r="3.75" stroke="currentColor" stroke-width="1.4"/><circle cx="17.25" cy="6.75" r="0.9" fill="currentColor"/></svg>`;

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
    <a class="drawer__cta" href="book.html">
      <span data-i18n="nav_book_now">Book Now</span>
      <span class="drawer__cta-arrow" aria-hidden="true">${arrowSvg}</span>
    </a>
  </div>
</aside>`;

const footerColumns = () => /* html */ `
<div class="footer__panel">
  <div class="footer__cols">
    <section class="footer__col">
      <h3 class="footer__col-title" data-i18n="footer_social">Socials</h3>
      <ul class="footer__list footer__list--ig">
        <li>
          <a class="footer__social" href="${INSTAGRAM_ARTIST}" target="_blank" rel="noopener noreferrer" data-i18n-attr="title:footer_ig_lj_title">
            ${igSvg}<span data-i18n="footer_social_lj_label">Instagram</span>
          </a>
          <span class="footer__note" data-i18n="footer_artist">artist</span>
        </li>
        <li>
          <a class="footer__social" href="${INSTAGRAM_STUDIO}" target="_blank" rel="noopener noreferrer" data-i18n-attr="title:footer_ig_j_title">
            ${igSvg}<span>Justice Fitness &amp; Dance</span>
          </a>
          <span class="footer__note" data-i18n="footer_studio">studio</span>
        </li>
      </ul>
    </section>
    <section class="footer__col">
      <h3 class="footer__col-title" data-i18n="footer_contacts">Contacts</h3>
      <ul class="footer__list">
        <li><a href="mailto:${EMAIL}">${EMAIL}</a></li>
        <li><a href="tel:${PHONE_TEL}">${PHONE_DISPLAY}</a></li>
      </ul>
    </section>
  </div>
</div>`;

const footerBar = () => /* html */ `
<div class="footer__bar">
  <a class="footer__brand" href="index.html#site-top">
    <span class="footer__brand-mark" aria-hidden="true">
      <img class="footer__brand-img" src="${ICON_192}" alt="" width="192" height="192" data-i18n-attr="alt:brand_alt" decoding="async">
    </span>
    <span data-i18n="brand_name">JusticeApp</span>
  </a>
  <p class="footer__copy">© <span data-year></span> <span data-i18n="app_copyright_name">JusticeApp</span></p>
  <a class="footer__top" href="index.html#site-top" data-i18n-attr="aria-label:footer_back_top">↑</a>
</div>`;

const footerTouch = () => /* html */ `
<div id="site-footer-touch" class="footer__touch">
  <p class="footer__eyebrow" data-i18n="footer_touch_eyebrow">Bookings, studio visits, or a quick hello</p>
  <h2 class="footer__title">
    <span data-i18n="footer_touch_line" data-i18n-attr="aria-label:footer_touch_aria">Get in touch</span>
  </h2>
</div>`;

function footerTpl(variant) {
  if (variant === 'minimal') {
    return /* html */ `<footer class="footer footer--minimal">${footerBar()}</footer>`;
  }
  return /* html */ `<footer class="footer">
    ${footerTouch()}
    ${footerColumns()}
    ${footerBar()}
  </footer>`;
}

const dockTpl = () => /* html */ `
<nav class="dock" data-i18n-attr="aria-label:dock_book_aria">
  <a class="dock__btn dock__btn--solo" href="book.html#book-individual">
    <span class="dock__icon" aria-hidden="true">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.25" stroke="currentColor" stroke-width="1.4"/><path d="M6.5 20.5v-1.2c0-2.1 2.2-3.8 5.5-3.8s5.5 1.7 5.5 3.8v1.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
    </span>
    <span class="dock__label" data-i18n="dock_book_indiv">Book Private</span>
    <span class="dock__go" aria-hidden="true">${arrowSvg}</span>
  </a>
  <a class="dock__btn dock__btn--duo" href="book.html#book-studio">
    <span class="dock__icon" aria-hidden="true">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="8.5" cy="7.5" r="2.35" stroke="currentColor" stroke-width="1.2"/><circle cx="15.5" cy="7.5" r="2.35" stroke="currentColor" stroke-width="1.2"/><path d="M4 19.5v-.9c0-1.55 1.55-2.8 4.5-2.8M20 19.5v-.9c0-1.55-1.55-2.8-4.5-2.8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M9 19.5v-1.1c0-1.2 1.1-2.15 3-2.15s3 .95 3 2.15v1.1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
    </span>
    <span class="dock__label" data-i18n="dock_book_studio">Rent Studio</span>
    <span class="dock__go" aria-hidden="true">${arrowSvg}</span>
  </a>
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
}

function wireDrawer() {
  const toggle = document.getElementById('j-nav-toggle');
  const drawer = document.getElementById('j-drawer');
  const backdrop = document.getElementById('j-backdrop');
  if (!toggle || !drawer || !backdrop) return;

  let open = false;
  const setOpen = (next) => {
    open = next;
    document.body.classList.toggle('drawer-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    toggle.setAttribute('aria-expanded', String(open));
    backdrop.setAttribute('aria-hidden', String(!open));
    if (open) drawer.removeAttribute('inert');
    else drawer.setAttribute('inert', '');
    const s = getStrings(document.documentElement.getAttribute('data-lang'));
    toggle.setAttribute('aria-label', open ? s.nav_menu_close : s.nav_menu_open);
  };

  toggle.addEventListener('click', () => setOpen(!open));
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
 * Mounts header, footer, dock based on which mount nodes exist in HTML.
 * Then applies i18n once and wires interactivity.
 */
export function initShell() {
  replaceMount('j-header', headerTpl());

  const footerNode = document.getElementById('j-footer');
  if (footerNode) {
    const variant = footerNode.dataset.variant === 'minimal' ? 'minimal' : 'full';
    footerNode.outerHTML = footerTpl(variant);
  }

  replaceMount('j-dock', dockTpl());

  applyLang(normalizeLang(readStoredLang()));
  wireDrawer();
  wireLangSelects();
  wireHeaderLangMenu();
  fillYear();
  markActiveNav();
}
