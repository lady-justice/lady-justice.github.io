const CONTACT_HTML = /* html */ `
  <main class="contact-page">
    <header class="contact-intro">
      <h1 class="contact-intro__title" data-i18n="contact_intro_title">Contact</h1>
      <p class="contact-intro__note" data-i18n="contact_intro_note">Bookings and questions — reach us by email, phone, or Instagram.</p>
      <p class="contact-page__cross">
        <a class="contact-page__cross-link" href="#/studio" data-i18n="contact_link_studio">Studio location &amp; map</a>
      </p>
    </header>
  </main>
`;

/**
 * @param {HTMLElement} root
 * @param {{ signal?: AbortSignal }} [_opts]
 */
export function mountContactPage(root, _opts = {}) {
  root.innerHTML = CONTACT_HTML;
}
