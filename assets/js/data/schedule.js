import { GROUP_SCHEDULE_URL } from '../config.js';

const ACCENTS = new Set(['wine', 'teal', 'coral', 'gold', 'lavender']);

/** Mon–Sat (index 0–5); Sunday has no tab in JSON. */
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
  const dow = d.getDay(); // 0 Sun … 6 Sat
  const delta = dow === 0 ? -6 : 1 - dow;
  d.setDate(d.getDate() + delta);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Parse `meta` time strings like `10:00–11:00` or `16:30` for timeline UI.
 */
export function parseScheduleMetaTimes(meta) {
  const raw = String(meta || '').trim();
  const enDash = raw.match(/^(\d{1,2}:\d{2})\s*[–—-]\s*(\d{1,2}:\d{2})/);
  if (enDash) return { start: enDash[1], end: enDash[2] };
  const single = raw.match(/^(\d{1,2}:\d{2})/);
  if (single) return { start: single[1], end: '' };
  return { start: raw, end: '' };
}

function validate(data) {
  if (!data || !Array.isArray(data.days) || data.days.length !== SCHEDULE_DAY_COUNT) {
    throw new Error(`Invalid schedule: expected ${SCHEDULE_DAY_COUNT} days`);
  }
  data.days.forEach((day, i) => {
    if (!day.headingId || !day.dayNameKey || !Array.isArray(day.events)) {
      throw new Error(`Invalid schedule day at index ${i}`);
    }
    day.events.forEach((ev, j) => {
      if (typeof ev.title !== 'string' || typeof ev.meta !== 'string' || typeof ev.coachKey !== 'string') {
        throw new Error(`Invalid event at day ${i}, event ${j}`);
      }
    });
  });
  return data;
}

export function safeAccent(raw) {
  return ACCENTS.has(raw) ? raw : 'teal';
}

export async function loadGroupSchedule() {
  const res = await fetch(GROUP_SCHEDULE_URL);
  if (!res.ok) {
    throw new Error(`${GROUP_SCHEDULE_URL}: ${res.status} ${res.statusText}`);
  }
  return validate(await res.json());
}
