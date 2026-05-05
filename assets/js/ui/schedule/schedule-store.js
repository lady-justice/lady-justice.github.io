import { startOfWeekMonday, addDays } from '../../core/dates.js';
import { defaultSelectedStripIndex } from './week-strip.js';

/**
 * Minimal mutable UI state for the schedule page (week focus + selected tab).
 */
export function createSchedulePageStore(now = new Date()) {
  let viewWeekStart = startOfWeekMonday(now);
  let selected = defaultSelectedStripIndex(viewWeekStart, now);

  return {
    get viewWeekStart() {
      return viewWeekStart;
    },
    get selected() {
      return selected;
    },
    setSelected(ix) {
      selected = ix;
    },
    shiftWeek(deltaDays) {
      viewWeekStart = addDays(viewWeekStart, deltaDays);
    },
    jumpToToday(nowDate = new Date()) {
      viewWeekStart = startOfWeekMonday(nowDate);
      selected = defaultSelectedStripIndex(viewWeekStart, nowDate);
    },
  };
}
