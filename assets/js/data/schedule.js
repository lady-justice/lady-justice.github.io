import { GROUP_SCHEDULE_URL } from '../config.js';

const ACCENTS = new Set(['wine', 'teal', 'coral', 'gold', 'lavender']);

/** Mon–Sat (index 0–5); Sunday has no tab in JSON. */
const SCHEDULE_DAY_COUNT = 6;

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
