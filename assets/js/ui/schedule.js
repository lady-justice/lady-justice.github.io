/**
 * Schedule page: calendar week (Mon–Sun) with real dates, day strip, timeline cards.
 */
import {
  loadGroupSchedule,
  safeAccent,
  startOfWeekMonday,
  scheduleDataIndexFromJsWeekday,
  parseScheduleMetaTimes,
} from '../data/schedule.js';
import { getStrings, applyLang, normalizeLang } from '../i18n/apply.js';

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

function parseTimeToMinutes(hm) {
  const m = String(hm || '').match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

/** Index of class “in progress” or next upcoming today; otherwise -1. */
function activeEventIndexForToday(events, now, selectedDate) {
  if (!sameLocalDate(selectedDate, now)) return -1;
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  for (let i = 0; i < events.length; i++) {
    const { start, end } = parseScheduleMetaTimes(events[i].meta);
    const sm = parseTimeToMinutes(start);
    if (sm === null) continue;
    let em = parseTimeToMinutes(end);
    if (em === null) em = sm + 60;
    if (minutesNow >= sm && minutesNow < em) return i;
  }
  for (let i = 0; i < events.length; i++) {
    const sm = parseTimeToMinutes(parseScheduleMetaTimes(events[i].meta).start);
    if (sm !== null && minutesNow < sm) return i;
  }
  return -1;
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

function defaultSelectedStripIndex(weekStart, now = new Date()) {
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  for (let i = 0; i < 7; i++) {
    if (sameLocalDate(addDays(weekStart, i), target)) return i;
  }
  return 0;
}

function renderHero(locale, date) {
  const dd = document.getElementById('j-schedule-hero-dd');
  const wd = document.getElementById('j-schedule-hero-weekday');
  const my = document.getElementById('j-schedule-hero-my');
  if (!dd || !wd || !my) return;
  dd.textContent = String(date.getDate());
  wd.textContent = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date);
  my.textContent = new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' }).format(date);
}

function buildStrip(container, weekStart, locale, selectedIndex) {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < 7; i++) {
    const day = addDays(weekStart, i);
    const letter = new Intl.DateTimeFormat(locale, { weekday: 'narrow' }).format(day);
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
    btn.innerHTML = `<span class="week__strip-letter">${escapeHtml(letter)}</span><span class="week__strip-num">${day.getDate()}</span>`;
    frag.append(btn);
  }
  container.replaceChildren(frag);
}

function buildPanels(container, data, weekStart, s, lang) {
  const now = new Date();
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
        const activeIx = activeEventIndexForToday(events, now, calDate);
        events.forEach((ev, evIx) => {
          const accent = safeAccent(ev.accent);
          const { start, end } = parseScheduleMetaTimes(ev.meta);
          const isLive = activeIx === evIx;
          const coachLabel = s[ev.coachKey] ?? ev.coachKey;
          const initials = coachInitials(coachLabel);
          const slot = document.createElement('div');
          slot.className = 'schedule-slot';

          const rail = document.createElement('div');
          rail.className = 'schedule-slot__rail';
          rail.setAttribute('aria-hidden', 'true');
          const timeWrap = document.createElement('div');
          timeWrap.className = 'schedule-slot__time';
          const startEl = document.createElement('span');
          startEl.className = 'schedule-slot__start';
          startEl.textContent = start;
          const endEl = document.createElement('span');
          endEl.className = 'schedule-slot__end';
          endEl.textContent = end;
          timeWrap.append(startEl, endEl);
          rail.append(timeWrap);

          const art = document.createElement('article');
          art.className = `schedule-card schedule-card--accent-${accent}${isLive ? ' schedule-card--live' : ' schedule-card--muted'}`;

          const menu = document.createElement('button');
          menu.type = 'button';
          menu.className = 'schedule-card__menu';
          menu.setAttribute('aria-label', s.schedule_card_menu_aria ?? 'Menu');
          menu.tabIndex = -1;

          const title = document.createElement('p');
          title.className = 'schedule-card__title';
          title.textContent = ev.title;

          const sub = document.createElement('p');
          sub.className = 'schedule-card__subtitle';
          sub.dataset.i18n = 'schedule_track_group';
          sub.textContent = s.schedule_track_group ?? '';

          const rowPlace = document.createElement('div');
          rowPlace.className = 'schedule-card__row schedule-card__row--place';
          const pin = document.createElement('span');
          pin.className = 'schedule-card__pin';
          pin.setAttribute('aria-hidden', 'true');
          const placeTxt = document.createElement('span');
          placeTxt.dataset.i18n = 'schedule_room_studio';
          placeTxt.textContent = s.schedule_room_studio ?? '';
          rowPlace.append(pin, placeTxt);

          const rowCoach = document.createElement('div');
          rowCoach.className = 'schedule-card__row schedule-card__row--coach';
          const av = document.createElement('span');
          av.className = 'schedule-card__avatar';
          av.setAttribute('aria-hidden', 'true');
          av.textContent = initials;
          const coachSpan = document.createElement('span');
          coachSpan.dataset.i18n = ev.coachKey;
          coachSpan.textContent = coachLabel;
          rowCoach.append(av, coachSpan);

          art.append(menu, title, sub, rowPlace, rowCoach);
          slot.append(rail, art);
          list.append(slot);
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

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export async function initSchedulePage() {
  const container = document.getElementById('j-week-panels');
  const strip = document.getElementById('j-week-strip');
  const pane = document.getElementById('j-week-slider-pane');
  const heroSlide = document.getElementById('j-week-hero-slide');
  const slidePanes = [pane, heroSlide].filter((el) => el instanceof HTMLElement);
  if (!container || !strip) return;

  const getLang = () => document.documentElement.getAttribute('data-lang') || 'en';
  let viewWeekStart = startOfWeekMonday(new Date());
  const state = { selected: defaultSelectedStripIndex(viewWeekStart) };
  let weekAnimating = false;

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
    renderHero(loc, addDays(viewWeekStart, state.selected));
    strip.querySelectorAll('.week__strip-cell').forEach((btn, i) => {
      btn.setAttribute('aria-selected', i === state.selected ? 'true' : 'false');
      btn.classList.toggle('week__strip-cell--on', i === state.selected);
    });
    container.querySelectorAll('.day').forEach((panel, i) => {
      const on = i === state.selected;
      panel.classList.toggle('day--active', on);
      panel.toggleAttribute('hidden', !on);
    });
  }

  function resetWeekPaneAnim() {
    weekAnimating = false;
    slidePanes.forEach((p) => {
      p.classList.remove(
        'week__slider-pane--exit-next',
        'week__slider-pane--exit-prev',
        'week__slider-pane--enter-next',
        'week__slider-pane--enter-prev'
      );
      p.style.animation = '';
    });
  }

  function paintWeek() {
    const lang = getLang();
    const s = getStrings(lang);
    const loc = scheduleLocale(lang);
    buildStrip(strip, viewWeekStart, loc, state.selected);
    buildPanels(container, data, viewWeekStart, s, lang);
    applyLang(normalizeLang(lang));
    updateShell();
  }

  function goWeek(delta) {
    if (weekAnimating) return;
    if (!pane || prefersReducedMotion()) {
      viewWeekStart = addDays(viewWeekStart, delta);
      paintWeek();
      return;
    }

    const dir = delta > 0 ? 'next' : 'prev';
    const exitClass = dir === 'next' ? 'week__slider-pane--exit-next' : 'week__slider-pane--exit-prev';
    const enterClass = dir === 'next' ? 'week__slider-pane--enter-next' : 'week__slider-pane--enter-prev';
    const exitName = dir === 'next' ? 'week-exit-next' : 'week-exit-prev';
    const enterName = dir === 'next' ? 'week-slide-enter-next' : 'week-slide-enter-prev';

    weekAnimating = true;
    slidePanes.forEach((p) => {
      p.classList.remove(
        'week__slider-pane--exit-next',
        'week__slider-pane--exit-prev',
        'week__slider-pane--enter-next',
        'week__slider-pane--enter-prev'
      );
      p.style.animation = 'none';
      void p.offsetWidth;
      p.style.animation = '';
    });

    const failSafe = window.setTimeout(() => {
      resetWeekPaneAnim();
    }, 200);

    requestAnimationFrame(() => {
      slidePanes.forEach((p) => p.classList.add(exitClass));
    });

    const onExit = (ev) => {
      if (ev.target !== pane || ev.animationName !== exitName) return;
      pane.removeEventListener('animationend', onExit);
      viewWeekStart = addDays(viewWeekStart, delta);
      paintWeek();
      slidePanes.forEach((p) => {
        p.classList.remove(exitClass);
        p.style.animation = 'none';
        void p.offsetWidth;
        p.style.animation = '';
      });
      void pane.offsetWidth;
      slidePanes.forEach((p) => p.classList.add(enterClass));

      const onEnter = (ev) => {
        if (ev.target !== pane || ev.animationName !== enterName) return;
        pane.removeEventListener('animationend', onEnter);
        window.clearTimeout(failSafe);
        slidePanes.forEach((p) => {
          p.classList.remove(enterClass);
          p.style.animation = '';
        });
        weekAnimating = false;
      };
      pane.addEventListener('animationend', onEnter);
    };
    pane.addEventListener('animationend', onExit);
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
      resetWeekPaneAnim();
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
  document.addEventListener('justice:lang', () => {
    resetWeekPaneAnim();
    paintWeek();
  });
}
