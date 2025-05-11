"use client";
import React, { useEffect, useRef } from "react";

export default function BackgroundEffect() {
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let destroyed = false;

    function createParticle() {
      if (!particlesRef.current || destroyed) return;
      const particle = document.createElement("div");
      particle.className = "particle";
      // Random size between 2-6px
      const size = Math.random() * 4 + 2;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      // Random starting position
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      // Random animation duration between 10-20s
      particle.style.animationDuration = `${Math.random() * 10 + 10}s`;
      particlesRef.current.appendChild(particle);
      // Remove particle after animation
      particle.addEventListener("animationend", () => {
        particle.remove();
      });
    }
    // Create initial particles
    for (let i = 0; i < 50; i++) {
      createParticle();
    }
    // Continue creating particles
    interval = setInterval(createParticle, 300);
    return () => {
      destroyed = true;
      clearInterval(interval);
      if (particlesRef.current) {
        particlesRef.current.innerHTML = "";
      }
    };
  }, []);

  return (
    <div
      ref={particlesRef}
      className="particles"
      aria-hidden="true"
      style={{ position: "fixed", top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, pointerEvents: 'none' }}
    />
  );
}
