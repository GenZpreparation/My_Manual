"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

// PWA ka client-side hissa: service worker register karta hai aur "Install app"
// prompt dikhata hai.
//
// Do alag browser families hain, aur dono ka flow alag hai:
//  * Chrome / Edge / Android -- `beforeinstallprompt` event aata hai. Use rok
//    kar rakh te hain, aur jab user button dabaye tab dikhate hain. Isse
//    humara custom button kaam karta hai.
//  * iOS Safari -- koi event nahi aata (Apple API deta hi nahi). Wahan user ko
//    manually "Share -> Add to Home Screen" batana padta hai, isliye text
//    instructions dikhate hain.
//
// Standalone me app already khula hai to kuch nahi dikhate.

const DISMISS_KEY = "interview-manual-install-dismissed";

const isStandalone = () =>
  typeof window !== "undefined" &&
  (window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true);

const isIOS = () =>
  typeof navigator !== "undefined" &&
  /iPad|iPhone|iPod/.test(navigator.userAgent) &&
  !window.MSStream;

export default function PwaInstall() {
  const [deferred, setDeferred] = useState(null);
  const [dismissed, setDismissed] = useState(true); // default hidden -> no flash for desktop
  const [installed, setInstalled] = useState(false);
  const [iosHints, setIosHints] = useState(false);

  // ---- Service worker registration ----
  useEffect(() => {
    // Dev me register nahi karte: HMR ke beech me purana HTML serve hone se
    // debugging aasan ho jaata hai. Production (Vercel) me hi chahiye.
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* SW fail ho to site normal hi chalta hai -- kuch nahi toota */
      });
    };

    // Page load ke baad register karo taaki pehla render fast rahe
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });

    return () => window.removeEventListener("load", register);
  }, []);

  // ---- Install prompt capture ----
  useEffect(() => {
    setInstalled(isStandalone());
    try {
      if (window.localStorage.getItem(DISMISS_KEY) === "1") setDismissed(true);
      else setDismissed(false);
    } catch {
      setDismissed(false);
    }

    const onPrompt = (e) => {
      // Browser ka default mini-infobar nahi chahiye, humara button better hai
      e.preventDefault();
      setDeferred(e);
      setDismissed(false);
    };
    const onInstalled = () => {
   setInstalled(true);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
    window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // ---- Footer ke "Install app" link se aaya request ----
  // Bar dismiss hone ke baad bhi user wapas install kar paaye, isliye ye
  // event bar ko dobara dikhata hai (ya modal seedha khol deta hai).
  useEffect(() => {
    const onRequest = () => {
      setDismissed(false);
      if (isIOS() && !deferred) setIosHints(true);
    };
    window.addEventListener("pwa:install-request", onRequest);
    return () => window.removeEventListener("pwa:install-request", onRequest);
  }, [deferred]);

  const dismiss = useCallback(() => {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferred) {
   // iOS par koi programmatic prompt nahi hota -- instructions dikhao
      setIosHints(true);
      return;
    }
    deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setDeferred(null);
    dismiss();
  }, [deferred, dismiss]);

  // Already installed, ya user ne dismiss kar diya, ya desktop par
  // install prompt aaya hi nahi -> kuch mat dikhao
  if (installed || dismissed) return null;

  const showIos = !deferred && isIOS();

  return (
    <>
      <div className="pwa-bar" role="region" aria-label="Install this app">
        <div className="pwa-bar-inner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="pwa-bar-icon" src="/icons/icon-192.png" alt="" width="44" height="44" />
      <div className="pwa-bar-text">
        <strong>Install this app</strong>
            <span>
    {showIos
    ? "Add to your home screen and open it like a real app."
       : "Add to your home screen — faster, and works offline."}
      </span>
    </div>
  <div className="pwa-bar-actions">
     <button type="button" className="pwa-bar-btn" onClick={promptInstall}>
    {showIos ? "How to install" : "Install"}
            </button>
     <button type="button" className="pwa-bar-close" onClick={dismiss} aria-label="Dismiss install prompt">
   ×
    </button>
          </div>
        </div>
      </div>

   {iosHints && (
      <div className="pwa-modal-backdrop" onClick={() => setIosHints(false)} role="presentation">
        <div
     className="pwa-modal"
     role="dialog"
          aria-modal="true"
   aria-label="How to install on iPhone"
   onClick={(e) => e.stopPropagation()}
        >
          <h3>Add to Home Screen</h3>
          <ol className="pwa-steps">
    <li>
          <span className="pwa-step-n">1</span>
          <span>
        Safari me <strong>Share</strong> button dabaye (niche wala box with arrow).
   </span>
            </li>
        <li>
      <span className="pwa-step-n">2</span>
        <span>
            List me <strong>Add to Home Screen</strong> chune.
    </span>
      </li>
     <li>
    <span className="pwa-step-n">3</span>
    <span>
   Top-right me <strong>Add</strong> dabaye. Ab app home screen par icon
      ban jayega.
            </span>
          </li>
    </ol>
     <p className="pwa-note">
            Note: iOS me ye sirf <strong>Safari</strong> me kaam karta hai. Chrome
            ya Firefox me nahi.
          </p>
    <button type="button" className="pwa-modal-btn" onClick={() => setIosHints(false)}>
       Got it
     </button>
        </div>
      </div>
    )}
    </>
  );
}
