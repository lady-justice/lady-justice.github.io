import { scheduleDataIndexFromJsWeekday } from './core/dates.js';
import { fetchSchedule } from './data/schedule.api.js';
import { validateSchedule } from './data/schedule.schema.js';

const GOOGLE_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbwfhJ1mzoK691X-ihKas3VeGER3QRKxan9c-MRIMcFSpvjMm-AF3jFJiRZ0ao2WxROxzg/exec'.trim();
const TEMP_SHARED_TOKEN = 'justice-trainer-checkin-temp-v1';
const ROSTER_STORAGE_PREFIX = 'justice-trainer-roster:';
const ROSTER_MIGRATION_FLAG = 'justice-trainer-roster-groups-v1';

const COACH_LABELS = Object.freeze({
  schedule_coach_themida: 'Themida',
  schedule_coach_julia: 'Julia',
  schedule_coach_christina: 'Christina',
  schedule_coach_dinos: 'Dinos',
  schedule_coach_sofia: 'Sofia',
  schedule_coach_sofia_christina: 'Sofia + Christina',
});

const DAY_LABELS = Object.freeze({
  schedule_day_mon: 'Monday',
  schedule_day_tue: 'Tuesday',
  schedule_day_wed: 'Wednesday',
  schedule_day_thu: 'Thursday',
  schedule_day_fri: 'Friday',
  schedule_day_sat: 'Saturday',
});

const SUBSTITUTE_TRAINERS = ['Themida', 'Julia', 'Christina', 'Sofia', 'Kristina', 'Dinos'];

const STATUS_COPY = Object.freeze({
  idle: 'Ready to submit',
  saving: 'Saving attendance...',
  saved: 'Saved. Check the Google Sheet for a new row.',
  error: 'Could not save. Please try again.',
  authError: 'Google Apps Script is not public yet. Redeploy with Who has access: Anyone.',
  configError: 'Add the Google Apps Script URL in assets/js/trainers.js first.',
  scheduleError: 'Could not load the studio schedule.',
  noStudents: 'Mark or add at least one student.',
  noClass: 'Choose a class for this date.',
  substituteRequired: 'Choose the substitute trainer.',
});

const form = document.querySelector('#trainer-checkin-form');
const dateInput = document.querySelector('#trainer-date');
const classSelect = document.querySelector('#trainer-class');
const classSummary = document.querySelector('#trainer-class-summary');
const summaryTime = document.querySelector('#trainer-summary-time');
const summaryTrainer = document.querySelector('#trainer-summary-trainer');
const substituteCheckbox = document.querySelector('#trainer-substitute');
const substituteField = document.querySelector('#trainer-substitute-field');
const substituteSelect = document.querySelector('#trainer-substitute-name');
const rosterWrap = document.querySelector('#trainer-roster-wrap');
const rosterLabel = document.querySelector('#trainer-roster-label');
const rosterEl = document.querySelector('#trainer-roster');
const studentInput = document.querySelector('#trainer-student-input');
const studentAddButton = document.querySelector('#trainer-student-add');
const attendedList = document.querySelector('#trainer-attended-list');
const attendedCount = document.querySelector('#trainer-attended-count');
const attendedHint = document.querySelector('#trainer-attended-hint');
const statusEl = document.querySelector('#trainer-status');
const submitButton = document.querySelector('#trainer-submit');

/** @type {{ dayNameKey: string, events: Array<{ title: string, meta: string, coachKey: string }> }[]} */
let scheduleDays = [];
/** @type {string[]} */
let attended = [];

initTrainerCheckin();

async function initTrainerCheckin() {
  if (
    !form ||
    !dateInput ||
    !classSelect ||
    !classSummary ||
    !summaryTime ||
    !summaryTrainer ||
    !substituteCheckbox ||
    !substituteField ||
    !substituteSelect ||
    !rosterWrap ||
    !rosterLabel ||
    !rosterEl ||
    !studentInput ||
    !studentAddButton ||
    !attendedList ||
    !attendedCount ||
    !attendedHint ||
    !statusEl ||
    !submitButton
  ) {
    return;
  }

  dateInput.value = todayAsInputValue();
  renderSubstituteOptions();
  bindEvents();

  try {
    const raw = await fetchSchedule();
    scheduleDays = validateSchedule(raw).days;
    migrateLegacyRostersIfNeeded();
    populateClassOptions();
    onClassChanged();
  } catch (error) {
    console.error('Trainer check-in schedule load failed', error);
    classSelect.innerHTML = '<option value="">Schedule unavailable</option>';
    classSelect.disabled = true;
    setStatus('scheduleError');
  }
}

function bindEvents() {
  dateInput.addEventListener('change', () => {
    populateClassOptions();
    onClassChanged();
  });

  classSelect.addEventListener('change', onClassChanged);

  substituteCheckbox.addEventListener('change', () => {
    const isSubstitute = substituteCheckbox.checked;
    substituteField.hidden = !isSubstitute;
    substituteSelect.required = isSubstitute;
    if (!isSubstitute) substituteSelect.value = '';
  });

  rosterEl.addEventListener('change', (event) => {
    const input = event.target.closest('input[type="checkbox"]');
    if (!input) return;

    if (input.checked) {
      addAttended(input.value);
    } else {
      removeAttended(input.value);
    }
  });

  studentAddButton.addEventListener('click', addStudentFromInput);
  studentInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addStudentFromInput();
    }
  });

  attendedList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-remove-attended]');
    if (!button) return;
    removeAttended(button.dataset.removeAttended);
  });

  form.addEventListener('submit', handleSubmit);
}

function onClassChanged() {
  attended = [];
  updateClassSummary();
  renderRoster();
  renderAttendedList();
}

function renderSubstituteOptions() {
  substituteSelect.innerHTML =
    '<option value="">Choose trainer</option>' +
    SUBSTITUTE_TRAINERS.map(
      (name) => `<option value="${escapeAttr(name)}">${escapeHtml(name)}</option>`
    ).join('');
}

function todayAsInputValue() {
  const today = new Date();
  const offsetMs = today.getTimezoneOffset() * 60 * 1000;
  return new Date(today.getTime() - offsetMs).toISOString().slice(0, 10);
}

function parseInputDate(value) {
  const [year, month, day] = String(value).split('-').map(Number);
  return new Date(year, month - 1, day);
}

function dayIndexFromInputDate(value) {
  return scheduleDataIndexFromJsWeekday(parseInputDate(value).getDay());
}

function getDayIndexForSelectedDate() {
  if (!dateInput.value) return null;
  return dayIndexFromInputDate(dateInput.value);
}

function populateClassOptions() {
  const dayIndex = getDayIndexForSelectedDate();

  if (dayIndex === null) {
    classSelect.innerHTML = '<option value="">No classes on this date</option>';
    classSelect.disabled = true;
    classSelect.value = '';
    classSummary.hidden = true;
    return;
  }

  const events = scheduleDays[dayIndex]?.events ?? [];

  if (events.length === 0) {
    classSelect.innerHTML = '<option value="">No classes on this date</option>';
    classSelect.disabled = true;
    classSelect.value = '';
    classSummary.hidden = true;
    return;
  }

  classSelect.disabled = false;
  classSelect.innerHTML = events
    .map((event, eventIndex) => {
      const slot = `${dayIndex}:${eventIndex}`;
      const label = `${event.title} · ${event.meta}`;
      return `<option value="${slot}">${escapeHtml(label)}</option>`;
    })
    .join('');
}

function getSelectedSlot() {
  const value = classSelect.value;
  if (!value.includes(':')) return null;

  const [dayIndex, eventIndex] = value.split(':').map(Number);
  const event = scheduleDays[dayIndex]?.events?.[eventIndex];
  if (!event) return null;

  return {
    dayIndex,
    eventIndex,
    dayNameKey: scheduleDays[dayIndex].dayNameKey,
    dayLabel: DAY_LABELS[scheduleDays[dayIndex].dayNameKey] || scheduleDays[dayIndex].dayNameKey,
    title: event.title,
    meta: event.meta,
    tag: event.tag,
    coachKey: event.coachKey,
    coachLabel: COACH_LABELS[event.coachKey] || event.coachKey,
  };
}

function updateClassSummary() {
  const slot = getSelectedSlot();
  if (!slot) {
    classSummary.hidden = true;
    return;
  }

  classSummary.hidden = false;
  summaryTime.textContent = slot.meta;
  summaryTrainer.textContent = slot.coachLabel;
}

function rosterGroupFromTag(tag) {
  return String(tag || '').toLowerCase() === 'kids' ? 'kids' : 'adults';
}

function rosterGroupLabel(group) {
  return group === 'kids' ? 'Regular students (Kids)' : 'Regular students (Adults)';
}

function rosterStorageKey(group) {
  return `${ROSTER_STORAGE_PREFIX}${group}`;
}

function loadRoster(group) {
  if (!group) return [];

  try {
    const raw = localStorage.getItem(rosterStorageKey(group));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((name) => typeof name === 'string' && name.trim())
      : [];
  } catch {
    return [];
  }
}

function saveRoster(group, names) {
  if (!group) return;

  const unique = [...new Set(names.map((name) => name.trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' })
  );
  localStorage.setItem(rosterStorageKey(group), JSON.stringify(unique));
}

function mergeIntoRoster(group, names) {
  saveRoster(group, [...loadRoster(group), ...names]);
}

function migrateLegacyRostersIfNeeded() {
  if (localStorage.getItem(ROSTER_MIGRATION_FLAG)) return;

  const kidsNames = [];
  const adultNames = [];
  const legacyKeys = [];

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key?.startsWith(ROSTER_STORAGE_PREFIX)) continue;

    const suffix = key.slice(ROSTER_STORAGE_PREFIX.length);
    if (suffix === 'kids' || suffix === 'adults') continue;
    legacyKeys.push({ key, suffix });
  }

  for (const { key, suffix } of legacyKeys) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || '[]');
      if (!Array.isArray(parsed)) continue;

      const names = parsed.filter((name) => typeof name === 'string' && name.trim());
      const isKidsClass = scheduleDays.some((day) =>
        day.events.some((event) => event.title === suffix && event.tag === 'kids')
      );

      if (isKidsClass) {
        kidsNames.push(...names);
      } else {
        adultNames.push(...names);
      }

      localStorage.removeItem(key);
    } catch {
      // Skip invalid legacy entries.
    }
  }

  if (kidsNames.length) mergeIntoRoster('kids', kidsNames);
  if (adultNames.length) mergeIntoRoster('adults', adultNames);
  localStorage.setItem(ROSTER_MIGRATION_FLAG, '1');
}

function isAttending(name) {
  const normalized = name.toLocaleLowerCase();
  return attended.some((student) => student.toLocaleLowerCase() === normalized);
}

function addAttended(name) {
  const trimmed = String(name || '').trim();
  if (!trimmed || isAttending(trimmed)) return;

  attended.push(trimmed);
  renderRoster();
  renderAttendedList();
}

function removeAttended(name) {
  const normalized = String(name || '')
    .trim()
    .toLocaleLowerCase();
  attended = attended.filter((student) => student.toLocaleLowerCase() !== normalized);
  renderRoster();
  renderAttendedList();
}

function renderRoster() {
  const slot = getSelectedSlot();
  const group = slot ? rosterGroupFromTag(slot.tag) : null;
  const roster = group ? loadRoster(group) : [];

  if (!group || roster.length === 0) {
    rosterWrap.hidden = true;
    rosterEl.innerHTML = '';
    return;
  }

  rosterLabel.textContent = rosterGroupLabel(group);
  rosterWrap.hidden = false;
  rosterEl.setAttribute('aria-label', rosterGroupLabel(group));
  rosterEl.innerHTML = roster
    .map((name, index) => {
      const id = `trainer-roster-${index}`;
      const checked = isAttending(name) ? ' checked' : '';
      return `
        <label class="trainer-roster-item" for="${id}">
          <input id="${id}" type="checkbox" value="${escapeAttr(name)}"${checked} />
          <span class="trainer-roster-item__box" aria-hidden="true"></span>
          <span class="trainer-roster-item__name">${escapeHtml(name)}</span>
        </label>
      `;
    })
    .join('');
}

function addStudentFromInput() {
  const name = studentInput.value.trim();
  if (!name) return;

  addAttended(name);
  studentInput.value = '';
  studentInput.focus();
}

function renderAttendedList() {
  attendedCount.textContent = String(attended.length);

  if (attended.length === 0) {
    attendedList.innerHTML = '';
    attendedHint.hidden = false;
    return;
  }

  attendedHint.hidden = true;
  attendedList.innerHTML = attended
    .map(
      (student) => `
        <li class="trainer-attended-item">
          <span class="trainer-attended-item__name">${escapeHtml(student)}</span>
          <button
            class="trainer-attended-item__remove"
            type="button"
            data-remove-attended="${escapeAttr(student)}"
            aria-label="Remove ${escapeAttr(student)}"
          >&times;</button>
        </li>
      `
    )
    .join('');
}

async function handleSubmit(event) {
  event.preventDefault();

  const slot = getSelectedSlot();
  if (!slot) {
    setStatus('noClass');
    return;
  }

  if (attended.length === 0) {
    setStatus('noStudents');
    return;
  }

  if (substituteCheckbox.checked && !substituteSelect.value) {
    setStatus('substituteRequired');
    return;
  }

  if (!isConfiguredEndpoint(GOOGLE_APPS_SCRIPT_URL)) {
    setStatus('configError');
    return;
  }

  const payload = buildPayload(slot);
  setSaving(true);
  setStatus('saving');

  try {
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 401 || response.status === 403) {
      setStatus('authError');
      return;
    }

    if (!response.ok) {
      throw new Error(`Apps Script returned ${response.status}`);
    }

    mergeIntoRoster(rosterGroupFromTag(slot.tag), attended);
    setStatus('saved');
    resetFormAfterSave();
  } catch (error) {
    console.error('Trainer check-in failed', error);
    setStatus('error');
  } finally {
    setSaving(false);
  }
}

function buildPayload(slot) {
  const isSubstitute = substituteCheckbox.checked;
  const trainer = isSubstitute ? substituteSelect.value : slot.coachLabel;

  return {
    token: TEMP_SHARED_TOKEN,
    submittedAt: new Date().toISOString(),
    date: dateInput.value,
    day: slot.dayLabel,
    trainer,
    scheduledTrainer: slot.coachLabel,
    isSubstitute,
    className: slot.title,
    classTime: slot.meta,
    students: [...attended],
    notes: String(document.querySelector('#trainer-notes')?.value || '').trim(),
    source: 'justice-trainers-mvp',
  };
}

function resetFormAfterSave() {
  attended = [];
  substituteCheckbox.checked = false;
  substituteField.hidden = true;
  substituteSelect.required = false;
  substituteSelect.value = '';
  form.reset();
  dateInput.value = todayAsInputValue();
  populateClassOptions();
  onClassChanged();
}

function setSaving(isSaving) {
  submitButton.disabled = isSaving;
  submitButton.textContent = isSaving ? 'Saving...' : 'Submit attendance';
  form.toggleAttribute('aria-busy', isSaving);
}

function setStatus(status) {
  statusEl.textContent = STATUS_COPY[status] || STATUS_COPY.idle;
  statusEl.dataset.status = status;
}

function isConfiguredEndpoint(url) {
  const value = String(url || '').trim();
  return (
    value.length > 0 &&
    !value.includes('PASTE_GOOGLE_APPS_SCRIPT') &&
    /script\.google\.com\/macros\/s\/.+\/exec/u.test(value)
  );
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, '&#96;');
}
