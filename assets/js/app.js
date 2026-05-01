/**
 * Entry point. Loads on every page.
 * 1. Register service worker (no-op on file://).
 * 2. Mount layout chrome (header / footer / dock) + apply i18n.
 * 3. Run page-specific module based on body class.
 */
import { initPwa } from './pwa.js';
import { initShell } from './ui/shell.js';

async function init() {
  initPwa();
  initShell();

  const { classList } = document.body;

  if (classList.contains('page--home')) {
    const { initHomePreview } = await import('./ui/home.js');
    await initHomePreview();
  } else if (classList.contains('page--schedule')) {
    const { initSchedulePage } = await import('./ui/schedule.js');
    await initSchedulePage();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
