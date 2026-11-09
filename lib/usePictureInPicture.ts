"use client";

import { useCallback, useEffect, useState } from "react";

interface DocumentPictureInPictureAPI {
  requestWindow(options?: { width?: number; height?: number }): Promise<Window>;
}

declare global {
  interface Window {
    documentPictureInPicture?: DocumentPictureInPictureAPI;
  }
}

/**
 * Opens a real always-on-top window (Chrome/Edge 116+) that stays above every
 * app, including your meeting. Must be called from a click.
 */
export function usePictureInPicture() {
  const [supported, setSupported] = useState(false);
  const [pipWindow, setPipWindow] = useState<Window | null>(null);

  useEffect(() => {
    setSupported("documentPictureInPicture" in window);
  }, []);

  const open = useCallback(async () => {
    const api = window.documentPictureInPicture;
    if (!api) return;

    const win = await api.requestWindow({ width: 480, height: 260 });

    // The new window starts empty, so copy this page's styles into it.
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        const css = Array.from(sheet.cssRules)
          .map((rule) => rule.cssText)
          .join("");
        const style = document.createElement("style");
        style.textContent = css;
        win.document.head.appendChild(style);
      } catch {
        if (sheet.href) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = sheet.href;
          win.document.head.appendChild(link);
        }
      }
    }
    // Carries the font variables set by next/font
    win.document.documentElement.className = document.documentElement.className;
    win.document.body.className = document.body.className;
    win.document.body.style.margin = "0";

    win.addEventListener("pagehide", () => setPipWindow(null));
    setPipWindow(win);
  }, []);

  const close = useCallback(() => {
    setPipWindow((current) => {
      current?.close();
      return null;
    });
  }, []);

  return { supported, pipWindow, open, close };
}