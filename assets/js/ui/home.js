/**
 * Home dashboard preview: today's first 1–2 group classes.
 * Re-renders on `justice:lang` so translations are always current.
 */
import { loadGroupSchedule } from '../data/schedule.js';
import { getStrings, normalizeLang } from '../i18n/apply.js';

function homeLocaleForLang(lang) {
  const L = normalizeLang(lang);
  if (L === 'el') return 'el-CY';
  if (L === 'ru') return 'ru-CY';
  return 'en-GB';
}

/** Big glass date card — weekday caps + underline, serif DD.MM, • MONTH • */
export function renderHomeDate() {
  const weekdayEl = document.getElementById('j-home-date-weekday');
  const numericEl = document.getElementById('j-home-date-numeric');
  const monthEl = document.getElementById('j-home-date-month');
  if (!weekdayEl || !numericEl || !monthEl) return;

  const lang = document.documentElement.getAttribute('data-lang');
  const locale = homeLocaleForLang(lang);
  const now = new Date();

  const weekdayRaw = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(now);
  weekdayEl.textContent = weekdayRaw.toLocaleUpperCase(locale);

  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  numericEl.textContent = `${dd}.${mm}`;

  const monRaw = new Intl.DateTimeFormat(locale, { month: 'short' }).format(now);
  const mon = monRaw.replace(/\./g, '').trim().toLocaleUpperCase(locale);
  monthEl.textContent = `\u2022 ${mon} \u2022`;
}

const escape = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * Index in `data.days` (Mon=0 … Sat=5). Sunday → `null` (no Sunday column in JSON).
 */
function scheduleIndexForToday(now = new Date()) {
  const d = now.getDay();
  if (d === 0) return null;
  if (d === 6) return 5;
  return d - 1;
}

function timeFromMeta(meta) {
  const t = String(meta || '').trim();
  return (t.match(/^(\d{1,2}:\d{2})/) || [, t])[1];
}

function render(root, data) {
  const lang = document.documentElement.getAttribute('data-lang');
  const s = getStrings(lang);
  const dayIx = scheduleIndexForToday();
  const day = dayIx !== null ? data.days[dayIx] : null;
  const events = dayIx !== null ? (day?.events ?? []).slice() : [];
  root.setAttribute('aria-busy', 'false');

  if (dayIx === null || !data.days[dayIx]) {
    root.innerHTML = `<p class="home-card__class-title">${escape(s.home_preview_weekend)}</p>`;
    return;
  }

  if (!events.length) {
    root.innerHTML = `<p class="home-card__class-title">${escape(s.home_preview_empty)}</p>`;
    return;
  }

  const countTpl = s.home_preview_helper_count ?? '';
  const helper =
    events.length > 1 && countTpl
      ? `<p class="home-card__helper">${escape(countTpl.replace(/\{n\}/g, String(events.length)))}</p>`
      : '';

  const place = escape(s.home_preview_place);
  const rows = events
    .map((ev, i) => {
      const time = escape(timeFromMeta(ev.meta));
      const coach = escape(s[ev.coachKey] ?? ev.coachKey);
      const title = escape(ev.title);
      const timeClass = i === 0 ? 'home-card__time home-card__time--cyan' : 'home-card__time home-card__time--cyan-soft';
      const divider = i < events.length - 1 ? '<hr class="home-card__divider" />' : '';
      return `
        <div class="home-card__slot">
          <p class="${timeClass}">${time}</p>
          <p class="home-card__class-title">${title}</p>
          <p class="home-card__meta"><span>${place}</span><span class="home-card__meta-dot"></span><span>${coach}</span></p>
        </div>${divider}`;
    })
    .join('');

  const seeLabel = escape(s.home_see_all_link ?? s.home_see_all_classes);
  const seeAria = escape(s.home_see_all_classes);

  root.innerHTML = `
    ${helper}
    <div class="home-card__slots">${rows}</div>
    <div class="home-card__footer">
      <a class="home-card__see-link" href="schedule.html" aria-label="${seeAria}">${seeLabel}</a>
    </div>`;
}

export async function initHomePreview() {
  const root = document.getElementById('j-home-preview');
  if (!root) return;

  let data;
  try {
    data = await loadGroupSchedule();
  } catch {
    const s = getStrings(document.documentElement.getAttribute('data-lang'));
    root.innerHTML = `<p class="home-card__class-title">${escape(s.home_preview_error)}</p>`;
    root.setAttribute('aria-busy', 'false');
    return;
  }
  render(root, data);
  renderHomeDate();
  document.addEventListener('justice:lang', () => {
    render(root, data);
    renderHomeDate();
  });
}
