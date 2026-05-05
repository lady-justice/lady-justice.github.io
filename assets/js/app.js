/**
 * Entry: service worker → shell chrome → hash router mounts page modules into [data-page-root].
 */
import { initPwa } from './pwa.js';
import { initShell } from './ui/shell/shell.js';
import { startRouter } from './core/router.js';

async function init() {
  initPwa();
  initShell();
  startRouter();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
