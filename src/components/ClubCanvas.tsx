import React, { useEffect, useRef } from 'react';

interface ClubCanvasProps {
  mode: 'beats' | 'bites';
}

export default function ClubCanvas({ mode }: ClubCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle class for both modes
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      life: number;
      maxLife: number;

      constructor() {
        this.x = Math.random() * width;
        // Bites mode embers start from bottom, beats mode float anywhere
        this.y = mode === 'bites' ? height + Math.random() * 100 : Math.random() * height;
        this.size = Math.random() * (mode === 'beats' ? 3 : 2.5) + 0.5;
        this.speedX = (Math.random() - 0.5) * (mode === 'beats' ? 1.5 : 0.6);
        this.speedY = mode === 'bites' ? -Math.random() * 1.2 - 0.3 : (Math.random() - 0.5) * 1.0;
        this.maxLife = Math.random() * 200 + 100;
        this.life = this.maxLife;
        this.color = this.getRandomColor();
      }

      getRandomColor() {
        if (mode === 'beats') {
          // Neon colors (magenta, purple, cyan)
          const colors = [
            'rgba(255, 0, 127, ',
            'rgba(0, 229, 255, ',
            'rgba(147, 51, 234, ',
            'rgba(255, 0, 255, '
          ];
          return colors[Math.floor(Math.random() * colors.length)];
        } else {
          // Golden/Amber warm colors
          const colors = [
            'rgba(212, 175, 55, ', // Gold
            'rgba(230, 126, 34, ', // Amber
            'rgba(243, 156, 18, ', // Orange-gold
            'rgba(241, 196, 15, '  // Yellow-gold
          ];
          return colors[Math.floor(Math.random() * colors.length)];
        }
      }

      update(mouseX: number, mouseY: number) {
        this.x += this.speedX;
        this.y += this.speedY;

        // Interactive mouse push
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const force = (120 - dist) / 120;
          this.x -= (dx / dist) * force * 2;
          this.y -= (dy / dist) * force * 2;
        }

        // Loop / Re-spawn boundaries
        if (mode === 'bites') {
          if (this.y < -10 || this.x < -10 || this.x > width + 10) {
            this.y = height + Math.random() * 50;
            this.x = Math.random() * width;
            this.speedY = -Math.random() * 1.2 - 0.3;
            this.life = this.maxLife;
          }
        } else {
          if (this.x < -10 || this.x > width + 10 || this.y < -10 || this.y > height + 10) {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.life = this.maxLife;
          }
        }

        this.life--;
      }

      draw(context: CanvasRenderingContext2D) {
        const opacity = (this.life / this.maxLife) * (mode === 'beats' ? 0.35 : 0.25);
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fillStyle = `${this.color}${opacity})`;
        
        // Add glow in beats mode
        if (mode === 'beats' && this.size > 2.5) {
          context.shadowBlur = 10;
          context.shadowColor = this.color.replace(', ', ')');
        } else {
          context.shadowBlur = 0;
        }

        context.fill();
      }
    }

    // Set up particles
    const particleCount = mode === 'beats' ? 80 : 50;
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Interactive mouse positioning
    let mouseX = -1000;
    let mouseY = -1000;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Sine-wave sound equalizers for Club Mode (Beats)
    let waveOffset = 0;
    const waveCount = 5;
    const waveAmplitudes = [30, 20, 45, 15, 25];
    const waveSpeeds = [0.02, 0.03, 0.015, 0.04, 0.025];
    const waveColors = [
      'rgba(255, 0, 127, 0.05)',
      'rgba(0, 229, 255, 0.04)',
      'rgba(147, 51, 234, 0.03)',
      'rgba(255, 0, 255, 0.02)',
      'rgba(0, 229, 255, 0.06)'
    ];

    // Rendering loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw mode-specific ambient backdrop glows
      if (mode === 'beats') {
        // Pulsing purple-pink neon vignette in club mode
        const pulse = 1 + Math.sin(Date.now() * 0.001) * 0.1;
        const grad = ctx.createRadialGradient(
          width / 2, height / 2, 10,
          width / 2, height / 2, Math.max(width, height) * 0.8
        );
        grad.addColorStop(0, 'rgba(11, 11, 15, 0.95)');
        grad.addColorStop(0.5, 'rgba(25, 10, 40, 0.95)');
        grad.addColorStop(1, 'rgba(8, 5, 15, 1)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Draw flowing neon wave bands (like sound waves) at the bottom
        ctx.shadowBlur = 0;
        waveOffset += 0.02;
        for (let i = 0; i < waveCount; i++) {
          ctx.beginPath();
          ctx.moveTo(0, height);
          for (let x = 0; x < width; x += 10) {
            const y = height - 100 - i * 20 + 
              Math.sin(x * 0.003 + waveOffset * waveSpeeds[i] * 100) * waveAmplitudes[i] * pulse;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(width, height);
          ctx.fillStyle = waveColors[i];
          ctx.fill();
        }
      } else {
        // Luxurious dark bronze radial vignette in restaurant mode
        const grad = ctx.createRadialGradient(
          width / 2, height * 0.3, 10,
          width / 2, height / 2, Math.max(width, height) * 0.7
        );
        grad.addColorStop(0, 'rgba(20, 15, 10, 0.95)');
        grad.addColorStop(0.5, 'rgba(12, 10, 8, 0.98)');
        grad.addColorStop(1, 'rgba(6, 5, 4, 1)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. Draw and update particles
      particles.forEach((p) => {
        p.update(mouseX, mouseY);
        p.draw(ctx);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Cleanups
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mode]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full block pointer-events-none z-0"
    />
  );
}
