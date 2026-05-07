import { initSchedulePage } from '../ui/schedule/schedule-page.js';

const SCHEDULE_HTML = /* html */ `
  <main>
    <section class="schedule" id="schedule" data-i18n-attr="aria-label:nav_schedule">
      <header class="schedule-head">
        <div class="schedule-head__title-row">
          <div class="schedule-head__icon-wrap" aria-hidden="true">
            <svg class="schedule-head__icon" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M8 2v3M16 2v3M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3 14h18" stroke="currentColor" stroke-width="1.75"/>
            </svg>
          </div>
          <h1 class="schedule-head__title" data-i18n="schedule_page_title">Group Schedule</h1>
        </div>
        <div class="schedule-head__meta">
          <p class="schedule-head__month" id="j-schedule-month-year" aria-live="polite"></p>
          <div class="schedule-head__actions">
            <button type="button" class="schedule-head__today" id="j-schedule-today" data-i18n="schedule_today">Today</button>
            <button type="button" class="schedule-filter-btn" id="j-schedule-filter" data-i18n-attr="aria-label:schedule_filter_aria">
              <svg class="schedule-filter-btn__icon" width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
                <path d="M2 2h4a2 2 0 1 0 4 0h6M2 7h10a2 2 0 1 0 4 0h0M2 12h6a2 2 0 1 0 4 0h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <circle cx="6.5" cy="2" r="1.35" fill="currentColor"/>
                <circle cx="14.5" cy="7" r="1.35" fill="currentColor"/>
                <circle cx="10.5" cy="12" r="1.35" fill="currentColor"/>
              </svg>
              <span data-i18n="schedule_filter">Filter</span>
            </button>
          </div>
        </div>
      </header>

      <div class="schedule-week-card" role="region" data-i18n-attr="aria-label:schedule_week_aria">
        <button type="button" class="week__nav week__nav--prev" id="j-week-prev" data-i18n-attr="aria-label:schedule_week_prev_aria">
          <svg class="week__nav-icon" width="8" height="14" viewBox="0 0 12 20" fill="none" aria-hidden="true"><path d="M9 3L3 10l6 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <div class="week__strip-wrap">
          <div class="week__strip" id="j-week-strip" role="tablist" data-i18n-attr="aria-label:schedule_tabs_aria"></div>
        </div>
        <button type="button" class="week__nav week__nav--next" id="j-week-next" data-i18n-attr="aria-label:schedule_week_next_aria">
          <svg class="week__nav-icon" width="8" height="14" viewBox="0 0 12 20" fill="none" aria-hidden="true"><path d="M3 3l6 7-6 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>

      <div class="schedule-body">
        <div class="week__panels schedule-panels" id="j-week-panels"></div>
      </div>
    </section>
  </main>

  <div class="schedule-banner" id="j-schedule-banner" hidden>
    <span class="schedule-banner__icon" aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M8 2v3M16 2v3M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/><path d="M3 14h18" stroke="currentColor" stroke-width="1.75"/></svg>
    </span>
    <p class="schedule-banner__text" data-i18n="schedule_banner_book_early">Classes fill up fast! Book early to secure your spot.</p>
    <button type="button" class="schedule-banner__close" id="j-schedule-banner-close" data-i18n-attr="aria-label:schedule_banner_close_aria">
      <span aria-hidden="true">&times;</span>
    </button>
  </div>

  <div class="schedule-sheet" id="j-schedule-sheet" aria-hidden="true">
    <button type="button" class="schedule-sheet__backdrop" id="j-schedule-sheet-backdrop" data-i18n-attr="aria-label:schedule_sheet_close_aria"></button>
    <div class="schedule-sheet__panel" role="dialog" aria-modal="true" aria-labelledby="j-schedule-sheet-title">
      <div class="schedule-sheet__handle" aria-hidden="true"></div>
      <header class="schedule-sheet__head">
        <span class="schedule-sheet__head-icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 18 14" fill="none"><path d="M2 2h4a2 2 0 1 0 4 0h6M2 7h10a2 2 0 1 0 4 0h0M2 12h6a2 2 0 1 0 4 0h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="6.5" cy="2" r="1.35" fill="currentColor"/><circle cx="14.5" cy="7" r="1.35" fill="currentColor"/><circle cx="10.5" cy="12" r="1.35" fill="currentColor"/></svg>
        </span>
        <h2 class="schedule-sheet__title" id="j-schedule-sheet-title" data-i18n="schedule_filter_title">Filter classes</h2>
        <p class="schedule-sheet__hint" data-i18n="schedule_filter_hint">Choose a category to show only those classes. Tap Done when finished.</p>
      </header>
      <div class="schedule-sheet__chips" role="group" data-i18n-attr="aria-label:schedule_filter_chips_aria">
        <button type="button" class="schedule-chip is-active" data-filter="all" data-i18n="schedule_filter_chip_all">All</button>
        <button type="button" class="schedule-chip" data-filter="kids" data-i18n="schedule_filter_chip_kids">Kids</button>
        <button type="button" class="schedule-chip" data-filter="dance" data-i18n="schedule_filter_chip_dance">Dance</button>
        <button type="button" class="schedule-chip" data-filter="fitness" data-i18n="schedule_filter_chip_fitness">Fitness</button>
      </div>
      <button type="button" class="schedule-sheet__done" id="j-schedule-sheet-done" data-i18n="schedule_filter_done">Done</button>
    </div>
  </div>
`;

/**
 * @param {HTMLElement} root
 * @param {{ signal?: AbortSignal }} [_opts]
 */
export function mountSchedulePage(root, _opts = {}) {
  const { signal } = _opts;
  root.innerHTML = SCHEDULE_HTML;
  return initSchedulePage({ signal });
}
