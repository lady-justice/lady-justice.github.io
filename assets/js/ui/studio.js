/**
 * Studio page: map links from config, share / copy address, embed recenter.
 */
import {
  STUDIO_GOOGLE_MAPS_URL,
  STUDIO_ADDRESS,
  PHONE_TEL,
  INSTAGRAM_STUDIO,
  studioWhatsAppUrl,
} from '../core/config.js';
import { getStrings, normalizeLang } from '../i18n/apply.js';

function wireMapsLinks() {
  document.querySelectorAll('[data-studio-maps]').forEach((el) => {
    el.setAttribute('href', STUDIO_GOOGLE_MAPS_URL);
  });
}

function wireChips() {
  document.querySelectorAll('[data-studio-tel]').forEach((el) => {
    el.setAttribute('href', `tel:${PHONE_TEL}`);
  });
  document.querySelectorAll('[data-studio-wa]').forEach((el) => {
    el.setAttribute('href', studioWhatsAppUrl());
  });
  document.querySelectorAll('[data-studio-ig]').forEach((el) => {
    el.setAttribute('href', INSTAGRAM_STUDIO);
  });
}

async function copyAddressAndLink(s) {
  const blob = `${STUDIO_ADDRESS}\n${STUDIO_GOOGLE_MAPS_URL}`;
  try {
    await navigator.clipboard.writeText(blob);
    window.alert(s.studio_share_copied);
  } catch {
    window.prompt(s.studio_share_copy_hint, blob);
  }
}

function wireShare() {
  const btn = document.getElementById('j-studio-share');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    const lang = document.documentElement.getAttribute('data-lang') || 'en';
    const s = getStrings(normalizeLang(lang));
    const sharePayload = {
      title: s.studio_share_title,
      text: `${s.studio_share_lead}\n${STUDIO_ADDRESS}`,
      url: STUDIO_GOOGLE_MAPS_URL,
    };
    if (navigator.share) {
      try {
        await navigator.share(sharePayload);
      } catch (err) {
        if (err && err.name === 'AbortError') return;
        await copyAddressAndLink(s);
      }
    } else {
      await copyAddressAndLink(s);
    }
  });
}

function wireRecenter() {
  const btn = document.getElementById('j-studio-recenter');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const iframe = document.querySelector('.studio-map iframe');
    if (iframe) iframe.src = iframe.src;
  });
}

export function initStudioPage({ signal } = {}) {
  wireMapsLinks();
  wireChips();
  wireShare();
  wireRecenter();
  document.addEventListener(
    'justice:lang',
    () => {
      wireMapsLinks();
      wireChips();
    },
    { signal },
  );
}
