/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 *
 * ENCHANTED FOREST — Premium Canvas 2D background for spelling game
 * Night sky, glowing moon, twinkling stars, silhouette trees,
 * floating fireflies with trails, glowing mushrooms, mist layers,
 * occasional shooting stars, gentle fog
 */

import { useEffect, useRef } from 'react';

function rand(a: number, b: number) { return a + Math.random() * (b - a); }

interface Firefly { x: number; y: number; baseX: number; baseY: number; size: number; phase: number; speed: number; brightness: number; trail: Array<{x: number; y: number; a: number}>; }
interface StarObj { x: number; y: number; size: number; twinkleSpeed: number; phase: number; }
interface Mushroom { x: number; y: number; size: number; hue: number; phase: number; }
interface MistLayer { y: number; speed: number; opacity: number; offset: number; }
interface TreeSil { x: number; h: number; w: number; }

export function SpellingForestBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const running = useRef(false);
  const animId = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0, H = 0;
    let fireflies: Firefly[] = [];
    let stars: StarObj[] = [];
    let mushrooms: Mushroom[] = [];
    let mists: MistLayer[] = [];
    let trees: TreeSil[] = [];
    let shootingStarTimer = rand(3000, 8000);
    let shootingStar: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number } | null = null;

    function generate() {
      if (!W || !H) return;

      stars = [];
      for (let i = 0; i < 80; i++) {
        stars.push({ x: rand(0, W), y: rand(0, H * 0.4), size: rand(0.5, 2), twinkleSpeed: rand(0.001, 0.004), phase: rand(0, Math.PI * 2) });
      }

      trees = [];
      const treeCount = Math.floor(W / 60) + 4;
      for (let i = 0; i < treeCount; i++) {
        trees.push({ x: rand(-20, W + 20), h: rand(80, 200), w: rand(30, 70) });
      }
      trees.sort((a, b) => a.h - b.h); // Far trees first (shorter)

      fireflies = [];
      for (let i = 0; i < 25; i++) {
        const x = rand(0, W);
        const y = rand(H * 0.2, H * 0.85);
        fireflies.push({ x, y, baseX: x, baseY: y, size: rand(1.5, 4), phase: rand(0, Math.PI * 2), speed: rand(0.3, 0.8), brightness: rand(0.3, 0.9), trail: [] });
      }

      mushrooms = [];
      for (let i = 0; i < 12; i++) {
        mushrooms.push({ x: rand(10, W - 10), y: H * 0.82 + rand(-5, 20), size: rand(4, 10), hue: rand(0, 360), phase: rand(0, Math.PI * 2) });
      }

      mists = [];
      for (let i = 0; i < 4; i++) {
        mists.push({ y: H * (0.55 + i * 0.1), speed: rand(0.08, 0.25), opacity: rand(0.02, 0.06), offset: rand(0, W) });
      }
    }

    function drawSky(t: number) {
      // Deep night gradient
      const grad = ctx!.createLinearGradient(0, 0, 0, H * 0.8);
      grad.addColorStop(0, '#050a1a');
      grad.addColorStop(0.25, '#0a1230');
      grad.addColorStop(0.5, '#0d1f35');
      grad.addColorStop(0.8, '#0a2a1a');
      grad.addColorStop(1, '#061510');
      ctx!.fillStyle = grad;
      ctx!.fillRect(0, 0, W, H);

      // Aurora hint — very subtle
      const auroraGrad = ctx!.createLinearGradient(W * 0.2, 0, W * 0.8, H * 0.3);
      auroraGrad.addColorStop(0, 'rgba(46,204,113,0)');
      auroraGrad.addColorStop(0.3, `rgba(46,204,113,${0.02 + Math.sin(t * 0.0003) * 0.01})`);
      auroraGrad.addColorStop(0.6, `rgba(52,152,219,${0.015 + Math.sin(t * 0.0004 + 1) * 0.01})`);
      auroraGrad.addColorStop(1, 'rgba(52,152,219,0)');
      ctx!.fillStyle = auroraGrad;
      ctx!.fillRect(0, 0, W, H * 0.35);
    }

    function drawMoon(_t: number) {
      const mx = W * 0.8, my = H * 0.08, mr = 28;
      // Outer glow
      const g3 = ctx!.createRadialGradient(mx, my, mr, mx, my, mr * 5);
      g3.addColorStop(0, 'rgba(255,240,200,0.08)');
      g3.addColorStop(0.5, 'rgba(255,240,200,0.02)');
      g3.addColorStop(1, 'rgba(255,240,200,0)');
      ctx!.fillStyle = g3;
      ctx!.fillRect(mx - mr * 5, my - mr * 5, mr * 10, mr * 10);
      // Inner glow
      const g2 = ctx!.createRadialGradient(mx, my, mr * 0.5, mx, my, mr * 2);
      g2.addColorStop(0, 'rgba(255,245,220,0.15)');
      g2.addColorStop(1, 'rgba(255,245,220,0)');
      ctx!.fillStyle = g2;
      ctx!.beginPath(); ctx!.arc(mx, my, mr * 2, 0, Math.PI * 2); ctx!.fill();
      // Disc
      const disc = ctx!.createRadialGradient(mx - 3, my - 3, 0, mx, my, mr);
      disc.addColorStop(0, '#fff8e1');
      disc.addColorStop(0.8, '#ffe082');
      disc.addColorStop(1, '#f0c040');
      ctx!.fillStyle = disc;
      ctx!.beginPath(); ctx!.arc(mx, my, mr, 0, Math.PI * 2); ctx!.fill();
      // Craters
      ctx!.fillStyle = 'rgba(200,180,120,0.15)';
      ctx!.beginPath(); ctx!.arc(mx - 8, my - 5, 5, 0, Math.PI * 2); ctx!.fill();
      ctx!.beginPath(); ctx!.arc(mx + 6, my + 4, 3.5, 0, Math.PI * 2); ctx!.fill();
      ctx!.beginPath(); ctx!.arc(mx - 2, my + 8, 2.5, 0, Math.PI * 2); ctx!.fill();
    }

    function drawStars(t: number) {
      for (const s of stars) {
        const alpha = 0.3 + 0.5 * Math.sin(t * s.twinkleSpeed + s.phase);
        ctx!.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx!.beginPath(); ctx!.arc(s.x, s.y, s.size, 0, Math.PI * 2); ctx!.fill();
      }
    }

    function drawTrees(t: number) {
      const baseY = H * 0.82;
      for (const tr of trees) {
        const sway = Math.sin(t * 0.0005 + tr.x * 0.01) * 2;
        // Trunk
        ctx!.fillStyle = 'rgba(15,25,15,0.9)';
        ctx!.fillRect(tr.x - 4, baseY - tr.h * 0.35, 8, tr.h * 0.4);
        // Foliage — layered dark circles
        const layers = [
          { dx: 0, dy: -0.55, r: 0.45, c: 'rgba(10,35,18,0.95)' },
          { dx: -0.2, dy: -0.48, r: 0.35, c: 'rgba(15,45,22,0.9)' },
          { dx: 0.2, dy: -0.5, r: 0.3, c: 'rgba(12,40,20,0.9)' },
          { dx: 0, dy: -0.62, r: 0.28, c: 'rgba(18,50,25,0.85)' },
        ];
        for (const l of layers) {
          ctx!.fillStyle = l.c;
          ctx!.beginPath();
          ctx!.arc(tr.x + l.dx * tr.w + sway, baseY - tr.h * (-l.dy), tr.w * l.r, 0, Math.PI * 2);
          ctx!.fill();
        }
      }
    }

    function drawGround() {
      const baseY = H * 0.82;
      const grad = ctx!.createLinearGradient(0, baseY, 0, H);
      grad.addColorStop(0, '#0a1f10');
      grad.addColorStop(0.3, '#071510');
      grad.addColorStop(1, '#040d08');
      ctx!.fillStyle = grad;
      ctx!.fillRect(0, baseY, W, H - baseY);

      // Grass tufts
      ctx!.fillStyle = 'rgba(20,60,30,0.5)';
      for (let i = 0; i < 40; i++) {
        const gx = rand(0, W);
        const gy = baseY + rand(-2, 10);
        ctx!.beginPath();
        ctx!.moveTo(gx - 2, gy);
        ctx!.lineTo(gx, gy - rand(5, 15));
        ctx!.lineTo(gx + 2, gy);
        ctx!.fill();
      }
    }

    function drawMushrooms(t: number) {
      for (const m of mushrooms) {
        const glow = 0.3 + 0.3 * Math.sin(t * 0.002 + m.phase);
        // Glow
        const mg = ctx!.createRadialGradient(m.x, m.y - m.size, 0, m.x, m.y - m.size, m.size * 3);
        mg.addColorStop(0, `hsla(${m.hue},80%,60%,${glow * 0.15})`);
        mg.addColorStop(1, `hsla(${m.hue},80%,60%,0)`);
        ctx!.fillStyle = mg;
        ctx!.fillRect(m.x - m.size * 3, m.y - m.size * 4, m.size * 6, m.size * 4);
        // Stem
        ctx!.fillStyle = 'rgba(200,200,180,0.3)';
        ctx!.fillRect(m.x - 1.5, m.y - m.size * 0.3, 3, m.size * 0.5);
        // Cap
        ctx!.fillStyle = `hsla(${m.hue},70%,50%,${0.4 + glow * 0.3})`;
        ctx!.beginPath();
        ctx!.arc(m.x, m.y - m.size * 0.5, m.size * 0.7, Math.PI, 0);
        ctx!.fill();
        // Spots
        ctx!.fillStyle = `rgba(255,255,255,${0.2 + glow * 0.15})`;
        ctx!.beginPath(); ctx!.arc(m.x - m.size * 0.2, m.y - m.size * 0.65, m.size * 0.12, 0, Math.PI * 2); ctx!.fill();
        ctx!.beginPath(); ctx!.arc(m.x + m.size * 0.2, m.y - m.size * 0.55, m.size * 0.09, 0, Math.PI * 2); ctx!.fill();
      }
    }

    function drawFireflies(t: number) {
      for (const ff of fireflies) {
        // Wander
        ff.x = ff.baseX + Math.sin(t * 0.001 * ff.speed + ff.phase) * 50 + Math.sin(t * 0.0007 + ff.phase * 2) * 20;
        ff.y = ff.baseY + Math.cos(t * 0.0008 * ff.speed + ff.phase) * 30;

        // Trail
        ff.trail.push({ x: ff.x, y: ff.y, a: ff.brightness });
        if (ff.trail.length > 8) ff.trail.shift();

        // Draw trail
        for (let i = 0; i < ff.trail.length; i++) {
          const pt = ff.trail[i];
          const trailAlpha = (i / ff.trail.length) * 0.3 * pt.a;
          ctx!.fillStyle = `rgba(255,238,170,${trailAlpha})`;
          ctx!.beginPath();
          ctx!.arc(pt.x, pt.y, ff.size * 0.5 * (i / ff.trail.length), 0, Math.PI * 2);
          ctx!.fill();
        }

        // Main glow
        const pulse = 0.5 + 0.5 * Math.sin(t * 0.003 + ff.phase);
        const glowR = ff.size * (2 + pulse);
        const glow = ctx!.createRadialGradient(ff.x, ff.y, 0, ff.x, ff.y, glowR);
        glow.addColorStop(0, `rgba(255,238,170,${ff.brightness * pulse * 0.6})`);
        glow.addColorStop(0.5, `rgba(255,238,170,${ff.brightness * pulse * 0.15})`);
        glow.addColorStop(1, 'rgba(255,238,170,0)');
        ctx!.fillStyle = glow;
        ctx!.fillRect(ff.x - glowR, ff.y - glowR, glowR * 2, glowR * 2);

        // Core
        ctx!.fillStyle = `rgba(255,245,200,${ff.brightness * pulse})`;
        ctx!.beginPath(); ctx!.arc(ff.x, ff.y, ff.size * 0.6, 0, Math.PI * 2); ctx!.fill();
      }
    }

    function drawMist(t: number) {
      for (const m of mists) {
        const offset = (t * m.speed * 0.05 + m.offset) % (W * 2);
        ctx!.fillStyle = `rgba(100,180,130,${m.opacity})`;
        // Wide soft ellipses drifting
        for (let i = 0; i < 3; i++) {
          const mx = (offset + i * W * 0.7) % (W * 2) - W * 0.3;
          ctx!.beginPath();
          ctx!.ellipse(mx, m.y, W * 0.4, 15 + Math.sin(t * 0.0005 + i) * 5, 0, 0, Math.PI * 2);
          ctx!.fill();
        }
      }
    }

    function drawShootingStar(_t: number) {
      shootingStarTimer -= 16;
      if (shootingStarTimer <= 0 && !shootingStar) {
        shootingStar = {
          x: rand(W * 0.1, W * 0.6), y: rand(H * 0.02, H * 0.15),
          vx: rand(3, 6), vy: rand(1, 3),
          life: 0, maxLife: rand(30, 60),
        };
        shootingStarTimer = rand(5000, 15000);
      }
      if (shootingStar) {
        shootingStar.x += shootingStar.vx;
        shootingStar.y += shootingStar.vy;
        shootingStar.life++;
        const pct = 1 - shootingStar.life / shootingStar.maxLife;
        if (pct <= 0) { shootingStar = null; return; }
        // Trail
        ctx!.strokeStyle = `rgba(255,255,255,${pct * 0.7})`;
        ctx!.lineWidth = 1.5;
        ctx!.beginPath();
        ctx!.moveTo(shootingStar.x, shootingStar.y);
        ctx!.lineTo(shootingStar.x - shootingStar.vx * 8, shootingStar.y - shootingStar.vy * 8);
        ctx!.stroke();
        // Head
        ctx!.fillStyle = `rgba(255,255,255,${pct})`;
        ctx!.beginPath(); ctx!.arc(shootingStar.x, shootingStar.y, 1.5, 0, Math.PI * 2); ctx!.fill();
      }
    }

    function loop(t: number) {
      if (!running.current) return;

      if (canvas!.width !== canvas!.clientWidth || canvas!.height !== canvas!.clientHeight) {
        W = canvas!.width = canvas!.clientWidth;
        H = canvas!.height = canvas!.clientHeight;
        generate();
      }

      drawSky(t);
      drawStars(t);
      drawMoon(t);
      drawShootingStar(t);
      drawMist(t);
      drawTrees(t);
      drawGround();
      drawMushrooms(t);
      drawFireflies(t);

      animId.current = requestAnimationFrame(loop);
    }

    W = canvas.width = canvas.clientWidth || 600;
    H = canvas.height = canvas.clientHeight || 800;
    generate();
    running.current = true;
    animId.current = requestAnimationFrame(loop);

    return () => {
      running.current = false;
      cancelAnimationFrame(animId.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
}
