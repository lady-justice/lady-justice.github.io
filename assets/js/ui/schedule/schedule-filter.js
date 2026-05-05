/**
 * Filter sheet + banner dismiss — schedule page chrome only.
 */
import { APP_CONFIG } from '../../core/config.js';
import { getStoredValue, setStoredValue } from '../../core/storage.js';

const BANNER_DISMISS_KEY = APP_CONFIG.storageKeys.scheduleBannerDismissed;

export function bindScheduleFilterSheet(root, { signal } = {}) {
  const sheet = document.getElementById('j-schedule-sheet');
  const openBtn = document.getElementById('j-schedule-filter');
  const backdrop = document.getElementById('j-schedule-sheet-backdrop');
  const done = document.getElementById('j-schedule-sheet-done');
  if (!sheet || !openBtn) return;

  function close() {
    sheet.classList.remove('is-open');
    sheet.setAttribute('aria-hidden', 'true');
    openBtn.focus();
  }

  function open() {
    sheet.classList.add('is-open');
    sheet.setAttribute('aria-hidden', 'false');
    done?.focus();
  }

  openBtn.addEventListener('click', open, { signal });
  backdrop?.addEventListener('click', close, { signal });
  done?.addEventListener('click', close, { signal });

  sheet.querySelectorAll('.schedule-chip').forEach((chip) => {
    chip.addEventListener(
      'click',
      () => {
        sheet.querySelectorAll('.schedule-chip').forEach((c) => c.classList.remove('is-active'));
        chip.classList.add('is-active');
      },
      { signal },
    );
  });

  root.addEventListener(
    'keydown',
    (e) => {
      if (e.key === 'Escape' && sheet.classList.contains('is-open')) {
        e.preventDefault();
        close();
      }
    },
    { signal },
  );
}

export function initScheduleBanner() {
  const banner = document.getElementById('j-schedule-banner');
  const closeBtn = document.getElementById('j-schedule-banner-close');
  if (!banner || !closeBtn) return;
  if (!getStoredValue(BANNER_DISMISS_KEY)) banner.hidden = false;
  closeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    setStoredValue(BANNER_DISMISS_KEY, '1');
    banner.hidden = true;
  });
}
