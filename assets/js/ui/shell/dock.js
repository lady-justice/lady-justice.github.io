const dockHomeIcon = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
const dockScheduleIcon = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="14" rx="2.5" stroke="currentColor" stroke-width="1.6"/><path d="M3.5 10.5h17" stroke="currentColor" stroke-width="1.6"/><path d="M8 3.5V7M16 3.5V7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`;
const dockStudioIcon = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="12" cy="13" r="1.4" fill="currentColor"/></svg>`;
const dockPlusIcon = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>`;

export function dockTpl() {
  return /* html */ `
<nav class="dock" data-i18n-attr="aria-label:dock_nav_aria">
  <a class="dock__btn" href="index.html" data-nav-key="home">
    <span class="dock__icon">${dockHomeIcon}</span>
    <span class="dock__label" data-i18n="dock_home">Home</span>
  </a>
  <a class="dock__btn" href="schedule.html" data-nav-key="schedule">
    <span class="dock__icon">${dockScheduleIcon}</span>
    <span class="dock__label" data-i18n="dock_schedule">Schedule</span>
  </a>
  <a class="dock__btn dock__btn--fab" href="book.html" data-nav-key="book" data-i18n-attr="aria-label:dock_book_center">
    <span class="dock__icon">${dockPlusIcon}</span>
    <span class="dock__label" data-i18n="dock_book_center">Book</span>
  </a>
  <a class="dock__btn" href="studio.html" data-nav-key="studio">
    <span class="dock__icon">${dockStudioIcon}</span>
    <span class="dock__label" data-i18n="dock_studio">Studio</span>
  </a>
  <button type="button" class="dock__btn" id="j-dock-more" data-nav-key="more" aria-haspopup="dialog" aria-controls="j-drawer">
    <span class="dock__icon"><span class="dock__more-dots" aria-hidden="true"><span></span><span></span><span></span></span></span>
    <span class="dock__label" data-i18n="dock_more">More</span>
  </button>
</nav>`;
}

function activeNavKey() {
  const body = document.body;
  if (body.classList.contains('page--home')) return 'home';
  if (body.classList.contains('page--schedule')) return 'schedule';
  if (body.classList.contains('page--book')) return 'book';
  if (body.classList.contains('page--contact')) return 'contact';
  if (body.classList.contains('page--studio')) return 'studio';
  return null;
}

export function markActiveNav() {
  const key = activeNavKey();
  if (!key) return;
  document.querySelectorAll('.drawer__nav a').forEach((a) => {
    a.classList.toggle('is-active', a.dataset.navKey === key);
  });
  document.querySelectorAll('.dock .dock__btn').forEach((el) => {
    if (el.dataset.navKey === key) {
      el.setAttribute('aria-current', 'page');
    } else {
      el.removeAttribute('aria-current');
    }
  });
}
