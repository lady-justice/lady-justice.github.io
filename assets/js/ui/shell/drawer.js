import { getStrings, normalizeLang } from '../../i18n/apply.js';

export function initDrawer() {
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
    const s = getStrings(normalizeLang(document.documentElement.getAttribute('data-lang')));
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
