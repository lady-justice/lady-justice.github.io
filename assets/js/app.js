/**
 * Entry point. Loads on every page.
 * 1. Register service worker (no-op on file://).
 * 2. Mount layout chrome (header / dock) + apply i18n.
 * 3. Run page-specific module based on body class.
 */
import { initPwa } from './pwa.js';
import { initShell } from './ui/shell/shell.js';

async function init() {
  initPwa();
  initShell();

  const { classList } = document.body;

  if (classList.contains('page--home')) {
    const { initHomePage } = await import('./ui/home/home-page.js');
    await initHomePage();
  } else if (classList.contains('page--schedule')) {
    const { initSchedulePage } = await import('./ui/schedule/schedule-page.js');
    await initSchedulePage();
  } else if (classList.contains('page--studio')) {
    const { initStudioPage } = await import('./ui/studio.js');
    initStudioPage();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
