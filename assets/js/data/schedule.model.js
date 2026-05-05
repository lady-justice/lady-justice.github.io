/**
 * Normalization and derived fields for schedule — no DOM/fetch.
 */

import { SCHEDULE_ACCENT_SET, SCHEDULE_TAG_SET } from './schedule.schema.js';
import { compareByStartTime } from '../core/dates.js';

/** Accent class suffix — must match JSON `accent` and SCHEDULE_ACCENTS. */
export function safeAccent(raw) {
  const k = String(raw ?? 'teal').toLowerCase();
  return SCHEDULE_ACCENT_SET.has(k) ? k : 'teal';
}

/** i18n key for localized category label (Fitness / Kids / Dance). */
export function scheduleTagI18nKey(tag) {
  const t = String(tag || '').toLowerCase();
  if (t === 'kids') return 'schedule_filter_chip_kids';
  if (t === 'dance') return 'schedule_filter_chip_dance';
  if (t === 'fitness') return 'schedule_filter_chip_fitness';
  return 'schedule_track_group';
}

/** `ev.tag` → `data-schedule-tag` / category chip styling. */
export function normalizeScheduleTag(tag) {
  const t = String(tag || '').toLowerCase();
  return SCHEDULE_TAG_SET.has(t) ? t : 'fitness';
}

/** @param {{ days: unknown[] }} validatedSchedule — output of `validateSchedule`. */
export function createScheduleModel(validatedSchedule) {
  return Object.freeze({
    days: validatedSchedule.days,
  });
}

export function normalizeScheduleItem(item, context = {}) {
  const coachLabel = context.strings?.[item.coachKey] ?? item.coachKey;
  return Object.freeze({
    ...item,
    category: normalizeScheduleTag(item.tag),
    accentSafe: safeAccent(item.accent),
    coachLabel,
    timeLabel: item.meta,
  });
}

export function getClassesByWeekday(scheduleModel, weekdayRowIndex) {
  return scheduleModel.days[weekdayRowIndex]?.events ?? [];
}

/** Same six rows as JSON — Mon…Sat. */
export function groupClassesByWeekday(scheduleModel) {
  return scheduleModel.days.map((d) => d.events ?? []);
}

export function sortClassesByTime(items) {
  return [...items].sort(compareByStartTime);
}

/**
 * Row index (Mon=0 … Sat=5) for a calendar instant in a timezone, or null on Sunday.
 */
export function scheduleDayRowIndexFromDate(instant = new Date(), timeZone = 'Asia/Nicosia') {
  const w = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'long' }).format(instant);
  /** @type {Record<string, number>} */
  const map = { Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3, Friday: 4, Saturday: 5 };
  return map[w] ?? null;
}

/**
 * Events for “today” in `timeZone` from a validated schedule shape.
 */
export function getTodayClasses(scheduleModel, instant = new Date(), timeZone = 'Asia/Nicosia') {
  const ix = scheduleDayRowIndexFromDate(instant, timeZone);
  if (ix === null || !scheduleModel.days[ix]) return [];
  return [...(scheduleModel.days[ix].events ?? [])];
}
