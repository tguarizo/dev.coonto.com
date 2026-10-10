"use client";

import { useEffect, useRef } from "react";
import styles from "./site-opening.module.css";

const sessionKey = "coonto:opening-seen";
let seenInTab = false;

export function SiteOpening() {
  const dialog = useRef<HTMLDialogElement>(null);
  const shouldShow = useRef<boolean | null>(null);

  useEffect(() => {
    const opening = dialog.current;
    if (!opening) return;
    if (shouldShow.current === null) {
      shouldShow.current = !seenInTab;
      try {
        if (sessionStorage.getItem(sessionKey)) shouldShow.current = false;
        if (shouldShow.current) sessionStorage.setItem(sessionKey, "1");
      } catch {
        // Keep navigation uninterrupted even when browser storage is disabled.
      }
    }
    if (!shouldShow.current) return;
    seenInTab = true;
    opening.showModal();
    const timer = window.setTimeout(() => opening.close(), 2000);
    return () => {
      window.clearTimeout(timer);
      opening.close();
    };
  }, []);

  return <dialog ref={dialog} className={styles.opening} aria-label="Bem-vindo ao Coonto">
    <div className={styles.brand}>
      <img src="/images/coonto-logo.png" alt="Coonto" />
      <p>Plataforma de aprendizagem interativa</p>
    </div>
    <button type="button" className={styles.skip} onClick={() => dialog.current?.close()}>Pular abertura</button>
  </dialog>;
}
