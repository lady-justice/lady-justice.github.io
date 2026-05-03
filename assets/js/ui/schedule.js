/**
 * Schedule page: Group Classes — week strip (Mon–Sun), class cards, filter sheet.
 */
import {
  loadGroupSchedule,
  safeAccent,
  startOfWeekMonday,
  scheduleDataIndexFromJsWeekday,
  parseScheduleMetaTimes,
} from '../data/schedule.js';
import { getStrings, applyLang, normalizeLang } from '../i18n/apply.js';

const BANNER_DISMISS_KEY = 'justice-schedule-banner-dismissed';

const ICON_CLOCK =
  '<svg class="schedule-card__clock" width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.75"/><path d="M12 7v6l4 2" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>';

const ICON_PIN =
  '<svg class="schedule-card__pin" width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21s7-4.35 7-11a7 7 0 1 0-14 0c0 6.65 7 11 7 11Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="12" cy="10" r="2.2" fill="currentColor"/></svg>';

function scheduleLocale(lang) {
  const L = normalizeLang(lang);
  if (L === 'el') return 'el-CY';
  if (L === 'ru') return 'ru-CY';
  return 'en-GB';
}

function sameLocalDate(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function addDays(base, n) {
  return new Date(base.getFullYear(), base.getMonth(), base.getDate() + n);
}

function coachInitials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function weekdayAbbr(locale, day) {
  const short = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(day);
  return short.replace(/\.$/, '').slice(0, 3).toUpperCase();
}

function defaultSelectedStripIndex(weekStart, now = new Date()) {
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  for (let i = 0; i < 7; i++) {
    if (sameLocalDate(addDays(weekStart, i), target)) return i;
  }
  return 0;
}

function dayHasEvents(data, stripIndex, weekStart) {
  const calDate = addDays(weekStart, stripIndex);
  const dataIx = scheduleDataIndexFromJsWeekday(calDate.getDay());
  if (dataIx === null) return false;
  return (data.days[dataIx]?.events ?? []).length > 0;
}

function weekHasEventsFlags(data, weekStart) {
  return Array.from({ length: 7 }, (_, i) => dayHasEvents(data, i, weekStart));
}

function renderMonthYear(locale, date) {
  const el = document.getElementById('j-schedule-month-year');
  if (!el) return;
  el.textContent = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date);
}

function buildStrip(container, weekStart, locale, selectedIndex, hasEventsFlags) {
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
      new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(day)
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

function buildPanels(container, data, weekStart, s, lang) {
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
      const dayData = data.days[dataIx];
      const events = dayData?.events ?? [];
      if (!events.length) {
        const p = document.createElement('p');
        p.className = 'day__empty';
        p.dataset.i18n = 'home_preview_empty';
        p.textContent = s.home_preview_empty ?? '';
        list.append(p);
      } else {
        events.forEach((ev) => {
          const accent = safeAccent(ev.accent);
          const { start, end } = parseScheduleMetaTimes(ev.meta);
          const coachLabel = s[ev.coachKey] ?? ev.coachKey;
          const initials = coachInitials(coachLabel);

          const art = document.createElement('article');
          art.className = `schedule-card schedule-card--accent-${accent}`;

          const timeCol = document.createElement('div');
          timeCol.className = 'schedule-card__time';
          timeCol.insertAdjacentHTML('afterbegin', ICON_CLOCK);
          const startEl = document.createElement('span');
          startEl.className = 'schedule-card__time-start';
          startEl.textContent = start;
          const endEl = document.createElement('span');
          endEl.className = 'schedule-card__time-end';
          endEl.textContent = end;
          timeCol.append(startEl, endEl);

          const divider = document.createElement('span');
          divider.className = 'schedule-card__divider';
          divider.setAttribute('aria-hidden', 'true');

          const main = document.createElement('div');
          main.className = 'schedule-card__main';

          const menu = document.createElement('button');
          menu.type = 'button';
          menu.className = 'schedule-card__menu';
          menu.setAttribute('aria-label', s.schedule_card_menu_aria ?? 'Menu');
          menu.tabIndex = -1;
          menu.innerHTML = '<span aria-hidden="true">⋯</span>';

          const title = document.createElement('p');
          title.className = 'schedule-card__title';
          title.textContent = ev.title;

          const sub = document.createElement('p');
          sub.className = 'schedule-card__subtitle';
          sub.dataset.i18n = 'schedule_track_group';
          sub.textContent = s.schedule_track_group ?? '';

          const footer = document.createElement('div');
          footer.className = 'schedule-card__footer';

          const placeWrap = document.createElement('div');
          placeWrap.className = 'schedule-card__footer-place';
          placeWrap.insertAdjacentHTML('afterbegin', ICON_PIN);
          const placeTxt = document.createElement('span');
          placeTxt.dataset.i18n = 'schedule_room_studio';
          placeTxt.textContent = s.schedule_room_studio ?? '';
          placeWrap.append(placeTxt);

          const sep = document.createElement('span');
          sep.className = 'schedule-card__footer-sep';
          sep.setAttribute('aria-hidden', 'true');

          const coachWrap = document.createElement('div');
          coachWrap.className = 'schedule-card__footer-coach';
          const av = document.createElement('span');
          av.className = 'schedule-card__avatar';
          av.setAttribute('aria-hidden', 'true');
          av.textContent = initials;
          const coachSpan = document.createElement('span');
          coachSpan.dataset.i18n = ev.coachKey;
          coachSpan.textContent = coachLabel;
          coachWrap.append(av, coachSpan);

          footer.append(placeWrap, sep, coachWrap);

          main.append(title, sub, footer);
          art.append(timeCol, divider, main, menu);
          list.append(art);
        });
      }
    }
    section.append(list);
    frag.append(section);
  }
  container.replaceChildren(frag);
}

function showError(container, err) {
  const p = document.createElement('p');
  p.className = 'week__error';
  p.setAttribute('role', 'alert');
  p.textContent = `Could not load schedule: ${err.message}. Run a static server, e.g. python3 -m http.server 8000`;
  container.replaceChildren(p);
}

function wireFilterSheet(root) {
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

  openBtn.addEventListener('click', open);
  backdrop?.addEventListener('click', close);
  done?.addEventListener('click', close);

  sheet.querySelectorAll('.schedule-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      sheet.querySelectorAll('.schedule-chip').forEach((c) => c.classList.remove('is-active'));
      chip.classList.add('is-active');
    });
  });

  root.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sheet.classList.contains('is-open')) {
      e.preventDefault();
      close();
    }
  });
}

function wireBanner() {
  const banner = document.getElementById('j-schedule-banner');
  const closeBtn = document.getElementById('j-schedule-banner-close');
  if (!banner || !closeBtn) return;
  try {
    if (!localStorage.getItem(BANNER_DISMISS_KEY)) banner.hidden = false;
  } catch (_) {
    banner.hidden = false;
  }
  closeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    try {
      localStorage.setItem(BANNER_DISMISS_KEY, '1');
    } catch (_) {}
    banner.hidden = true;
  });
}

export async function initSchedulePage() {
  const container = document.getElementById('j-week-panels');
  const strip = document.getElementById('j-week-strip');
  if (!container || !strip) return;

  wireBanner();
  wireFilterSheet(document);

  const getLang = () => document.documentElement.getAttribute('data-lang') || 'en';
  let viewWeekStart = startOfWeekMonday(new Date());
  const state = { selected: defaultSelectedStripIndex(viewWeekStart) };

  let data;
  try {
    data = await loadGroupSchedule();
  } catch (err) {
    showError(container, err);
    return;
  }

  function updateShell() {
    const lang = getLang();
    const loc = scheduleLocale(lang);
    const selectedDate = addDays(viewWeekStart, state.selected);
    renderMonthYear(loc, selectedDate);

    strip.querySelectorAll('.week__strip-cell').forEach((btn, i) => {
      btn.setAttribute('aria-selected', i === state.selected ? 'true' : 'false');
      btn.classList.toggle('week__strip-cell--on', i === state.selected);

      const day = addDays(viewWeekStart, i);
      const abbr = weekdayAbbr(loc, day);
      const has = dayHasEvents(data, i, viewWeekStart);

      if (i === state.selected) {
        const monthShort = new Intl.DateTimeFormat(loc, { month: 'short' }).format(day);
        btn.innerHTML = `<span class="week__strip-letter">${escapeHtml(abbr)}</span><span class="week__strip-num">${day.getDate()}</span><span class="week__strip-month">${escapeHtml(monthShort)}</span>`;
      } else {
        const dotClass = has ? 'week__strip-dot week__strip-dot--on' : 'week__strip-dot';
        btn.innerHTML = `<span class="week__strip-letter">${escapeHtml(abbr)}</span><span class="week__strip-num">${day.getDate()}</span><span class="${dotClass}" aria-hidden="true"></span>`;
      }
    });

    container.querySelectorAll('.day').forEach((panel, i) => {
      const on = i === state.selected;
      panel.classList.toggle('day--active', on);
      panel.toggleAttribute('hidden', !on);
    });
  }

  function paintWeek() {
    const lang = getLang();
    const s = getStrings(normalizeLang(lang));
    const loc = scheduleLocale(lang);
    const flags = weekHasEventsFlags(data, viewWeekStart);
    buildStrip(strip, viewWeekStart, loc, state.selected, flags);
    buildPanels(container, data, viewWeekStart, s, lang);
    applyLang(normalizeLang(lang));
    updateShell();
  }

  function goWeek(delta) {
    viewWeekStart = addDays(viewWeekStart, delta);
    paintWeek();
  }

  strip.addEventListener('click', (e) => {
    const btn = e.target.closest('.week__strip-cell');
    if (!btn || !strip.contains(btn)) return;
    const ix = Number.parseInt(btn.dataset.stripIndex ?? '', 10);
    if (Number.isNaN(ix)) return;
    state.selected = ix;
    updateShell();
  });

  const todayBtn = document.getElementById('j-schedule-today');
  if (todayBtn) {
    todayBtn.addEventListener('click', () => {
      viewWeekStart = startOfWeekMonday(new Date());
      state.selected = defaultSelectedStripIndex(viewWeekStart, new Date());
      paintWeek();
    });
  }

  document.getElementById('j-week-prev')?.addEventListener('click', () => {
    goWeek(-7);
  });
  document.getElementById('j-week-next')?.addEventListener('click', () => {
    goWeek(7);
  });

  paintWeek();
  document.addEventListener('justice:lang', paintWeek);
}
