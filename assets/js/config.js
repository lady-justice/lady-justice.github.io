/**
 * App-wide constants. Single source of truth.
 * Keep VIEWPORT_DESKTOP_MIN_PX in sync with --bp-desktop-min in tokens.css.
 */
export const APP_NAME = 'JusticeApp';
export const PHONE_TEL = '+10000000000';
export const PHONE_DISPLAY = '+1 (000) 000-0000';
export const EMAIL = 'hello@example.com';

export const LANG_STORAGE_KEY = 'justice-lang';
export const LANG_LEGACY_KEYS = ['lj-lang'];
export const DEFAULT_LANG = 'en';
export const SUPPORTED_LANGS = /** @type {const} */ (['en', 'el', 'ru']);

export const VIEWPORT_DESKTOP_MIN_PX = 900;

export const GROUP_SCHEDULE_URL = 'docs/group-schedule.json';

/** PWA / favicon / header — generated from `assets/images/image Background Removed.png` */
export const ICON_192 = 'assets/images/icon-192.png';
export const ICON_512 = 'assets/images/icon-512.png';
export const APPLE_TOUCH_ICON = 'assets/images/apple-touch-icon.png';

export const INSTAGRAM_ARTIST = 'https://www.instagram.com/__lady.justice_/';
export const INSTAGRAM_STUDIO = 'https://www.instagram.com/justicefitnessanddance/';
export const STUDIO_ADDRESS = 'Ilia Venezi 5, 1076 Nicosia, Cyprus';
export const STUDIO_MAPS_QUERY = 'Ilia+Venezi+5%2C+Nicosia+1076%2C+Cyprus';
