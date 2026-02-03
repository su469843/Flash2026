
import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { FireworkType, Particle } from './types';

interface FireworkEngineProps {
  colors?: string[];
}

export interface FireworkEngineHandle {
  launch: (x?: number, y?: number, colorSet?: string[], type?: FireworkType) => void;
}

const FireworkEngine = forwardRef<FireworkEngineHandle, FireworkEngineProps>(({ colors = ['#ff0000', '#ffd700', '#ffffff'] }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const rockets = useRef<any[]>([]);

  useImperativeHandle(ref, () => ({
    launch: (x, y, colorSet, type = 'random') => {
      const startX = x !== undefined ? x : Math.random() * window.innerWidth;
      const startY = window.innerHeight;
      const targetY = y !== undefined ? y : Math.random() * (window.innerHeight * 0.4) + 50;
      const color = (colorSet || colors)[Math.floor(Math.random() * (colorSet || colors).length)];
      
      const fireworkType = type === 'random' ? (['peony', 'cross', 'meteor'][Math.floor(Math.random() * 3)] as FireworkType) : type;

      rockets.current.push({
        x: startX,
        y: startY,
        targetY: targetY,
        color: color,
        speed: 5 + Math.random() * 4,
        type: fireworkType
      });
    }
  }));

  const createPeony = (x: number, y: number, color: string) => {
    const count = 100;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      particles.current.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color,
        size: Math.random() * 2 + 1,
        decay: Math.random() * 0.015 + 0.01,
        gravity: 0.06,
        friction: 0.96
      });
    }
  };

  const createCross = (x: number, y: number, color: string) => {
    const count = 80;
    for (let i = 0; i < count; i++) {
      const isAxis = Math.random() > 0.6;
      const angle = isAxis ? (Math.floor(Math.random() * 4) * Math.PI / 2) : Math.random() * Math.PI * 2;
      const speed = isAxis ? Math.random() * 8 + 4 : Math.random() * 3 + 1;
      particles.current.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color: isAxis ? '#fff' : color,
        size: isAxis ? 2.5 : 1.5,
        decay: Math.random() * 0.02 + 0.01,
        gravity: 0.04,
        friction: 0.97,
        flicker: true
      });
    }
  };

  const createMeteor = (x: number, y: number, color: string) => {
    const count = 40;
    for (let i = 0; i < count; i++) {
      const angle = (Math.random() * Math.PI) + Math.PI; // Upwards spread
      const speed = Math.random() * 10 + 5;
      particles.current.push({
        x, y,
        vx: Math.cos(angle) * (Math.random() * 2),
        vy: -Math.random() * 4, // Initial kick up
        alpha: 1,
        color,
        size: Math.random() * 1.5 + 0.5,
        decay: Math.random() * 0.01 + 0.005,
        gravity: 0.15, // Heavy gravity for falling effect
        friction: 0.99
      });
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    let animationId: number;
    const render = () => {
      ctx.fillStyle = 'rgba(5, 5, 5, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Rockets
      for (let i = rockets.current.length - 1; i >= 0; i--) {
        const r = rockets.current[i];
        r.y -= r.speed;
        
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = r.color;
        ctx.fill();

        if (r.y <= r.targetY) {
          if (r.type === 'peony') createPeony(r.x, r.y, r.color);
          else if (r.type === 'cross') createCross(r.x, r.y, r.color);
          else createMeteor(r.x, r.y, r.color);
          rockets.current.splice(i, 1);
        }
      }

      // Particles
      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.vx *= p.friction;
        p.vy *= p.friction;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.current.splice(i, 1);
          continue;
        }

        const alphaValue = p.flicker ? (Math.random() > 0.5 ? p.alpha : p.alpha * 0.3) : p.alpha;
        ctx.globalAlpha = alphaValue;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" />;
});

export default FireworkEngine;
