/**
 * Schedule page: renders weekday columns + tab switcher (count matches JSON `days`).
 */
import { loadGroupSchedule, safeAccent } from '../data/schedule.js';
import { getStrings } from '../i18n/apply.js';

function buildPanels(container, data) {
  const lang = document.documentElement.getAttribute('data-lang');
  const s = getStrings(lang);
  const frag = document.createDocumentFragment();

  data.days.forEach((day, dayIx) => {
    const section = document.createElement('section');
    section.className = `day${dayIx === 0 ? ' day--active' : ''}`;
    section.id = `j-day-${dayIx}`;
    section.role = 'tabpanel';
    section.setAttribute('aria-labelledby', `j-tab-${dayIx} ${day.headingId}`);
    section.dataset.day = String(dayIx);

    const h = document.createElement('h2');
    h.id = day.headingId;
    h.className = 'day__name';
    h.dataset.i18n = day.dayNameKey;
    h.textContent = s[day.dayNameKey] ?? '';

    const list = document.createElement('div');
    list.className = 'day__list';

    day.events.forEach((ev) => {
      const accent = safeAccent(ev.accent);
      const card = document.createElement('article');
      card.className = `pill pill--${accent}`;
      card.innerHTML = `
        <span class="pill__bar" aria-hidden="true"></span>
        <div class="pill__body">
          <p class="pill__title"></p>
          <p class="pill__coach" data-i18n="${ev.coachKey}"></p>
          <p class="pill__meta"></p>
        </div>`;
      card.querySelector('.pill__title').textContent = ev.title;
      card.querySelector('.pill__coach').textContent = s[ev.coachKey] ?? '';
      card.querySelector('.pill__meta').textContent = ev.meta;
      list.append(card);
    });

    section.append(h, list);
    frag.append(section);
  });

  container.replaceChildren(frag);
}

function wireTabs(dayCount) {
  const tabs = Array.from(document.querySelectorAll('.week__tab'));
  const panels = Array.from(document.querySelectorAll('.week__panels .day'));
  if (tabs.length !== dayCount || panels.length !== dayCount) return;

  let selected = panels.findIndex((p) => p.classList.contains('day--active'));
  if (selected < 0) selected = 0;

  const sync = () => {
    tabs.forEach((tab, i) => tab.setAttribute('aria-selected', i === selected ? 'true' : 'false'));
    panels.forEach((panel, i) => panel.classList.toggle('day--active', i === selected));
  };

  tabs.forEach((tab, i) =>
    tab.addEventListener('click', () => {
      selected = i;
      sync();
    })
  );

  sync();
}

function showError(container, err) {
  const p = document.createElement('p');
  p.className = 'week__error';
  p.role = 'alert';
  p.textContent = `Could not load schedule: ${err.message}. Run a static server, e.g. python3 -m http.server 8000`;
  container.replaceChildren(p);
}

export async function initSchedulePage() {
  const container = document.getElementById('j-week-panels');
  if (!container) return;

  let data;
  try {
    data = await loadGroupSchedule();
  } catch (err) {
    showError(container, err);
    return;
  }
  buildPanels(container, data);
  wireTabs(data.days.length);
}
