import { APP_CONFIG } from '../core/config.js';

/**
 * Fetch raw schedule JSON — no validation or rendering.
 */
export async function fetchSchedule() {
  const url = APP_CONFIG.scheduleUrl;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${url}: ${res.status} ${res.statusText}`);
  }
  return res.json();
}
