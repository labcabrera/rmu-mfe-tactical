import { useEffect, useRef } from 'react';

/** Where a key belongs to what the user is doing, not to a combat shortcut. */
const TYPING_OR_MODAL =
  'input, textarea, select, [contenteditable="true"], [role="dialog"], [role="menu"], [role="listbox"], [role="presentation"]';

/** Focused controls that use Enter and the arrows themselves (click, tab or option navigation). */
const KEYBOARD_CONTROLS =
  'button, a[href], [role="button"], [role="tab"], [role="radio"], [role="option"], [role="slider"], [role="switch"]';
const CONTROL_KEYS = ['Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

/**
 * Calls `handler` when one of `keys` (`KeyboardEvent.key` values) is pressed on the combat screen. Ignored while
 * typing, inside dialogs and menus, with Ctrl, Cmd or Alt, and for Enter and the arrows on a focused control, so it
 * never takes a key the user meant elsewhere.
 * The handler returns false when it did not use the key (the browser keeps its default, e.g. scrolling).
 */
export const useShortcut = (keys: string[], handler: (event: KeyboardEvent) => boolean | void, enabled = true) => {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  const keyList = keys.join('|');

  useEffect(() => {
    if (!enabled) return;
    const accepted = keyList.split('|');
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || !accepted.includes(event.key)) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest?.(TYPING_OR_MODAL)) return;
      if (CONTROL_KEYS.includes(event.key) && target?.closest?.(KEYBOARD_CONTROLS)) return;
      if (handlerRef.current(event) !== false) event.preventDefault();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [keyList, enabled]);
};
