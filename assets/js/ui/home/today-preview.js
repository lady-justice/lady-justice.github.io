/**
 * “Today at the studio” preview card — receives validated schedule model; no fetch.
 */
import { APP_CONFIG } from '../../core/config.js';
import { escapeHtml } from '../../core/dom.js';
import { parseScheduleMetaTimes, parseTimeToMinutes } from '../../core/dates.js';
import {
  scheduleTagI18nKey,
  safeAccent,
  scheduleDayRowIndexFromDate,
} from '../../data/schedule.model.js';
import { getStrings, normalizeLang } from '../../i18n/apply.js';

const FALLBACK_SLOT_DURATION_MIN = 60;

/** Re-export for tests / tooling — Cyprus studio clock. */
export const HOME_SCHEDULE_TIMEZONE = APP_CONFIG.scheduleHomeTimezone;

function homeLocaleForLang(lang) {
  const L = normalizeLang(lang);
  if (L === 'el') return 'el-CY';
  if (L === 'ru') return 'ru-CY';
  return 'en-GB';
}

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

/** Strict end minute of the slot — past when Cyprus clock ≥ this minute index. */
function cyprusSlotEndMinute(meta) {
  const { start, end } = parseScheduleMetaTimes(meta);
  const endM = parseTimeToMinutes(end);
  if (endM !== null) return endM;
  const startM = parseTimeToMinutes(start);
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

const clockSvg = `
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.6"/>
    <path d="M12 7.5V12l3 2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

const chevronSvg = `
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

/**
 * @param {ReturnType<import('../../data/schedule.model.js').createScheduleModel>} scheduleModel
 */
export function renderTodayPreview(root, scheduleModel) {
  const lang = document.documentElement.getAttribute('data-lang');
  const s = getStrings(lang);
  const now = new Date();
  const dayIx = scheduleDayRowIndexFromDate(now, HOME_SCHEDULE_TIMEZONE);
  const day = dayIx !== null ? scheduleModel.days[dayIx] : null;
  const events = dayIx !== null ? (day?.events ?? []).slice() : [];

  root.setAttribute('aria-busy', 'false');

  if (dayIx === null || !scheduleModel.days[dayIx]) {
    root.innerHTML = `
      <div class="home-card__body">
        <p class="home-card__placeholder" style="background:none;animation:none;color:var(--ink-muted);font-weight:500;display:flex;align-items:center;justify-content:center;text-align:center;padding:0 1rem;">${escapeHtml(s.home_preview_weekend)}</p>
      </div>`;
    return { eventsCount: 0 };
  }

  if (!events.length) {
    root.innerHTML = `
      <div class="home-card__body">
        <p class="home-card__placeholder" style="background:none;animation:none;color:var(--ink-muted);font-weight:500;display:flex;align-items:center;justify-content:center;text-align:center;padding:0 1rem;">${escapeHtml(s.home_preview_empty)}</p>
      </div>`;
    return { eventsCount: 0 };
  }

  const place = escapeHtml(s.home_preview_place);
  const rows = events
    .map((ev, i) => {
      const time = escapeHtml(timeFromMeta(ev.meta));
      const coach = escapeHtml(s[ev.coachKey] ?? ev.coachKey);
      const title = escapeHtml(ev.title);
      const tagKey = scheduleTagI18nKey(ev.tag);
      const cat = escapeHtml(s[tagKey] ?? tagKey);
      const accent = safeAccent(ev.accent);
      const accentClass = ` home-card__slot--accent-${accent}`;
      const past = isPastInCyprus(ev.meta, now);
      const pastClass = past ? ' home-card__slot--past' : '';
      const finishedLabel =
        past && (s.home_preview_class_finished ?? '')
          ? `<span class="home-card__finished">${escapeHtml(s.home_preview_class_finished)}</span>`
          : '';
      const divider = i < events.length - 1 ? '<hr class="home-card__divider" />' : '';
      return `
        <a class="home-card__slot${accentClass}${pastClass}" href="#/schedule">
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

  const seeLabel = escapeHtml(s.home_see_all_classes);

  root.innerHTML = `
    <div class="home-card__body">
      <div class="home-card__slots">${rows}</div>
    </div>
    <a class="home-card__see-link" href="#/schedule" aria-label="${seeLabel}">
      <span>${seeLabel}</span>
      <span class="home-card__see-link-chevron">${chevronSvg}</span>
    </a>`;

  return { eventsCount: events.length };
}

export function renderTodayPreviewError(root) {
  const s = getStrings(document.documentElement.getAttribute('data-lang'));
  root.innerHTML = `
    <div class="home-card__body">
      <p class="home-card__placeholder" style="background:none;animation:none;color:var(--ink-muted);font-weight:500;display:flex;align-items:center;justify-content:center;text-align:center;padding:0 1rem;">${escapeHtml(s.home_preview_error)}</p>
    </div>`;
  root.setAttribute('aria-busy', 'false');
}

export function capFirst(str, locale) {
  if (!str) return str;
  return str.charAt(0).toLocaleUpperCase(locale) + str.slice(1);
}

/** "Saturday, 02 May" — weekday + day + month (Cyprus). */
export function renderHomeDate() {
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

/** "{n} classes today" — pulled from i18n. */
export function renderHomeStatus(eventsCount) {
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

/** Greeting — morning / afternoon / evening (Cyprus clock). */
export function renderHomeGreeting() {
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
