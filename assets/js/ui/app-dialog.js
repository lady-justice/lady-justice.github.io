/**
 * Small centered modal (message + confirm) — mounts into #j-app-dialog-root.
 */

let teardown = null;

/**
 * @param {string} message
 * @param {object} [opts]
 * @param {string} [opts.confirmLabel]
 * @param {string} [opts.backdropLabel]
 * @param {() => void} [opts.onClose]
 */
export function showAppDialog(message, opts = {}) {
  const root = document.getElementById('j-app-dialog-root');
  if (!root || !message) return;

  teardown?.();

  const backdrop = document.createElement('button');
  backdrop.type = 'button';
  backdrop.className = 'app-dialog-backdrop';
  backdrop.setAttribute('aria-label', opts.backdropLabel ?? 'Close');

  const panel = document.createElement('div');
  panel.className = 'app-dialog-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');

  const msgEl = document.createElement('p');
  msgEl.className = 'app-dialog-message';
  msgEl.id = 'j-app-dialog-desc';
  msgEl.textContent = message;
  panel.setAttribute('aria-labelledby', 'j-app-dialog-desc');

  const ok = document.createElement('button');
  ok.type = 'button';
  ok.className = 'app-dialog-ok';
  ok.textContent = opts.confirmLabel ?? 'OK';

  panel.append(msgEl, ok);
  root.replaceChildren(backdrop, panel);
  root.hidden = false;
  root.removeAttribute('aria-hidden');

  function close() {
    teardown?.();
    teardown = null;
    root.replaceChildren();
    root.hidden = true;
    root.setAttribute('aria-hidden', 'true');
    opts.onClose?.();
  }

  function onKey(ev) {
    if (ev.key === 'Escape') {
      ev.preventDefault();
      close();
    }
  }

  backdrop.addEventListener('click', close);
  ok.addEventListener('click', close);
  document.addEventListener('keydown', onKey);

  teardown = () => {
    document.removeEventListener('keydown', onKey);
    backdrop.removeEventListener('click', close);
    ok.removeEventListener('click', close);
  };

  requestAnimationFrame(() => ok.focus());
}
