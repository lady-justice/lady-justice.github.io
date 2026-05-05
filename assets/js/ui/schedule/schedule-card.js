/**
 * Single schedule card DOM — receives validated JSON event + i18n strings bag.
 */
import { parseScheduleMetaTimes } from '../../core/dates.js';
import {
  safeAccent,
  scheduleTagI18nKey,
  normalizeScheduleTag,
} from '../../data/schedule.model.js';

const ICON_CLOCK =
  '<svg class="schedule-card__clock" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/><path d="M12 7.25v5.25l3.25 1.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';

const ICON_PIN =
  '<svg class="schedule-card__pin" width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21s7-4.35 7-11a7 7 0 1 0-14 0c0 6.65 7 11 7 11Z" stroke="currentColor" stroke-width="1.45" stroke-linejoin="round"/><circle cx="12" cy="10" r="2" fill="currentColor"/></svg>';

const ICON_CAT_FITNESS =
  '<svg class="schedule-card__cat-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12c2.2-5 3.8-5 6 0s3.8 5 6 0 3.8-5 6 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const ICON_CAT_DANCE =
  '<svg class="schedule-card__cat-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 18V5l12-2v13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="6" cy="18" r="3" stroke="currentColor" stroke-width="1.5"/><circle cx="18" cy="16" r="3" stroke="currentColor" stroke-width="1.5"/></svg>';

const ICON_CAT_KIDS =
  '<svg class="schedule-card__cat-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3l1.2 3.2L16.5 7l-3.3 1.3L12 11.5 10.8 8.3 7.5 7l3.3-1.3L12 3Z" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round"/><path d="M8 14.5c0 2.2 1.8 4 4 4s4-1.8 4-4" stroke="currentColor" stroke-width="1.35" stroke-linecap="round"/></svg>';

function categoryChipIconHtml(tag) {
  const t = normalizeScheduleTag(tag);
  if (t === 'dance') return ICON_CAT_DANCE;
  if (t === 'kids') return ICON_CAT_KIDS;
  return ICON_CAT_FITNESS;
}

function coachInitials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * @param {object} ev — validated schedule event
 * @param {Record<string, string>} s — strings bag from getStrings()
 */
export function createScheduleCardElement(ev, s) {
  const accent = safeAccent(ev.accent);
  const { start, end } = parseScheduleMetaTimes(ev.meta);
  const coachLabel = s[ev.coachKey] ?? ev.coachKey;
  const initials = coachInitials(coachLabel);
  const tagKey = scheduleTagI18nKey(ev.tag);
  const tagLabel = s[tagKey] ?? tagKey;

  const art = document.createElement('article');
  art.className = `schedule-card schedule-card--accent-${accent}`;
  art.setAttribute('data-schedule-tag', normalizeScheduleTag(ev.tag));

  const timeShell = document.createElement('div');
  timeShell.className = 'schedule-card__time-shell';
  const timeRail = document.createElement('span');
  timeRail.className = 'schedule-card__time-rail';
  timeRail.setAttribute('aria-hidden', 'true');
  const timeInner = document.createElement('div');
  timeInner.className = 'schedule-card__time-inner';
  timeInner.insertAdjacentHTML('afterbegin', ICON_CLOCK);
  const timeStack = document.createElement('div');
  timeStack.className = 'schedule-card__time-stack';
  const startEl = document.createElement('span');
  startEl.className = 'schedule-card__time-start';
  startEl.textContent = start;
  timeStack.append(startEl);
  if (end) {
    const connector = document.createElement('div');
    connector.className = 'schedule-card__time-connector';
    connector.setAttribute('aria-hidden', 'true');
    const dot = document.createElement('span');
    dot.className = 'schedule-card__time-connector-dot';
    const line = document.createElement('span');
    line.className = 'schedule-card__time-connector-line';
    connector.append(dot, line);
    const endEl = document.createElement('span');
    endEl.className = 'schedule-card__time-end';
    endEl.textContent = end;
    timeStack.append(connector, endEl);
  }
  timeInner.append(timeStack);
  timeShell.append(timeRail, timeInner);

  const content = document.createElement('div');
  content.className = 'schedule-card__content';

  const top = document.createElement('div');
  top.className = 'schedule-card__top';

  const textCol = document.createElement('div');
  textCol.className = 'schedule-card__text';

  const title = document.createElement('p');
  title.className = 'schedule-card__title';
  title.textContent = ev.title;

  const catChip = document.createElement('span');
  catChip.className = 'schedule-card__category-chip';
  const catIconWrap = document.createElement('span');
  catIconWrap.className = 'schedule-card__category-icon';
  catIconWrap.setAttribute('aria-hidden', 'true');
  catIconWrap.innerHTML = categoryChipIconHtml(ev.tag);
  const catLabel = document.createElement('span');
  catLabel.className = 'schedule-card__category-label';
  catLabel.dataset.i18n = tagKey;
  catLabel.textContent = tagLabel;
  catChip.append(catIconWrap, catLabel);

  textCol.append(catChip, title);

  const menu = document.createElement('button');
  menu.type = 'button';
  menu.className = 'schedule-card__menu';
  menu.setAttribute('aria-label', s.schedule_card_menu_aria ?? 'Menu');
  menu.tabIndex = -1;
  menu.innerHTML = '<span class="schedule-card__menu-dots" aria-hidden="true"></span>';

  top.append(textCol, menu);

  const chipsRow = document.createElement('div');
  chipsRow.className = 'schedule-card__chips';

  const placeChip = document.createElement('span');
  placeChip.className = 'schedule-card__meta-chip schedule-card__meta-chip--place';
  const pinIcon = document.createElement('span');
  pinIcon.className = 'schedule-card__meta-chip-icon';
  pinIcon.setAttribute('aria-hidden', 'true');
  pinIcon.innerHTML = ICON_PIN;
  const placeTxt = document.createElement('span');
  placeTxt.dataset.i18n = 'schedule_room_studio';
  placeTxt.textContent = s.schedule_room_studio ?? '';
  placeChip.append(pinIcon, placeTxt);

  const coachChip = document.createElement('span');
  coachChip.className = 'schedule-card__meta-chip schedule-card__meta-chip--coach';
  const av = document.createElement('span');
  av.className = 'schedule-card__avatar';
  av.setAttribute('aria-hidden', 'true');
  av.textContent = initials;
  const coachSpan = document.createElement('span');
  coachSpan.className = 'schedule-card__coach-name';
  coachSpan.dataset.i18n = ev.coachKey;
  coachSpan.textContent = coachLabel;
  coachChip.append(av, coachSpan);

  chipsRow.append(placeChip, coachChip);
  content.append(top, chipsRow);
  art.append(timeShell, content);

  return art;
}
