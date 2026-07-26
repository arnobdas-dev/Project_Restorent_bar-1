import React, { useState, useEffect } from 'react';

interface CustomCursorProps {
  mode: 'beats' | 'bites';
}

export default function CustomCursor({ mode }: CustomCursorProps) {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [trail, setTrail] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible]);

  // Trail physics
  useEffect(() => {
    let trailAnimationFrame: number;
    
    const updateTrail = () => {
      setTrail((prev) => {
        const dx = position.x - prev.x;
        const dy = position.y - prev.y;
        const ease = 0.12; 
        return {
          x: prev.x + dx * ease,
          y: prev.y + dy * ease
        };
      });
      trailAnimationFrame = requestAnimationFrame(updateTrail);
    };

    updateTrail();

    return () => cancelAnimationFrame(trailAnimationFrame);
  }, [position]);

  // Hover detection
  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target && 
        (target.tagName === 'BUTTON' || 
         target.tagName === 'A' || 
         target.closest('button') || 
         target.closest('a') ||
         target.getAttribute('role') === 'button')
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener('mouseover', handleMouseOver);
    return () => window.removeEventListener('mouseover', handleMouseOver);
  }, []);

  if (!isVisible) return null;

  return (
    <>
      <div
        className={`fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 border ${
          isHovered 
            ? 'w-12 h-12 bg-white/5 border-white/20' 
            : mode === 'beats'
              ? 'border-pink-500/40 shadow-[0_0_15px_rgba(236,72,153,0.2)]'
              : 'border-amber-500/40 shadow-[0_0_15px_rgba(217,119,6,0.15)]'
        }`}
        style={{
          left: `${trail.x}px`,
          top: `${trail.y}px`,
        }}
      />
      
      <div
        className={`fixed top-0 left-0 w-1.5 h-1.5 rounded-full pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 transition-all duration-150 ${
          isHovered 
            ? 'scale-150 bg-white' 
            : mode === 'beats'
              ? 'bg-pink-500'
              : 'bg-amber-500'
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      />
    </>
  );
}
