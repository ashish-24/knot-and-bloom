'use client';

import React, { useEffect } from 'react';

export default function AntiInspectProtection() {
  useEffect(() => {
    // 1. Disable Right-Click Context Menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // 2. Disable DevTools & View-Source Keyboard Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12 key
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

      if (ctrlOrCmd) {
        // Ctrl+Shift+I or Cmd+Option+I (Inspect)
        // Ctrl+Shift+J or Cmd+Option+J (Console)
        // Ctrl+Shift+C or Cmd+Option+C (Inspect Element)
        // Ctrl+U (View Source)
        // Ctrl+S (Save Page)
        const keyLower = e.key.toLowerCase();
        if (
          (e.shiftKey && (keyLower === 'i' || keyLower === 'j' || keyLower === 'c')) ||
          keyLower === 'u' ||
          keyLower === 's'
        ) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }
    };

    // 3. Disable Dragging Images & Media
    const handleDragStart = (e: DragEvent) => {
      if (e.target && (e.target as HTMLElement).tagName === 'IMG') {
        e.preventDefault();
        return false;
      }
    };

    // 4. Periodically clear console to protect against script injection
    const consoleInterval = setInterval(() => {
      if (process.env.NODE_ENV === 'production') {
        console.clear();
      }
    }, 2000);

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('dragstart', handleDragStart);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('dragstart', handleDragStart);
      clearInterval(consoleInterval);
    };
  }, []);

  return null;
}
