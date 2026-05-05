import { ROUTES } from '../routes/routes.js';
import { markActiveNav } from '../ui/shell/dock.js';
import { applyLang, readStoredLang } from '../i18n/apply.js';

function normalizePath(path) {
  let p = path.trim() || '/';
  if (!p.startsWith('/')) p = `/${p}`;
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p;
}

/** @returns {{ path: string, anchor: string }} */
export function parseHash() {
  const raw = (window.location.hash.slice(1) || '/').trim();
  const hashParts = raw.split('#');
  const pathPart = hashParts[0] || '/';
  const anchor = hashParts[1] || '';
  const pathOnly = pathPart.split('?')[0] || '/';
  return { path: normalizePath(pathOnly), anchor };
}

/** @returns {typeof ROUTES[number]} */
function matchRoute(path) {
  return ROUTES.find((r) => r.path === path) ?? ROUTES[0];
}

let pageController = new AbortController();

function scrollToAnchor(id) {
  if (!id) return;
  requestAnimationFrame(() => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function handleRoute() {
  pageController.abort();
  pageController = new AbortController();
  const { signal } = pageController;

  const { path, anchor } = parseHash();
  const route = matchRoute(path);
  const root = document.querySelector('[data-page-root]');
  if (!root) return;

  document.body.dataset.page = route.key;
  document.body.className = `page--${route.key}`;
  document.title = route.title;

  const result = route.mount(root, { signal, anchor });
  Promise.resolve(result)
    .then(() => {
      if (signal.aborted) return;
      applyLang(readStoredLang());
      markActiveNav();
      scrollToAnchor(anchor);
    })
    .catch((err) => console.error('Route mount failed', err));
}

export function startRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}
