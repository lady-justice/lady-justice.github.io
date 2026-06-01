import { initHomePage } from '../ui/home/home-page.js';

const HOME_HTML = /* html */ `
  <main class="home-main">
    <section class="home" aria-labelledby="home-schedule-heading">
      <p class="home__greeting" id="j-home-greeting" aria-live="polite">
        <span class="home__greeting-text" data-i18n="home_greeting">Good morning, Christina!</span>
        <span class="home__greeting-emoji" aria-hidden="true">&#128075;</span>
      </p>

      <article class="home__date" role="group" data-i18n-attr="aria-label:home_date_aria">
        <div class="home__date-body">
          <span class="home__date-eyebrow" data-i18n="home_today_eyebrow">TODAY</span>
          <h1 class="home__date-title" id="j-home-date-title">Saturday, 02 May</h1>
          <p class="home__date-status">
            <span class="home__date-status-icon" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect x="3.5" y="5.5" width="17" height="14" rx="2.5" stroke="currentColor" stroke-width="1.6"/>
                <path d="M3.5 10.5h17" stroke="currentColor" stroke-width="1.6"/>
                <path d="M8 3.5V7M16 3.5V7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
              </svg>
            </span>
            <span id="j-home-date-status">3 classes today</span>
          </p>
        </div>
      </article>

      <section class="home__today" aria-labelledby="home-schedule-heading">
        <header class="home__intro">
          <h2 id="home-schedule-heading" class="home__heading" data-i18n="home_today_schedule">Today at the studio</h2>
        </header>

        <div id="j-home-preview" class="home-card home-card--schedule" aria-busy="true" aria-live="polite">
          <div class="home-card__body">
            <p class="home-card__placeholder">&nbsp;</p>
          </div>
        </div>
      </section>

      <div class="home__booking">
        <a class="home__summer-cta" href="#/schedule" data-i18n-attr="aria-label:home_summer_promo_aria">
          <span class="home__summer-cta-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.6"/>
              <path d="M12 3v2M12 19v2M5.64 5.64l1.41 1.41M16.95 16.95l1.41 1.41M3 12h2M19 12h2M5.64 18.36l1.41-1.41M16.95 7.05l1.41-1.41" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            </svg>
          </span>
          <span class="home__summer-cta-text">
            <span class="home__summer-cta-title-row">
              <span class="home__summer-cta-title" data-i18n="home_summer_promo">Summer schedule</span>
              <span class="home__summer-cta-badge" data-i18n="home_summer_promo_badge">NEW</span>
            </span>
            <span class="home__summer-cta-sub" data-i18n="home_summer_promo_sub">See what’s on this week</span>
          </span>
          <span class="home__summer-cta-arrow" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
        </a>
      </div>
    </section>
  </main>
`;

/**
 * @param {HTMLElement} root
 * @param {{ signal?: AbortSignal }} [_opts]
 */
export function mountHomePage(root, _opts = {}) {
  const { signal } = _opts;
  root.innerHTML = HOME_HTML;
  return initHomePage({ signal });
}
