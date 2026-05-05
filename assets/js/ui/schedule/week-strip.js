/**
 * Week strip (tabs) rendering + helpers for schedule page.
 */
import { escapeHtml } from '../../core/dom.js';
import { addDays, sameLocalDate, scheduleDataIndexFromJsWeekday } from '../../core/dates.js';

export function scheduleLocale(lang) {
  if (lang === 'el') return 'el-CY';
  if (lang === 'ru') return 'ru-CY';
  return 'en-GB';
}

export function weekdayAbbr(locale, day) {
  const short = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(day);
  return short.replace(/\.$/, '').slice(0, 3).toUpperCase();
}

export function defaultSelectedStripIndex(weekStart, now = new Date()) {
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  for (let i = 0; i < 7; i++) {
    if (sameLocalDate(addDays(weekStart, i), target)) return i;
  }
  return 0;
}

export function dayHasEvents(scheduleModel, stripIndex, weekStart) {
  const calDate = addDays(weekStart, stripIndex);
  const dataIx = scheduleDataIndexFromJsWeekday(calDate.getDay());
  if (dataIx === null) return false;
  return (scheduleModel.days[dataIx]?.events ?? []).length > 0;
}

export function weekHasEventsFlags(scheduleModel, weekStart) {
  return Array.from({ length: 7 }, (_, i) => dayHasEvents(scheduleModel, i, weekStart));
}

export function renderMonthYear(locale, date) {
  const el = document.getElementById('j-schedule-month-year');
  if (!el) return;
  el.textContent = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date);
}

export function renderWeekStrip(container, weekStart, locale, selectedIndex, hasEventsFlags) {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < 7; i++) {
    const day = addDays(weekStart, i);
    const abbr = weekdayAbbr(locale, day);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'week__strip-cell';
    btn.id = `j-tab-${i}`;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-controls', `j-day-${i}`);
    btn.setAttribute('aria-selected', i === selectedIndex ? 'true' : 'false');
    btn.dataset.stripIndex = String(i);
    btn.setAttribute(
      'aria-label',
      new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(day),
    );

    const has = hasEventsFlags[i];
    if (i === selectedIndex) {
      const monthShort = new Intl.DateTimeFormat(locale, { month: 'short' }).format(day);
      btn.innerHTML = `<span class="week__strip-letter">${escapeHtml(abbr)}</span><span class="week__strip-num">${day.getDate()}</span><span class="week__strip-month">${escapeHtml(monthShort)}</span>`;
      btn.classList.add('week__strip-cell--on');
    } else {
      const dotClass = has ? 'week__strip-dot week__strip-dot--on' : 'week__strip-dot';
      btn.innerHTML = `<span class="week__strip-letter">${escapeHtml(abbr)}</span><span class="week__strip-num">${day.getDate()}</span><span class="${dotClass}" aria-hidden="true"></span>`;
    }
    frag.append(btn);
  }
  container.replaceChildren(frag);
}

export function bindWeekStripClick(strip, handler, { signal } = {}) {
  strip.addEventListener(
    'click',
    (e) => {
      const btn = e.target.closest('.week__strip-cell');
      if (!btn || !strip.contains(btn)) return;
      const ix = Number.parseInt(btn.dataset.stripIndex ?? '', 10);
      if (Number.isNaN(ix)) return;
      handler(ix);
    },
    { signal },
  );
}
