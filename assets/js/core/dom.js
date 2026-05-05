/**
 * Small DOM helpers — no schedule/i18n knowledge.
 */

export function qs(selector, root = document) {
  return root.querySelector(selector);
}

export function qsa(selector, root = document) {
  return [...root.querySelectorAll(selector)];
}

export function requiredElement(selector, root = document) {
  const el = qs(selector, root);
  if (!el) throw new Error(`Missing element: ${selector}`);
  return el;
}

export function setText(element, text) {
  if (element) element.textContent = text;
}

export function setHTML(element, html) {
  if (element) element.innerHTML = html;
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * @param {string} tag
 * @param {{ className?: string, text?: string, attrs?: Record<string, string> }} [options]
 */
export function createElement(tag, options = {}) {
  const el = document.createElement(tag);
  if (options.className) el.className = options.className;
  if (options.text != null) el.textContent = options.text;
  if (options.attrs) {
    Object.entries(options.attrs).forEach(([k, v]) => el.setAttribute(k, v));
  }
  return el;
}

/** Replace a mount node whose id is `id` (no #) with parsed HTML. */
export function replaceMount(id, html) {
  const node = document.getElementById(id);
  if (!node) return null;
  node.outerHTML = html;
  return true;
}
