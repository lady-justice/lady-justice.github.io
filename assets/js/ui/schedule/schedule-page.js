/**
 * Schedule page orchestration: fetch → validate → model → render.
 */
import { fetchSchedule } from '../../data/schedule.api.js';
import { validateSchedule } from '../../data/schedule.schema.js';
import { createScheduleModel } from '../../data/schedule.model.js';
import { addDays, scheduleDataIndexFromJsWeekday } from '../../core/dates.js';
import { escapeHtml } from '../../core/dom.js';
import { getStrings, normalizeLang } from '../../i18n/apply.js';
import { createScheduleCardElement } from './schedule-card.js';
import {
  scheduleLocale,
  weekdayAbbr,
  renderMonthYear,
  renderWeekStrip,
  bindWeekStripClick,
} from './week-strip.js';
import {
  applyScheduleListFilter,
  bindScheduleFilterSheet,
  dayHasMatchingFilter,
  initScheduleBanner,
  readActiveScheduleFilter,
  weekFilterEventFlags,
} from './schedule-filter.js';
import { createSchedulePageStore } from './schedule-store.js';

function showScheduleLoadError(container, err) {
  console.warn('Schedule load failed', err);
  const p = document.createElement('p');
  p.className = 'week__error';
  p.setAttribute('role', 'alert');
  p.textContent = `Could not load schedule: ${err.message}. Run a static server, e.g. python3 -m http.server 8000`;
  container.replaceChildren(p);
}

function buildDayPanels(container, scheduleModel, weekStart, s) {
  const frag = document.createDocumentFragment();

  for (let stripIx = 0; stripIx < 7; stripIx++) {
    const calDate = addDays(weekStart, stripIx);
    const dataIx = scheduleDataIndexFromJsWeekday(calDate.getDay());

    const section = document.createElement('section');
    section.className = 'day';
    section.id = `j-day-${stripIx}`;
    section.setAttribute('role', 'tabpanel');
    section.setAttribute('aria-labelledby', `j-tab-${stripIx}`);

    const list = document.createElement('div');
    list.className = 'day__timeline';

    if (dataIx === null) {
      const p = document.createElement('p');
      p.className = 'day__empty';
      p.dataset.i18n = 'home_preview_weekend';
      p.textContent = s.home_preview_weekend ?? '';
      list.append(p);
    } else {
      const dayData = scheduleModel.days[dataIx];
      const events = dayData?.events ?? [];
      if (!events.length) {
        const p = document.createElement('p');
        p.className = 'day__empty';
        p.dataset.i18n = 'home_preview_empty';
        p.textContent = s.home_preview_empty ?? '';
        list.append(p);
      } else {
        events.forEach((ev) => {
          list.append(createScheduleCardElement(ev, s));
        });
      }
    }
    section.append(list);
    frag.append(section);
  }
  container.replaceChildren(frag);
}

function updateVisibleDayPanels(container, selectedIndex) {
  container.querySelectorAll('.day').forEach((panel, i) => {
    const on = i === selectedIndex;
    panel.classList.toggle('day--active', on);
    panel.toggleAttribute('hidden', !on);
  });
}

function updateWeekStripSelection(
  strip,
  viewWeekStart,
  selectedIndex,
  scheduleModel,
  loc,
  tagFilter
) {
  strip.querySelectorAll('.week__strip-cell').forEach((btn, i) => {
    btn.setAttribute('aria-selected', i === selectedIndex ? 'true' : 'false');
    btn.classList.toggle('week__strip-cell--on', i === selectedIndex);

    const day = addDays(viewWeekStart, i);
    const abbr = weekdayAbbr(loc, day);
    const has = dayHasMatchingFilter(scheduleModel, i, viewWeekStart, tagFilter);

    if (i === selectedIndex) {
      const monthShort = new Intl.DateTimeFormat(loc, { month: 'short' }).format(day);
      btn.innerHTML = `<span class="week__strip-letter">${escapeHtml(abbr)}</span><span class="week__strip-num">${day.getDate()}</span><span class="week__strip-month">${escapeHtml(monthShort)}</span>`;
    } else {
      const dotClass = has ? 'week__strip-dot week__strip-dot--on' : 'week__strip-dot';
      btn.innerHTML = `<span class="week__strip-letter">${escapeHtml(abbr)}</span><span class="week__strip-num">${day.getDate()}</span><span class="${dotClass}" aria-hidden="true"></span>`;
    }
  });
}

export async function initSchedulePage({ signal } = {}) {
  const container = document.getElementById('j-week-panels');
  const strip = document.getElementById('j-week-strip');
  if (!container || !strip) return;

  initScheduleBanner();

  const getLang = () => normalizeLang(document.documentElement.getAttribute('data-lang') || 'en');
  const store = createSchedulePageStore(new Date());

  let scheduleModel;
  try {
    const raw = await fetchSchedule();
    if (signal?.aborted) return;
    scheduleModel = createScheduleModel(validateSchedule(raw));
  } catch (err) {
    showScheduleLoadError(container, err);
    return;
  }

  function paintWeek() {
    const lang = getLang();
    const s = getStrings(lang);
    const loc = scheduleLocale(lang);
    const tagFilter = readActiveScheduleFilter();
    const flags = weekFilterEventFlags(scheduleModel, store.viewWeekStart, tagFilter);
    renderWeekStrip(strip, store.viewWeekStart, loc, store.selected, flags);
    buildDayPanels(container, scheduleModel, store.viewWeekStart, s);
    applyScheduleListFilter(container, s);
    updateShellPartial();
  }

  function updateShellPartial() {
    const lang = getLang();
    const loc = scheduleLocale(lang);
    const tagFilter = readActiveScheduleFilter();
    const selectedDate = addDays(store.viewWeekStart, store.selected);
    renderMonthYear(loc, selectedDate);
    updateWeekStripSelection(strip, store.viewWeekStart, store.selected, scheduleModel, loc, tagFilter);
    updateVisibleDayPanels(container, store.selected);
  }

  function refreshScheduleCategoryFilter() {
    const lang = getLang();
    const s = getStrings(lang);
    const loc = scheduleLocale(lang);
    const tagFilter = readActiveScheduleFilter();
    applyScheduleListFilter(container, s);
    const flags = weekFilterEventFlags(scheduleModel, store.viewWeekStart, tagFilter);
    renderWeekStrip(strip, store.viewWeekStart, loc, store.selected, flags);
    updateWeekStripSelection(strip, store.viewWeekStart, store.selected, scheduleModel, loc, tagFilter);
  }

  bindScheduleFilterSheet(document, { signal, onFilterChange: refreshScheduleCategoryFilter });

  bindWeekStripClick(
    strip,
    (ix) => {
      store.setSelected(ix);
      updateShellPartial();
    },
    { signal }
  );

  const todayBtn = document.getElementById('j-schedule-today');
  if (todayBtn) {
    todayBtn.addEventListener(
      'click',
      () => {
        store.jumpToToday(new Date());
        paintWeek();
      },
      { signal }
    );
  }

  document.getElementById('j-week-prev')?.addEventListener(
    'click',
    () => {
      store.shiftWeek(-7);
      paintWeek();
    },
    { signal }
  );
  document.getElementById('j-week-next')?.addEventListener(
    'click',
    () => {
      store.shiftWeek(7);
      paintWeek();
    },
    { signal }
  );

  paintWeek();
  document.addEventListener('justice:lang', paintWeek, { signal });
}
