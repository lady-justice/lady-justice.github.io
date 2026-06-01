const GOOGLE_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbwfhJ1mzoK691X-ihKas3VeGER3QRKxan9c-MRIMcFSpvjMm-AF3jFJiRZ0ao2WxROxzg/exec'.trim();
const TEMP_SHARED_TOKEN = 'justice-trainer-checkin-temp-v1';

const state = {
  /** @type {AttendanceRow[]} */
  rows: [],
  /** @type {AttendanceRow[]} */
  filteredRows: [],
};

const dateFromInput = document.querySelector('#attendance-date-from');
const dateToInput = document.querySelector('#attendance-date-to');
const classFilter = document.querySelector('#attendance-class-filter');
const trainerFilter = document.querySelector('#attendance-trainer-filter');
const resetButton = document.querySelector('#attendance-reset');
const loadingEl = document.querySelector('#attendance-loading');
const errorEl = document.querySelector('#attendance-error');
const emptyEl = document.querySelector('#attendance-empty');
const listEl = document.querySelector('#attendance-list');
const resultsCountEl = document.querySelector('#attendance-results-count');
const totalClassesEl = document.querySelector('#attendance-total-classes');
const totalVisitsEl = document.querySelector('#attendance-total-visits');
const uniqueStudentsEl = document.querySelector('#attendance-unique-students');
const topClassEl = document.querySelector('#attendance-top-class');

/**
 * @typedef {object} AttendanceRow
 * @property {string} submittedAt
 * @property {string} date
 * @property {string} day
 * @property {string} trainer
 * @property {string} scheduledTrainer
 * @property {boolean} isSubstitute
 * @property {string} className
 * @property {string} classTime
 * @property {string[]} students
 * @property {string} notes
 */

initAttendancePage();

async function initAttendancePage() {
  if (
    !dateFromInput ||
    !dateToInput ||
    !classFilter ||
    !trainerFilter ||
    !resetButton ||
    !loadingEl ||
    !errorEl ||
    !emptyEl ||
    !listEl ||
    !resultsCountEl ||
    !totalClassesEl ||
    !totalVisitsEl ||
    !uniqueStudentsEl ||
    !topClassEl
  ) {
    return;
  }

  bindEvents();
  await loadAttendance();
}

function bindEvents() {
  [dateFromInput, dateToInput, classFilter, trainerFilter].forEach((control) => {
    control.addEventListener('change', applyFilters);
  });

  resetButton.addEventListener('click', () => {
    dateFromInput.value = '';
    dateToInput.value = '';
    classFilter.value = '';
    trainerFilter.value = '';
    applyFilters();
  });
}

async function loadAttendance() {
  setLoading(true);
  setError('');

  try {
    const url = `${GOOGLE_APPS_SCRIPT_URL}?view=attendance&token=${encodeURIComponent(TEMP_SHARED_TOKEN)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Apps Script returned ${response.status}`);
    }

    const text = await response.text();
    const payload = parseJsonResponse(text);
    const rows = normalizeRows(payload.rows);

    state.rows = rows;
    populateFilterOptions(rows);
    setDefaultDateRange(rows);
    applyFilters();
  } catch (error) {
    console.error('Attendance load failed', error);
    state.rows = [];
    state.filteredRows = [];
    renderAll();
    setError(
      'Could not load attendance. Check that Apps Script doGet returns JSON with { ok: true, rows: [...] }.'
    );
  } finally {
    setLoading(false);
  }
}

function parseJsonResponse(text) {
  try {
    const data = JSON.parse(text);
    if (!data || data.ok === false || !Array.isArray(data.rows)) {
      throw new Error('Invalid attendance payload');
    }
    return data;
  } catch (error) {
    throw new Error(`Expected JSON from Apps Script, got: ${text.slice(0, 80)}`, { cause: error });
  }
}

function normalizeRows(rows) {
  return rows
    .map((row) => ({
      submittedAt: stringValue(row.submittedAt),
      date: normalizeDate(row.date),
      day: stringValue(row.day),
      trainer: stringValue(row.trainer),
      scheduledTrainer: stringValue(row.scheduledTrainer),
      isSubstitute: booleanValue(row.isSubstitute),
      className: stringValue(row.className),
      classTime: stringValue(row.classTime),
      students: normalizeStudents(row.students),
      notes: stringValue(row.notes),
    }))
    .filter((row) => row.date && row.className);
}

function normalizeDate(value) {
  const raw = stringValue(value);
  if (!raw) return '';
  if (/^\d{4}-\d{2}-\d{2}$/u.test(raw)) return raw;

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function normalizeStudents(value) {
  if (Array.isArray(value)) {
    return value.map(stringValue).filter(Boolean);
  }

  return stringValue(value)
    .split(',')
    .map((student) => student.trim())
    .filter(Boolean);
}

function booleanValue(value) {
  if (typeof value === 'boolean') return value;
  const normalized = stringValue(value).toLowerCase();
  return normalized === 'true' || normalized === 'yes' || normalized === '1';
}

function stringValue(value) {
  return String(value ?? '').trim();
}

function populateFilterOptions(rows) {
  const classNames = uniqueSorted(rows.map((row) => row.className));
  const trainers = uniqueSorted(rows.map((row) => row.trainer));

  classFilter.innerHTML =
    '<option value="">All classes</option>' +
    classNames.map((className) => optionHtml(className)).join('');

  trainerFilter.innerHTML =
    '<option value="">All trainers</option>' +
    trainers.map((trainer) => optionHtml(trainer)).join('');
}

function setDefaultDateRange(rows) {
  if (rows.length === 0) return;

  const dates = rows
    .map((row) => row.date)
    .filter(Boolean)
    .sort();
  dateFromInput.value = dates[0] || '';
  dateToInput.value = dates.at(-1) || '';
}

function applyFilters() {
  const from = dateFromInput.value;
  const to = dateToInput.value;
  const className = classFilter.value;
  const trainer = trainerFilter.value;

  state.filteredRows = state.rows
    .filter((row) => !from || row.date >= from)
    .filter((row) => !to || row.date <= to)
    .filter((row) => !className || row.className === className)
    .filter((row) => !trainer || row.trainer === trainer)
    .sort(compareRows);

  renderAll();
}

function renderAll() {
  renderSummary();
  renderResults();
}

function renderSummary() {
  const rows = state.filteredRows;
  const allStudents = rows.flatMap((row) => row.students);
  const uniqueStudents = new Set(allStudents.map((student) => student.toLowerCase()));

  totalClassesEl.textContent = String(rows.length);
  totalVisitsEl.textContent = String(allStudents.length);
  uniqueStudentsEl.textContent = String(uniqueStudents.size);
  topClassEl.textContent = mostAttendedClass(rows);
}

function mostAttendedClass(rows) {
  if (rows.length === 0) return '-';

  const counts = new Map();
  rows.forEach((row) => {
    counts.set(row.className, (counts.get(row.className) || 0) + row.students.length);
  });

  const [name, count] = [...counts.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
  )[0];
  return count > 0 ? `${name} (${count})` : '-';
}

function renderResults() {
  const rows = state.filteredRows;

  resultsCountEl.textContent = `${rows.length} ${rows.length === 1 ? 'record' : 'records'}`;
  emptyEl.hidden = rows.length !== 0 || loadingEl.hidden === false || errorEl.hidden === false;
  listEl.innerHTML = rows.map(renderRecord).join('');
}

function renderRecord(row) {
  const substituteBadge = row.isSubstitute
    ? '<span class="attendance-record__badge">Substitute</span>'
    : '';
  const trainerLine =
    row.isSubstitute && row.scheduledTrainer
      ? `${escapeHtml(row.trainer)} <span>instead of ${escapeHtml(row.scheduledTrainer)}</span>`
      : escapeHtml(row.trainer);
  const notes = row.notes
    ? `<p class="attendance-record__notes"><span>Notes:</span> ${escapeHtml(row.notes)}</p>`
    : '';

  return `
    <article class="attendance-record">
      <header class="attendance-record__head">
        <div>
          <p class="attendance-record__date">${escapeHtml(formatDisplayDate(row.date))}</p>
          <h3 class="attendance-record__title">${escapeHtml(row.className)}</h3>
        </div>
        ${substituteBadge}
      </header>
      <div class="attendance-record__meta">
        <span>${escapeHtml(row.day || dayNameFromDate(row.date))}</span>
        <span>${escapeHtml(row.classTime || 'Time not set')}</span>
        <span>${trainerLine}</span>
      </div>
      <div class="attendance-record__students">
        <p class="attendance-record__students-count">${row.students.length} ${
          row.students.length === 1 ? 'student' : 'students'
        }</p>
        <p class="attendance-record__students-list">${escapeHtml(row.students.join(', ') || 'No names')}</p>
      </div>
      ${notes}
    </article>
  `;
}

function setLoading(isLoading) {
  loadingEl.hidden = !isLoading;
}

function setError(message) {
  errorEl.hidden = !message;
  errorEl.textContent = message;
}

function compareRows(a, b) {
  return (
    b.date.localeCompare(a.date) ||
    a.classTime.localeCompare(b.classTime) ||
    a.className.localeCompare(b.className)
  );
}

function uniqueSorted(values) {
  return [...new Set(values.map(stringValue).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' })
  );
}

function optionHtml(value) {
  return `<option value="${escapeAttr(value)}">${escapeHtml(value)}</option>`;
}

function formatDisplayDate(value) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function dayNameFromDate(value) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
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
