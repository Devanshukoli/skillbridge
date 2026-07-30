import { useEffect } from 'react';

/**
 * Closes a modal/popup when the user presses Escape.
 *
 * @param active   Whether the modal is currently open. The listener is only
 *                 attached while this is true, so closed modals don't leave
 *                 stray document-level listeners around.
 * @param onEscape Called when Escape is pressed while `active` is true.
 */
export function useEscapeKey(active: boolean, onEscape: () => void) {
  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onEscape();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}