import { mountHomePage } from '../pages/home-page.js';
import { mountSchedulePage } from '../pages/schedule-page.js';
import { mountBookPage } from '../pages/book-page.js';
import { mountStudioPage } from '../pages/studio-page.js';
import { mountContactPage } from '../pages/contact-page.js';

/**
 * Hash paths (after leading #) are normalized to keys like "/", "/schedule".
 * `title` is a short-lived fallback before applyLang() sets i18n meta titles.
 */
export const ROUTES = [
  {
    path: '/',
    key: 'home',
    title: 'JusticeApp — JUSTICE Fitness & Dance, Nicosia',
    mount: mountHomePage,
  },
  {
    path: '/schedule',
    key: 'schedule',
    title: 'Group Schedule — JusticeApp',
    mount: mountSchedulePage,
  },
  {
    path: '/book',
    key: 'book',
    title: 'Book a private class — JusticeApp',
    mount: mountBookPage,
  },
  {
    path: '/studio',
    key: 'studio',
    title: 'Studio — JusticeApp',
    mount: mountStudioPage,
  },
  {
    path: '/contact',
    key: 'contact',
    title: 'Contact — JusticeApp',
    mount: mountContactPage,
  },
];
