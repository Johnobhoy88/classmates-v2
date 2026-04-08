/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 *
 * REACTIVE OCEAN — Canvas 2D underwater scene for phonics
 * Light rays, bubbles, seaweed, coral, fish, sandy floor
 * Reacts to gameplay: correct=bubbles burst, wrong=water darkens
 */

import { useEffect, useRef } from 'react';
import type { ThemeState } from '../premium/themes';

function rand(a: number, b: number) { return a + Math.random() * (b - a); }

interface Bubble { x: number; y: number; r: number; speed: number; wobble: number; phase: number; }
interface Seaweed { x: number; baseY: number; h: number; segments: number; hue: number; }
interface Fish { x: number; y: number; size: number; speed: number; color: string; dir: 1 | -1; wobblePhase: number; }
interface Coral { x: number; y: number; w: number; h: number; hue: number; branches: number; }
interface LightRay { x: number; w: number; opacity: number; speed: number; }

export function PhonicsOceanBg({ state }: { state: ThemeState }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const running = useRef(false);
  const animId = useRef(0);
  const stateRef = useRef(state);
  stateRef.current = state;
  const lastEvent = useRef('none');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0, H = 0;
    let bubbles: Bubble[] = [];
    let seaweeds: Seaweed[] = [];
    let fishes: Fish[] = [];
    let corals: Coral[] = [];
    let lightRays: LightRay[] = [];
    let brightnessFlash = 0;
    let bubbleBurst = 0; // extra bubbles on correct

    function generate() {
      if (!W || !H) return;

      bubbles = [];
      for (let i = 0; i < 20; i++) {
        bubbles.push({ x: rand(0, W), y: rand(0, H), r: rand(2, 8), speed: rand(0.3, 1.2), wobble: rand(10, 30), phase: rand(0, Math.PI * 2) });
      }

      seaweeds = [];
      for (let i = 0; i < 10; i++) {
        seaweeds.push({ x: rand(10, W - 10), baseY: H, h: rand(60, 140), segments: Math.floor(rand(5, 9)), hue: rand(100, 160) });
      }

      fishes = [];
      const fishColors = ['#ff6b6b', '#ffd93d', '#74b9ff', '#a29bfe', '#fd79a8', '#55efc4', '#fab1a0'];
      for (let i = 0; i < 8; i++) {
        const dir = Math.random() > 0.5 ? 1 : -1 as 1 | -1;
        fishes.push({ x: rand(0, W), y: rand(H * 0.15, H * 0.7), size: rand(8, 18), speed: rand(0.3, 1), color: fishColors[i % fishColors.length], dir, wobblePhase: rand(0, Math.PI * 2) });
      }

      corals = [];
      for (let i = 0; i < 8; i++) {
        corals.push({ x: rand(10, W - 10), y: H - rand(5, 20), w: rand(15, 35), h: rand(20, 50), hue: rand(0, 60), branches: Math.floor(rand(3, 6)) });
      }

      lightRays = [];
      for (let i = 0; i < 5; i++) {
        lightRays.push({ x: rand(0, W), w: rand(30, 80), opacity: rand(0.02, 0.06), speed: rand(0.05, 0.15) });
      }
    }

    function processEvents() {
      const ev = stateRef.current.event;
      if (ev === lastEvent.current || ev === 'none') return;
      lastEvent.current = ev;
      if (ev === 'correct') {
        bubbleBurst = 15;
        brightnessFlash = 0.08;
      } else if (ev === 'wrong') {
        brightnessFlash = -0.06;
        for (const sw of seaweeds) sw.h += 5; // shake effect via height pulse
      } else if (ev === 'wordComplete') {
        bubbleBurst = 30;
        brightnessFlash = 0.15;
      } else if (ev === 'wordFailed') {
        brightnessFlash = -0.1;
      } else if (ev === 'gameComplete') {
        bubbleBurst = 50;
        brightnessFlash = 0.25;
      }
    }

    function drawOcean(t: number) {
      const s = stateRef.current;
      const p = s.progress;
      // Water gets lighter as you progress (deeper blue → brighter teal)
      const r1 = Math.round(0x05 + p * 0x10);
      const g1 = Math.round(0x15 + p * 0x20);
      const b1 = Math.round(0x40 + p * 0x20);
      const r2 = Math.round(0x08 + p * 0x15);
      const g2 = Math.round(0x2a + p * 0x1a);
      const b2 = Math.round(0x3a + p * 0x10);
      const grad = ctx!.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, `rgb(${r1},${g1},${b1})`);
      grad.addColorStop(0.5, `rgb(${Math.round(r1 * 0.8)},${Math.round(g1 * 0.9)},${Math.round(b1 * 0.95)})`);
      grad.addColorStop(0.85, `rgb(${r2},${g2},${b2})`);
      grad.addColorStop(1, `rgb(${Math.round(r2 * 0.6)},${Math.round(g2 * 0.7)},${Math.round(b2 * 0.6)})`);
      ctx!.fillStyle = grad;
      ctx!.fillRect(0, 0, W, H);

      // Sandy floor
      const sandGrad = ctx!.createLinearGradient(0, H - 40, 0, H);
      sandGrad.addColorStop(0, 'rgba(194,178,128,0.15)');
      sandGrad.addColorStop(1, 'rgba(194,178,128,0.25)');
      ctx!.fillStyle = sandGrad;
      ctx!.fillRect(0, H - 40, W, 40);

      // Sand ripples
      ctx!.strokeStyle = 'rgba(194,178,128,0.1)';
      ctx!.lineWidth = 1;
      for (let i = 0; i < 8; i++) {
        const sx = (i * W / 6 + t * 0.01) % (W + 100) - 50;
        ctx!.beginPath();
        ctx!.moveTo(sx, H - 10);
        ctx!.quadraticCurveTo(sx + 30, H - 15, sx + 60, H - 10);
        ctx!.stroke();
      }

      // Brightness flash
      if (brightnessFlash > 0.01) {
        ctx!.fillStyle = `rgba(100,200,255,${brightnessFlash})`;
        ctx!.fillRect(0, 0, W, H);
        brightnessFlash *= 0.93;
      } else if (brightnessFlash < -0.01) {
        ctx!.fillStyle = `rgba(0,0,30,${-brightnessFlash})`;
        ctx!.fillRect(0, 0, W, H);
        brightnessFlash *= 0.93;
      } else {
        brightnessFlash = 0;
      }
    }

    function drawLightRays(t: number) {
      for (const ray of lightRays) {
        const x = (ray.x + t * ray.speed) % (W + ray.w * 2) - ray.w;
        const grad = ctx!.createLinearGradient(x, 0, x + ray.w, H * 0.7);
        grad.addColorStop(0, `rgba(150,220,255,${ray.opacity})`);
        grad.addColorStop(1, 'rgba(150,220,255,0)');
        ctx!.fillStyle = grad;
        ctx!.beginPath();
        ctx!.moveTo(x, 0);
        ctx!.lineTo(x + ray.w * 0.3, 0);
        ctx!.lineTo(x + ray.w * 1.5, H * 0.7);
        ctx!.lineTo(x + ray.w, H * 0.7);
        ctx!.closePath();
        ctx!.fill();
      }
    }

    function drawCorals(t: number) {
      for (const c of corals) {
        for (let b = 0; b < c.branches; b++) {
          const angle = -Math.PI / 2 + (b - c.branches / 2) * 0.3;
          const sway = Math.sin(t * 0.001 + c.x + b) * 3;
          const bh = c.h * (0.6 + (b % 2) * 0.4);
          const tx = c.x + Math.cos(angle) * bh + sway;
          const ty = c.y + Math.sin(angle) * bh;
          ctx!.strokeStyle = `hsla(${c.hue},70%,55%,0.7)`;
          ctx!.lineWidth = 4 + (c.branches - b);
          ctx!.lineCap = 'round';
          ctx!.beginPath();
          ctx!.moveTo(c.x, c.y);
          ctx!.quadraticCurveTo(c.x + sway * 0.5, c.y - bh * 0.5, tx, ty);
          ctx!.stroke();
          // Polyp tip
          ctx!.fillStyle = `hsla(${c.hue + 20},80%,65%,0.6)`;
          ctx!.beginPath();
          ctx!.arc(tx, ty, 3, 0, Math.PI * 2);
          ctx!.fill();
        }
      }
    }

    function drawSeaweed(t: number) {
      for (const sw of seaweeds) {
        const sway = Math.sin(t * 0.0008 + sw.x * 0.01);
        ctx!.strokeStyle = `hsla(${sw.hue},60%,35%,0.7)`;
        ctx!.lineWidth = 3;
        ctx!.lineCap = 'round';
        ctx!.beginPath();
        let px = sw.x, py = sw.baseY;
        ctx!.moveTo(px, py);
        const segH = sw.h / sw.segments;
        for (let s = 0; s < sw.segments; s++) {
          const swayAmt = sway * (s + 1) * 4;
          px = sw.x + swayAmt;
          py -= segH;
          ctx!.lineTo(px, py);
        }
        ctx!.stroke();
        // Leaves
        for (let s = 1; s < sw.segments; s += 2) {
          const lx = sw.x + sway * (s + 1) * 4;
          const ly = sw.baseY - s * segH;
          ctx!.fillStyle = `hsla(${sw.hue},50%,40%,0.5)`;
          ctx!.beginPath();
          ctx!.ellipse(lx + 6, ly, 8, 3, sway * 0.3, 0, Math.PI * 2);
          ctx!.fill();
        }
      }
    }

    function drawFish(t: number) {
      for (const f of fishes) {
        f.x += f.speed * f.dir;
        f.y += Math.sin(t * 0.001 + f.wobblePhase) * 0.3;
        // Wrap
        if (f.dir > 0 && f.x > W + 30) f.x = -30;
        if (f.dir < 0 && f.x < -30) f.x = W + 30;

        ctx!.save();
        ctx!.translate(f.x, f.y);
        if (f.dir < 0) ctx!.scale(-1, 1);
        // Body
        ctx!.fillStyle = f.color;
        ctx!.beginPath();
        ctx!.ellipse(0, 0, f.size, f.size * 0.5, 0, 0, Math.PI * 2);
        ctx!.fill();
        // Tail
        ctx!.beginPath();
        ctx!.moveTo(-f.size * 0.7, 0);
        const tailWag = Math.sin(t * 0.005 + f.wobblePhase) * f.size * 0.3;
        ctx!.lineTo(-f.size * 1.3, -f.size * 0.4 + tailWag);
        ctx!.lineTo(-f.size * 1.3, f.size * 0.4 + tailWag);
        ctx!.closePath();
        ctx!.fill();
        // Eye
        ctx!.fillStyle = '#fff';
        ctx!.beginPath();
        ctx!.arc(f.size * 0.4, -f.size * 0.1, f.size * 0.15, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.fillStyle = '#111';
        ctx!.beginPath();
        ctx!.arc(f.size * 0.45, -f.size * 0.1, f.size * 0.07, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.restore();
      }
    }

    function drawBubbles(t: number) {
      // Spawn burst bubbles
      while (bubbleBurst > 0) {
        bubbles.push({ x: rand(W * 0.2, W * 0.8), y: rand(H * 0.3, H * 0.6), r: rand(3, 10), speed: rand(0.8, 2), wobble: rand(15, 35), phase: rand(0, Math.PI * 2) });
        bubbleBurst--;
      }

      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        b.y -= b.speed;
        b.x += Math.sin(t * 0.002 + b.phase) * b.wobble * 0.01;
        if (b.y < -b.r * 2) {
          // Reset to bottom
          b.y = H + b.r;
          b.x = rand(0, W);
        }
        // Draw
        ctx!.strokeStyle = `rgba(180,220,255,${0.3 + b.r * 0.03})`;
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        ctx!.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx!.stroke();
        // Highlight
        ctx!.fillStyle = `rgba(220,240,255,${0.15 + b.r * 0.02})`;
        ctx!.beginPath();
        ctx!.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.3, 0, Math.PI * 2);
        ctx!.fill();
      }
      // Cap bubble count
      if (bubbles.length > 60) bubbles.splice(0, bubbles.length - 40);
    }

    function loop(t: number) {
      if (!running.current) return;
      if (canvas!.width !== canvas!.clientWidth || canvas!.height !== canvas!.clientHeight) {
        W = canvas!.width = canvas!.clientWidth;
        H = canvas!.height = canvas!.clientHeight;
        generate();
      }
      processEvents();
      drawOcean(t);
      drawLightRays(t);
      drawCorals(t);
      drawSeaweed(t);
      drawFish(t);
      drawBubbles(t);
      animId.current = requestAnimationFrame(loop);
    }

    W = canvas.width = canvas.clientWidth || 600;
    H = canvas.height = canvas.clientHeight || 800;
    generate();
    running.current = true;
    animId.current = requestAnimationFrame(loop);
    return () => { running.current = false; cancelAnimationFrame(animId.current); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full" style={{ zIndex: 0 }} />;
}
