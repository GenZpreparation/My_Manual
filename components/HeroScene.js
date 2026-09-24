"use client";

import { useEffect, useRef } from "react";

// Hero ka 3D scene. Three.js (components/heroSceneImpl.js) sirf tab download hota hai jab
// browser idle ho -- initial load, hydration aur LCP ko block nahi karta.
// Skip: reduced-motion, data-saver, ya low-memory (<=2GB) devices.
export default function HeroScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (navigator.connection?.saveData || (navigator.deviceMemory && navigator.deviceMemory <= 2)) return;

    let disposed = false;
    let stop = () => {};
    const boot = async () => {
      const { startScene } = await import("@/components/heroSceneImpl");
      if (!disposed) stop = startScene(mount);
    };
    const idleId = window.requestIdleCallback
      ? window.requestIdleCallback(boot, { timeout: 2000 })
      : setTimeout(boot, 400);

    return () => {
      disposed = true;
      if (window.cancelIdleCallback && window.requestIdleCallback) window.cancelIdleCallback(idleId);
      else clearTimeout(idleId);
      stop();
    };
  }, []);

  return <div className="hero-scene" ref={mountRef} aria-hidden="true" />;
}
