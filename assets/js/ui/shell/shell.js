/**
 * Mounts layout chrome used on every page:
 *   #j-header  — shared template
 *   #j-dock    — bottom nav
 */
import { PHONE_TEL, PHONE_DISPLAY, ICON_192 } from '../../core/config.js';
import { replaceMount } from '../../core/dom.js';
import { applyLang, normalizeLang, readStoredLang } from '../../i18n/apply.js';
import {
  buildDrawerLangOptionsHtml,
  buildHeaderLangListHtml,
  wireLangSelects,
  wireHeaderLangMenu,
} from './language-menu.js';
import { initDrawer } from './drawer.js';
import { dockTpl, markActiveNav } from './dock.js';

const langChevronSvg = `<svg class="header__lang-chevron" width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2.5 4.25L6 7.75l3.5-3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const phoneSvg = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8.5 4.5c.8 0 1.5.6 1.7 1.4l.5 2.2c.2.7 0 1.4-.5 1.9l-1.2 1.2a12 12 0 006.1 6.1l1.2-1.2c.5-.5 1.2-.7 1.9-.5l2.2.5c.8.2 1.4.9 1.4 1.7v1.4c0 1-1 1.9-2 1.7A19 19 0 013 5.5c-.2-1 .7-2 1.7-2h1.8z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>`;
const drawerBackChevron = `<svg class="drawer__back-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const headerLangListHtml = buildHeaderLangListHtml();
const langOptionsDrawer = buildDrawerLangOptionsHtml();

function headerTpl() {
  return /* html */ `
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
}

function fillYear() {
  const stamp = String(new Date().getFullYear());
  document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = stamp));
}

export function initShell() {
  replaceMount('j-header', headerTpl());

  replaceMount('j-dock', dockTpl());

  applyLang(normalizeLang(readStoredLang()));
  initDrawer();
  wireLangSelects();
  wireHeaderLangMenu();
  fillYear();
  markActiveNav();
}
