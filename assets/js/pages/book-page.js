const CALENDLY_URL =
  'https://calendly.com/themida-lj/30min?hide_event_type_details=1&hide_gdpr_banner=1&background_color=fff6f1&text_color=3a2832&primary_color=14a9a8';

const BOOK_HTML = /* html */ `
  <main>
    <section class="book" id="book" aria-labelledby="book-title">
      <span id="book-individual" class="book__jump" aria-hidden="true"></span>
      <header class="book__head">
        <p class="book__kicker" data-i18n="book_kicker">Scheduling</p>
        <h1 id="book-title" class="book__title" data-i18n="book_title">Book a lesson</h1>
        <p class="book__sub" data-i18n="book_sub">Choose a time below.</p>
      </header>
      <span id="book-studio" class="book__jump" aria-hidden="true"></span>
      <div class="book__frame">
        <div class="calendly-inline-widget" data-url="${CALENDLY_URL}"></div>
      </div>
    </section>
  </main>
`;

function loadCalendlyScript() {
  return new Promise((resolve, reject) => {
    const finish = () => {
      window.Calendly?.initInlineWidgets?.();
      resolve();
    };
    if (window.Calendly?.initInlineWidgets) {
      finish();
      return;
    }
    const existing = document.querySelector('script[data-calendly-widget]');
    if (existing) {
      if (window.Calendly?.initInlineWidgets) {
        finish();
        return;
      }
      existing.addEventListener('load', finish, { once: true });
      existing.addEventListener('error', reject, { once: true });
      setTimeout(() => {
        if (window.Calendly?.initInlineWidgets) finish();
      }, 0);
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://assets.calendly.com/assets/external/widget.js';
    s.async = true;
    s.dataset.calendlyWidget = '1';
    s.onload = finish;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

/**
 * @param {HTMLElement} root
 * @param {{ signal?: AbortSignal }} [_opts]
 */
export async function mountBookPage(root, _opts = {}) {
  root.innerHTML = BOOK_HTML;
  try {
    await loadCalendlyScript();
  } catch (e) {
    console.warn('Calendly widget failed to load', e);
  }
}
