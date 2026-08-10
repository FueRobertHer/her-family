/**
 * Focus management for dialogs.
 *
 * The lightboxes and admin modals carried role="dialog" and aria-modal but
 * nothing kept focus inside them: a keyboard user could tab straight out into
 * the page behind, and closing a dialog dropped focus back to <body>. This
 * module supplies the three behaviours a modal dialog owes its user:
 *
 *   1. focus moves into the dialog on open
 *   2. Tab and Shift+Tab cycle within it
 *   3. focus returns to the trigger on close
 *
 * Dialogs are plain elements rather than <dialog>, so `inert` is applied to
 * their siblings to hide background content from assistive technology.
 */

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

interface TrapState {
  dialog: HTMLElement;
  previouslyFocused: HTMLElement | null;
  inerted: HTMLElement[];
}

/** Innermost dialog last: nested dialogs unwind in order. */
const stack: TrapState[] = [];

function focusableWithin(dialog: HTMLElement): HTMLElement[] {
  return Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => {
    // offsetParent is null for display:none subtrees; fixed elements report
    // null too, so fall back to measuring the box.
    if (el.offsetParent !== null) return true;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 || rect.height > 0;
  });
}

function applyInertSiblings(dialog: HTMLElement): HTMLElement[] {
  const inerted: HTMLElement[] = [];

  let node: HTMLElement | null = dialog;
  while (node && node !== document.body) {
    const parent: HTMLElement | null = node.parentElement;
    if (!parent) break;

    Array.from(parent.children).forEach((sibling) => {
      if (sibling === node || !(sibling instanceof HTMLElement)) return;
      if (sibling.hasAttribute('inert')) return;
      sibling.setAttribute('inert', '');
      inerted.push(sibling);
    });

    node = parent;
  }

  return inerted;
}

export function activateFocusTrap(dialog: HTMLElement) {
  if (stack.some((entry) => entry.dialog === dialog)) return;

  const active = document.activeElement;
  const state: TrapState = {
    dialog,
    previouslyFocused: active instanceof HTMLElement ? active : null,
    inerted: applyInertSiblings(dialog),
  };
  stack.push(state);

  // Prefer the first control; fall back to the dialog itself so focus is never
  // left behind in the inert background.
  const [first] = focusableWithin(dialog);
  if (first) {
    first.focus();
  } else {
    if (!dialog.hasAttribute('tabindex')) dialog.setAttribute('tabindex', '-1');
    dialog.focus();
  }
}

export function releaseFocusTrap(dialog: HTMLElement) {
  const index = stack.findIndex((entry) => entry.dialog === dialog);
  if (index === -1) return;

  const [state] = stack.splice(index, 1);
  state.inerted.forEach((el) => el.removeAttribute('inert'));

  // Only restore focus if it is still inside the dialog we are closing;
  // otherwise the user has already moved on and we should not yank them back.
  if (state.previouslyFocused?.isConnected && dialog.contains(document.activeElement)) {
    state.previouslyFocused.focus();
  }
}

document.addEventListener(
  'keydown',
  (event) => {
    if (event.key !== 'Tab' || stack.length === 0) return;

    const { dialog } = stack[stack.length - 1];
    const focusable = focusableWithin(dialog);
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const current = document.activeElement;

    if (event.shiftKey && (current === first || !dialog.contains(current))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (current === last || !dialog.contains(current))) {
      event.preventDefault();
      first.focus();
    }
  },
  true
);
