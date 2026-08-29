"use client";

import { useEffect } from "react";

export function Reveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.15 }
    );
    const els = document.querySelectorAll(".rise");
    els.forEach((el, i) => {
      (el as HTMLElement).style.transitionDelay = (i % 4) * 70 + "ms";
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);
  return null;
}
