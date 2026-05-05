/**
 * App-wide constants. Lower layer — do not import ui/data.
 * Keep VIEWPORT_DESKTOP_MIN_PX in sync with --bp-desktop-min in tokens.css.
 */
export const APP_CONFIG = Object.freeze({
  scheduleUrl: 'docs/group-schedule.json',
  /** Home / “today” preview uses this IANA zone for weekday row + clocks. */
  scheduleHomeTimezone: 'Asia/Nicosia',
  defaultLocale: 'en',
  supportedLocales: /** @type {const} */ (['en', 'el', 'ru']),
  storageKeys: Object.freeze({
    locale: 'justice-lang',
    localeLegacy: /** @type {const} */ (['lj-lang']),
    scheduleBannerDismissed: 'justice-schedule-banner-dismissed',
  }),
});

/** @deprecated Use APP_CONFIG.scheduleUrl */
export const GROUP_SCHEDULE_URL = APP_CONFIG.scheduleUrl;

export const APP_NAME = 'JusticeApp';
export const PHONE_TEL = '+35796816413';
export const PHONE_DISPLAY = '+357 96 816413';
export const EMAIL = 'hello@example.com';

/** @deprecated Use APP_CONFIG.storageKeys.locale */
export const LANG_STORAGE_KEY = APP_CONFIG.storageKeys.locale;
/** @deprecated Use APP_CONFIG.storageKeys.localeLegacy */
export const LANG_LEGACY_KEYS = [...APP_CONFIG.storageKeys.localeLegacy];
/** @deprecated Use APP_CONFIG.defaultLocale */
export const DEFAULT_LANG = APP_CONFIG.defaultLocale;
/** @deprecated Use APP_CONFIG.supportedLocales */
export const SUPPORTED_LANGS = APP_CONFIG.supportedLocales;

export const VIEWPORT_DESKTOP_MIN_PX = 900;

export const ICON_192 = 'assets/images/icon-192.png';
export const ICON_512 = 'assets/images/icon-512.png';
export const APPLE_TOUCH_ICON = 'assets/images/apple-touch-icon.png';

export const INSTAGRAM_ARTIST = 'https://www.instagram.com/__lady.justice_/';
export const INSTAGRAM_STUDIO = 'https://www.instagram.com/justicefitnessanddance/';
export const STUDIO_ADDRESS = 'Ilia Venezi 5, 1076 Nicosia, Cyprus';
export const STUDIO_MAPS_QUERY = 'Ilia+Venezi+5%2C+Nicosia+1076%2C+Cyprus';

/** Google Maps (external app / tab) */
export const STUDIO_GOOGLE_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${STUDIO_MAPS_QUERY}`;

/** WhatsApp deep link — digits only */
export function studioWhatsAppUrl() {
  const digits = PHONE_TEL.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : '#';
}
