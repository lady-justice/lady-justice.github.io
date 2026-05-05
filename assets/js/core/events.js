import { qs } from './dom.js';

export function onClick(selector, handler, root = document) {
  const el = qs(selector, root);
  el?.addEventListener('click', handler);
}

export function onChange(selector, handler, root = document) {
  const el = qs(selector, root);
  el?.addEventListener('change', handler);
}

export function delegateEvent(eventName, selector, handler, root = document) {
  root.addEventListener(eventName, (e) => {
    const t = e.target && /** @type {Element} */ (e.target).closest(selector);
    if (t && root.contains(t)) handler(e, t);
  });
}
