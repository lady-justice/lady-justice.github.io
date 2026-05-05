/**
 * Date/time helpers — no DOM.
 */

/** Mon–Sat rows in group-schedule.json */
export const SCHEDULE_DAY_COUNT = 6;

/**
 * `Date#getDay()` → index in `group-schedule.json` `days` (Mon = 0 … Sat = 5).
 * Sunday → `null`.
 */
export function scheduleDataIndexFromJsWeekday(jsWeekday) {
  if (jsWeekday === 0) return null;
  return jsWeekday - 1;
}

/** Local midnight of the Monday that starts the ISO-style week (Mon–Sun) containing `date`. */
export function startOfWeekMonday(date = new Date()) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dow = d.getDay();
  const delta = dow === 0 ? -6 : 1 - dow;
  d.setDate(d.getDate() + delta);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(base, n) {
  return new Date(base.getFullYear(), base.getMonth(), base.getDate() + n);
}

export function sameLocalDate(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Parse `meta` time strings like `10:00–11:00` or `16:30` for timeline UI.
 * TODO(stage2): prefer explicit startTime/endTime fields in JSON.
 */
export function parseScheduleMetaTimes(meta) {
  const raw = String(meta || '').trim();
  const enDash = raw.match(/^(\d{1,2}:\d{2})\s*[–—-]\s*(\d{1,2}:\d{2})/);
  if (enDash) return { start: enDash[1], end: enDash[2] };
  const single = raw.match(/^(\d{1,2}:\d{2})/);
  if (single) return { start: single[1], end: '' };
  return { start: raw, end: '' };
}

/** Minutes since midnight from `HH:MM` or null if invalid. */
export function parseTimeToMinutes(time) {
  const m = String(time || '')
    .trim()
    .match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

export function formatTimeRange(startTime, endTime) {
  const s = String(startTime || '').trim();
  const e = String(endTime || '').trim();
  if (s && e) return `${s}–${e}`;
  return s || e || '';
}

export function isValidTime(value) {
  return parseTimeToMinutes(value) !== null;
}

/** Compare two schedule items by parsed start time (missing → end). */
export function compareByStartTime(a, b) {
  const ma = parseScheduleMetaTimes(a.meta);
  const mb = parseScheduleMetaTimes(b.meta);
  const ta = parseTimeToMinutes(ma.start) ?? 9999;
  const tb = parseTimeToMinutes(mb.start) ?? 9999;
  return ta - tb;
}
