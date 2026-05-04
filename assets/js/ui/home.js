/**
 * Home dashboard:
 *   1. Greeting line (data-i18n="home_greeting")
 *   2. TODAY card    — "Saturday, 02 May" + "{n} classes today"
 *   3. Schedule list — clock-circle | time + title + meta | chevron + see-all link
 *
 * Re-renders on `justice:lang` so translations stay current.
 * “Today”, greeting time-of-day, and which slots are “past” all use Cyprus (`Asia/Nicosia`).
 */
import {
  loadGroupSchedule,
  scheduleTagI18nKey,
  parseScheduleMetaTimes,
  safeAccent,
} from '../data/schedule.js';
import { getStrings, normalizeLang } from '../i18n/apply.js';

/** IANA zone for Cyprus — all “today” / class times on the home preview use this clock. */
export const HOME_SCHEDULE_TIMEZONE = 'Asia/Nicosia';

/** Default session length (minutes) when `meta` only has a start time. */
const FALLBACK_SLOT_DURATION_MIN = 60;

function homeLocaleForLang(lang) {
  const L = normalizeLang(lang);
  if (L === 'el') return 'el-CY';
  if (L === 'ru') return 'ru-CY';
  return 'en-GB';
}

function capFirst(str, locale) {
  if (!str) return str;
  return str.charAt(0).toLocaleUpperCase(locale) + str.slice(1);
}

const escape = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Monday=0 … Saturday=5 — which row in `group-schedule.json` for Cyprus “today”. Sunday → `null`. */
function scheduleIndexForCyprus(now = new Date()) {
  const w = new Intl.DateTimeFormat('en-US', { timeZone: HOME_SCHEDULE_TIMEZONE, weekday: 'long' }).format(
    now
  );
  /** @type {Record<string, number>} */
  const map = { Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3, Friday: 4, Saturday: 5 };
  return map[w] ?? null;
}

/** Minutes since midnight in Cyprus for `instant` (0 … 1439). */
function cyprusMinutesSinceMidnight(instant = new Date()) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: HOME_SCHEDULE_TIMEZONE,
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });
  const parts = Object.fromEntries(dtf.formatToParts(instant).filter((p) => p.type !== 'literal').map((p) => [p.type, p.value]));
  return parseInt(parts.hour ?? '0', 10) * 60 + parseInt(parts.minute ?? '0', 10);
}

function timeHmToMinutes(hm) {
  const m = String(hm || '').trim().match(/^(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

/** Strict end minute of the slot — past when Cyprus clock ≥ this minute index. */
function cyprusSlotEndMinute(meta) {
  const { start, end } = parseScheduleMetaTimes(meta);
  const endM = timeHmToMinutes(end);
  if (endM !== null) return endM;
  const startM = timeHmToMinutes(start);
  if (startM !== null) return startM + FALLBACK_SLOT_DURATION_MIN;
  return null;
}

/** `true` if the class interval has ended in Cyprus local time (`now`). */
function isPastInCyprus(meta, now = new Date()) {
  const endMin = cyprusSlotEndMinute(meta);
  if (endMin === null) return false;
  return cyprusMinutesSinceMidnight(now) >= endMin;
}

function timeFromMeta(meta) {
  const t = String(meta || '').trim();
  return (t.match(/^(\d{1,2}:\d{2})/) || [, t])[1];
}

/** "Saturday, 02 May" — weekday + day + month, 1:1 with reference. */
function renderHomeDate() {
  const titleEl = document.getElementById('j-home-date-title');
  if (!titleEl) return;
  const lang = document.documentElement.getAttribute('data-lang');
  const locale = homeLocaleForLang(lang);
  const now = new Date();
  const opts = { timeZone: HOME_SCHEDULE_TIMEZONE };

  const weekdayRaw = new Intl.DateTimeFormat(locale, { ...opts, weekday: 'long' }).format(now);
  const weekday = capFirst(weekdayRaw, locale);
  const dd = new Intl.DateTimeFormat(locale, { ...opts, day: '2-digit' }).format(now);
  const monRaw = new Intl.DateTimeFormat(locale, { ...opts, month: 'long' }).format(now);
  const month = capFirst(monRaw.replace(/\./g, '').trim(), locale);

  titleEl.textContent = `${weekday}, ${dd} ${month}`;
}

/** "{n} classes today" — pulled from i18n; falls back to "No classes". */
function renderHomeStatus(eventsCount) {
  const el = document.getElementById('j-home-date-status');
  if (!el) return;
  const lang = document.documentElement.getAttribute('data-lang');
  const s = getStrings(lang);
  if (!eventsCount) {
    el.textContent = s.home_no_classes_today ?? '';
    return;
  }
  const tpl = s.home_preview_helper_count ?? '{n}';
  el.textContent = tpl.replace(/\{n\}/g, String(eventsCount));
}

/** Greeting — picks "morning / afternoon / evening" based on the current hour. */
function renderHomeGreeting() {
  const el = document.querySelector('.home__greeting-text');
  if (!el) return;
  const lang = document.documentElement.getAttribute('data-lang');
  const s = getStrings(lang);
  const hr = Math.floor(cyprusMinutesSinceMidnight() / 60);
  const key =
    hr >= 5 && hr < 12 ? 'home_greeting_morning' :
    hr >= 12 && hr < 18 ? 'home_greeting_afternoon' :
    'home_greeting_evening';
  el.textContent = s[key] ?? s.home_greeting ?? '';
}

const clockSvg = `
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.6"/>
    <path d="M12 7.5V12l3 2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

const chevronSvg = `
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

function renderSchedule(root, data) {
  const lang = document.documentElement.getAttribute('data-lang');
  const s = getStrings(lang);
  const now = new Date();
  const dayIx = scheduleIndexForCyprus(now);
  const day = dayIx !== null ? data.days[dayIx] : null;
  const events = dayIx !== null ? (day?.events ?? []).slice() : [];

  root.setAttribute('aria-busy', 'false');

  if (dayIx === null || !data.days[dayIx]) {
    root.innerHTML = `
      <div class="home-card__body">
        <p class="home-card__placeholder" style="background:none;animation:none;color:var(--ink-muted);font-weight:500;display:flex;align-items:center;justify-content:center;text-align:center;padding:0 1rem;">${escape(s.home_preview_weekend)}</p>
      </div>`;
    renderHomeStatus(0);
    return;
  }

  if (!events.length) {
    root.innerHTML = `
      <div class="home-card__body">
        <p class="home-card__placeholder" style="background:none;animation:none;color:var(--ink-muted);font-weight:500;display:flex;align-items:center;justify-content:center;text-align:center;padding:0 1rem;">${escape(s.home_preview_empty)}</p>
      </div>`;
    renderHomeStatus(0);
    return;
  }

  renderHomeStatus(events.length);

  const place = escape(s.home_preview_place);
  const rows = events
    .map((ev, i) => {
      const time = escape(timeFromMeta(ev.meta));
      const coach = escape(s[ev.coachKey] ?? ev.coachKey);
      const title = escape(ev.title);
      const tagKey = scheduleTagI18nKey(ev.tag);
      const cat = escape(s[tagKey] ?? tagKey);
      const accent = safeAccent(ev.accent);
      const accentClass = ` home-card__slot--accent-${accent}`;
      const past = isPastInCyprus(ev.meta, now);
      const pastClass = past ? ' home-card__slot--past' : '';
      const finishedLabel =
        past && (s.home_preview_class_finished ?? '')
          ? `<span class="home-card__finished">${escape(s.home_preview_class_finished)}</span>`
          : '';
      const divider = i < events.length - 1 ? '<hr class="home-card__divider" />' : '';
      return `
        <a class="home-card__slot${accentClass}${pastClass}" href="schedule.html">
          <span class="home-card__slot-icon">${clockSvg}</span>
          <span class="home-card__slot-main">
            <span class="home-card__time">${time}</span>
            <span class="home-card__title-block">
              <span class="home-card__class-title">${title}</span>
              ${finishedLabel}
            </span>
            <span class="home-card__meta">
              <span class="home-card__tag">${cat}</span>
              <span class="home-card__meta-dot" aria-hidden="true"></span>
              <span>${place}</span>
              <span class="home-card__meta-dot" aria-hidden="true"></span>
              <span>${coach}</span>
            </span>
          </span>
          <span class="home-card__chevron">${chevronSvg}</span>
        </a>${divider}`;
    })
    .join('');

  const seeLabel = escape(s.home_see_all_classes);

  root.innerHTML = `
    <div class="home-card__body">
      <div class="home-card__slots">${rows}</div>
    </div>
    <a class="home-card__see-link" href="schedule.html" aria-label="${seeLabel}">
      <span>${seeLabel}</span>
      <span class="home-card__see-link-chevron">${chevronSvg}</span>
    </a>`;
}

export async function initHomePreview() {
  const root = document.getElementById('j-home-preview');
  if (!root) return;

  let data;
  try {
    data = await loadGroupSchedule();
  } catch {
    const s = getStrings(document.documentElement.getAttribute('data-lang'));
    root.innerHTML = `
      <div class="home-card__body">
        <p class="home-card__placeholder" style="background:none;animation:none;color:var(--ink-muted);font-weight:500;display:flex;align-items:center;justify-content:center;text-align:center;padding:0 1rem;">${escape(s.home_preview_error)}</p>
      </div>`;
    root.setAttribute('aria-busy', 'false');
    renderHomeGreeting();
    renderHomeDate();
    renderHomeStatus(0);
    return;
  }
  renderSchedule(root, data);
  renderHomeDate();
  renderHomeGreeting();

  setInterval(() => {
    if (document.visibilityState === 'visible') {
      renderSchedule(root, data);
      renderHomeDate();
      renderHomeGreeting();
    }
  }, 60_000);

  document.addEventListener('justice:lang', () => {
    renderSchedule(root, data);
    renderHomeDate();
    renderHomeGreeting();
  });
}

// Re-export for backwards compatibility (older imports may still reference it)
export { renderHomeDate };
