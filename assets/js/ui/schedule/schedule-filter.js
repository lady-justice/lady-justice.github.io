/**
 * Filter sheet + banner dismiss — schedule page chrome only.
 */
import { addDays, scheduleDataIndexFromJsWeekday } from '../../core/dates.js';
import { APP_CONFIG } from '../../core/config.js';
import { getStoredValue, setStoredValue } from '../../core/storage.js';
import { normalizeScheduleTag } from '../../data/schedule.model.js';

const BANNER_DISMISS_KEY = APP_CONFIG.storageKeys.scheduleBannerDismissed;

const FILTER_IDS = new Set(['all', 'kids', 'dance', 'fitness']);

/**
 * Active sheet chip → schedule category token (`all` shows everything).
 */
export function readActiveScheduleFilter() {
  const chip = document.querySelector('#j-schedule-sheet .schedule-chip.is-active[data-filter]');
  const v = chip?.getAttribute('data-filter') ?? 'all';
  return FILTER_IDS.has(v) ? v : 'all';
}

/**
 * Strip dot “has classes” respects active category filter.
 */
export function dayHasMatchingFilter(scheduleModel, stripIndex, weekStart, tagFilter) {
  const calDate = addDays(weekStart, stripIndex);
  const dataIx = scheduleDataIndexFromJsWeekday(calDate.getDay());
  if (dataIx === null) return false;
  const events = scheduleModel.days[dataIx]?.events ?? [];
  if (!events.length) return false;
  if (tagFilter === 'all') return true;
  return events.some((ev) => normalizeScheduleTag(ev.tag) === tagFilter);
}

export function weekFilterEventFlags(scheduleModel, weekStart, tagFilter) {
  return Array.from({ length: 7 }, (_, i) =>
    dayHasMatchingFilter(scheduleModel, i, weekStart, tagFilter)
  );
}

/**
 * Toggle `.schedule-card` visibility under `#j-week-panels` + optional empty line when nothing matches.
 *
 * @param {HTMLElement} panelsRoot
 * @param {Record<string, string>} strings — `getStrings()` bag
 */
export function applyScheduleListFilter(panelsRoot, strings) {
  const tagFilter = readActiveScheduleFilter();

  panelsRoot.querySelectorAll('.day').forEach((day) => {
    const timeline = day.querySelector('.day__timeline');
    if (!timeline) return;

    timeline.querySelectorAll('.day__empty-filter').forEach((el) => el.remove());

    const cards = [...timeline.querySelectorAll('.schedule-card')];
    cards.forEach((card) => {
      const tag = card.getAttribute('data-schedule-tag') ?? 'fitness';
      const show = tagFilter === 'all' || tag === tagFilter;
      card.hidden = !show;
      card.setAttribute('aria-hidden', show ? 'false' : 'true');
    });

    const visible = cards.filter((c) => !c.hidden);
    if (cards.length > 0 && visible.length === 0) {
      const p = document.createElement('p');
      p.className = 'day__empty day__empty-filter';
      p.dataset.i18n = 'schedule_filter_day_empty';
      p.textContent = strings.schedule_filter_day_empty ?? '';
      timeline.append(p);
    }
  });
}

export function bindScheduleFilterSheet(root, { signal, onFilterChange } = {}) {
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
        onFilterChange?.();
      },
      { signal }
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
    { signal }
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
