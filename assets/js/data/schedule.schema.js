/**
 * Validation for docs/group-schedule.json — no fetch/DOM.
 * TODO(stage2): stricter schema with id, startTime/endTime, coachId, category, bookingMode.
 */

import { SCHEDULE_DAY_COUNT } from '../core/dates.js';

/** Allowed `accent` — same tokens as CSS `schedule-card--accent-*`. */
export const SCHEDULE_ACCENTS = Object.freeze(['teal', 'berry', 'warm', 'violet']);
const SCHEDULE_ACCENT_SET = new Set(SCHEDULE_ACCENTS);

/** Canonical event category for JSON `tag`. */
export const SCHEDULE_TAGS = Object.freeze(['fitness', 'kids', 'dance']);
const SCHEDULE_TAG_SET = new Set(SCHEDULE_TAGS);

export function isValidWeekday(value) {
  const allowed = new Set(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);
  return typeof value === 'string' && allowed.has(value.toLowerCase());
}

export function isValidCategory(value) {
  return SCHEDULE_TAG_SET.has(String(value || '').toLowerCase());
}

export function validateScheduleItem(item, dayIndex, eventIndex) {
  if (!item || typeof item !== 'object') {
    throw new Error(`Invalid event at day ${dayIndex}, event ${eventIndex}`);
  }
  if (
    typeof item.title !== 'string' ||
    typeof item.meta !== 'string' ||
    typeof item.coachKey !== 'string'
  ) {
    throw new Error(`Invalid event fields at day ${dayIndex}, event ${eventIndex}`);
  }
  if (!SCHEDULE_TAG_SET.has(String(item.tag || '').toLowerCase())) {
    throw new Error(`Invalid event tag at day ${dayIndex}, event ${eventIndex}: ${item.tag}`);
  }
  const accentKey = String(item.accent ?? 'teal').toLowerCase();
  if (!SCHEDULE_ACCENT_SET.has(accentKey)) {
    throw new Error(`Invalid event accent at day ${dayIndex}, event ${eventIndex}: ${item.accent}`);
  }
}

export function validateSchedule(rawSchedule) {
  const data = rawSchedule;
  if (!data || !Array.isArray(data.days) || data.days.length !== SCHEDULE_DAY_COUNT) {
    throw new Error(`Invalid schedule: expected ${SCHEDULE_DAY_COUNT} days`);
  }
  data.days.forEach((day, i) => {
    if (!day.headingId || !day.dayNameKey || !Array.isArray(day.events)) {
      throw new Error(`Invalid schedule day at index ${i}`);
    }
    day.events.forEach((ev, j) => validateScheduleItem(ev, i, j));
  });
  return data;
}

export { SCHEDULE_TAG_SET, SCHEDULE_ACCENT_SET };
