/**
 * Home dashboard orchestration.
 */
import { fetchSchedule } from '../../data/schedule.api.js';
import { validateSchedule } from '../../data/schedule.schema.js';
import { createScheduleModel } from '../../data/schedule.model.js';
import {
  renderTodayPreview,
  renderTodayPreviewError,
  renderHomeDate,
  renderHomeGreeting,
  renderHomeStatus,
  HOME_SCHEDULE_TIMEZONE,
} from './today-preview.js';

export { HOME_SCHEDULE_TIMEZONE };

export async function initHomePage({ signal } = {}) {
  const root = document.getElementById('j-home-preview');
  if (!root) return;

  let scheduleModel;
  try {
    const raw = await fetchSchedule();
    if (signal?.aborted) return;
    scheduleModel = createScheduleModel(validateSchedule(raw));
  } catch (err) {
    console.warn('Home preview: schedule load failed', err);
    renderTodayPreviewError(root);
    renderHomeGreeting();
    renderHomeDate();
    renderHomeStatus(0);
    return;
  }

  function refreshPreview() {
    const { eventsCount } = renderTodayPreview(root, scheduleModel);
    renderHomeStatus(eventsCount);
  }

  refreshPreview();
  renderHomeDate();
  renderHomeGreeting();

  const interval = setInterval(() => {
    if (document.visibilityState === 'visible') {
      refreshPreview();
      renderHomeDate();
      renderHomeGreeting();
    }
  }, 60_000);
  signal?.addEventListener('abort', () => clearInterval(interval), { once: true });

  document.addEventListener(
    'justice:lang',
    () => {
      refreshPreview();
      renderHomeDate();
      renderHomeGreeting();
    },
    { signal }
  );
}

/** @deprecated Use initHomePage */
export const initHomePreview = initHomePage;
