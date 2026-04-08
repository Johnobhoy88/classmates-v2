/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 *
 * REACTIVE ENCHANTED FOREST — Canvas 2D background that responds to gameplay
 * Fireflies swarm on correct, scatter on wrong, aurora builds with streak,
 * sky shifts from twilight to dawn as game progresses, flowers bloom on word complete
 */

import { useEffect, useRef } from 'react';

function rand(a: number, b: number) { return a + Math.random() * (b - a); }

/** Game state bridge — the forest reads this every frame */
export interface ForestState {
  /** 0-1 game progress (idx/total) */
  progress: number;
  /** Current streak count */
  streak: number;
  /** Lives remaining / max lives (0-1) */
  livesRatio: number;
  /** Momentary flash events — set then cleared */
  event: 'none' | 'correct' | 'wrong' | 'wordComplete' | 'wordFailed' | 'gameComplete';
}

interface Firefly { x: number; y: number; baseX: number; baseY: number; size: number; phase: number; speed: number; brightness: number; trail: Array<{x: number; y: number; a: number}>; targetX: number; targetY: number; }
interface StarObj { x: number; y: number; size: number; twinkleSpeed: number; phase: number; permanent?: boolean; }
interface Mushroom { x: number; y: number; size: number; hue: number; phase: number; }
interface MistLayer { y: number; speed: number; baseOpacity: number; offset: number; }
interface TreeObj { x: number; h: number; w: number; shakeAmount: number; }
interface Flower { x: number; y: number; size: number; hue: number; life: number; maxLife: number; }

export function SpellingForestBg({ state }: { state: ForestState }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const running = useRef(false);
  const animId = useRef(0);
  const stateRef = useRef<ForestState>(state);
  stateRef.current = state;

  // Track consumed events so we only react once per event
  const lastEvent = useRef<string>('none');

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
    let trees: TreeObj[] = [];
    let flowers: Flower[] = [];
    let shootingStarTimer = rand(3000, 8000);
    let shootingStar: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number } | null = null;
    let forceShootingStar = false;
    let brightnessFlash = 0; // -1 to 1, decays to 0
    let extraFireflyCount = 0;

    function generate() {
      if (!W || !H) return;
      stars = [];
      for (let i = 0; i < 80; i++) {
        stars.push({ x: rand(0, W), y: rand(0, H * 0.4), size: rand(0.5, 2), twinkleSpeed: rand(0.001, 0.004), phase: rand(0, Math.PI * 2) });
      }
      trees = [];
      const treeCount = Math.floor(W / 60) + 4;
      for (let i = 0; i < treeCount; i++) {
        trees.push({ x: rand(-20, W + 20), h: rand(80, 200), w: rand(30, 70), shakeAmount: 0 });
      }
      trees.sort((a, b) => a.h - b.h);
      fireflies = [];
      for (let i = 0; i < 25; i++) {
        const x = rand(0, W); const y = rand(H * 0.2, H * 0.85);
        fireflies.push({ x, y, baseX: x, baseY: y, size: rand(1.5, 4), phase: rand(0, Math.PI * 2), speed: rand(0.3, 0.8), brightness: rand(0.3, 0.9), trail: [], targetX: x, targetY: y });
      }
      mushrooms = [];
      for (let i = 0; i < 12; i++) {
        mushrooms.push({ x: rand(10, W - 10), y: H * 0.82 + rand(-5, 20), size: rand(4, 10), hue: rand(0, 360), phase: rand(0, Math.PI * 2) });
      }
      mists = [];
      for (let i = 0; i < 4; i++) {
        mists.push({ y: H * (0.55 + i * 0.1), speed: rand(0.08, 0.25), baseOpacity: rand(0.02, 0.06), offset: rand(0, W) });
      }
    }

    function processEvents() {
      const s = stateRef.current;
      const ev = s.event;
      if (ev === lastEvent.current || ev === 'none') return;
      lastEvent.current = ev;

      if (ev === 'correct') {
        // Fireflies swarm toward center, brief golden flash
        const cx = W / 2, cy = H * 0.35;
        for (const ff of fireflies) {
          ff.targetX = cx + rand(-60, 60);
          ff.targetY = cy + rand(-30, 30);
        }
        brightnessFlash = 0.15;
        setTimeout(() => {
          for (const ff of fireflies) { ff.targetX = ff.baseX; ff.targetY = ff.baseY; }
        }, 600);
      } else if (ev === 'wrong') {
        // Fireflies scatter outward, brief dim
        for (const ff of fireflies) {
          ff.targetX = ff.baseX + rand(-80, 80);
          ff.targetY = ff.baseY + rand(-60, 60);
        }
        brightnessFlash = -0.08;
        // Shake nearest tree
        if (trees.length > 0) {
          const t = trees[Math.floor(rand(0, trees.length))];
          t.shakeAmount = 6;
        }
        setTimeout(() => {
          for (const ff of fireflies) { ff.targetX = ff.baseX; ff.targetY = ff.baseY; }
        }, 800);
      } else if (ev === 'wordComplete') {
        // Flower burst + guaranteed shooting star
        for (let i = 0; i < 5; i++) {
          flowers.push({
            x: rand(W * 0.2, W * 0.8), y: H * 0.82 + rand(-5, 5),
            size: rand(4, 8), hue: rand(0, 360), life: 0, maxLife: rand(60, 120),
          });
        }
        forceShootingStar = true;
        brightnessFlash = 0.2;
      } else if (ev === 'wordFailed') {
        // Mist thickens, wind gust (all trees shake)
        for (const t of trees) t.shakeAmount = 4;
        brightnessFlash = -0.1;
      } else if (ev === 'gameComplete') {
        // Big celebration — lots of flowers, bright flash
        for (let i = 0; i < 15; i++) {
          flowers.push({
            x: rand(0, W), y: H * 0.82 + rand(-10, 10),
            size: rand(5, 12), hue: rand(0, 360), life: 0, maxLife: rand(90, 180),
          });
        }
        brightnessFlash = 0.3;
        forceShootingStar = true;
        // Add permanent stars for earned stars
        for (let i = 0; i < 3; i++) {
          stars.push({ x: rand(W * 0.3, W * 0.7), y: rand(H * 0.02, H * 0.15), size: 2.5, twinkleSpeed: 0.002, phase: rand(0, Math.PI * 2), permanent: true });
        }
      }
    }

    function drawSky(t: number) {
      const s = stateRef.current;
      // Sky shifts from twilight to dawn as progress increases
      const p = s.progress;
      const r1 = Math.round(0x1a + p * 0x20), g1 = Math.round(0x2a + p * 0x15), b1 = Math.round(0x5c - p * 0x10);
      const r2 = Math.round(0x14 + p * 0x30), g2 = Math.round(0x5a + p * 0x20), b2 = Math.round(0x2e + p * 0x10);
      const grad = ctx!.createLinearGradient(0, 0, 0, H * 0.8);
      grad.addColorStop(0, `rgb(${r1},${g1},${b1})`);
      grad.addColorStop(0.4, `rgb(${Math.round(r1 * 0.9)},${Math.round(g1 * 1.1)},${Math.round(b1 * 0.85)})`);
      grad.addColorStop(0.85, `rgb(${r2},${g2},${b2})`);
      grad.addColorStop(1, `rgb(${Math.round(r2 * 0.7)},${Math.round(g2 * 0.6)},${Math.round(b2 * 0.6)})`);
      ctx!.fillStyle = grad;
      ctx!.fillRect(0, 0, W, H);

      // Aurora — intensity scales with streak
      const auroraStrength = 0.04 + Math.min(s.streak, 10) * 0.015;
      const auroraGrad = ctx!.createLinearGradient(W * 0.1, 0, W * 0.9, H * 0.4);
      auroraGrad.addColorStop(0, 'rgba(46,204,113,0)');
      auroraGrad.addColorStop(0.3, `rgba(46,204,113,${auroraStrength + Math.sin(t * 0.0003) * 0.02})`);
      auroraGrad.addColorStop(0.6, `rgba(52,152,219,${auroraStrength * 0.8 + Math.sin(t * 0.0004 + 1) * 0.02})`);
      auroraGrad.addColorStop(1, 'rgba(52,152,219,0)');
      ctx!.fillStyle = auroraGrad;
      ctx!.fillRect(0, 0, W, H * 0.4);

      // Brightness flash overlay
      if (brightnessFlash > 0.01) {
        ctx!.fillStyle = `rgba(255,240,180,${brightnessFlash})`;
        ctx!.fillRect(0, 0, W, H);
        brightnessFlash *= 0.94;
      } else if (brightnessFlash < -0.01) {
        ctx!.fillStyle = `rgba(0,0,20,${-brightnessFlash})`;
        ctx!.fillRect(0, 0, W, H);
        brightnessFlash *= 0.94;
      } else {
        brightnessFlash = 0;
      }
    }

    function drawMoon() {
      const mx = W * 0.8, my = H * 0.08, mr = 28;
      const g3 = ctx!.createRadialGradient(mx, my, mr, mx, my, mr * 5);
      g3.addColorStop(0, 'rgba(255,240,200,0.08)');
      g3.addColorStop(0.5, 'rgba(255,240,200,0.02)');
      g3.addColorStop(1, 'rgba(255,240,200,0)');
      ctx!.fillStyle = g3;
      ctx!.fillRect(mx - mr * 5, my - mr * 5, mr * 10, mr * 10);
      const g2 = ctx!.createRadialGradient(mx, my, mr * 0.5, mx, my, mr * 2);
      g2.addColorStop(0, 'rgba(255,245,220,0.15)');
      g2.addColorStop(1, 'rgba(255,245,220,0)');
      ctx!.fillStyle = g2;
      ctx!.beginPath(); ctx!.arc(mx, my, mr * 2, 0, Math.PI * 2); ctx!.fill();
      const disc = ctx!.createRadialGradient(mx - 3, my - 3, 0, mx, my, mr);
      disc.addColorStop(0, '#fff8e1'); disc.addColorStop(0.8, '#ffe082'); disc.addColorStop(1, '#f0c040');
      ctx!.fillStyle = disc;
      ctx!.beginPath(); ctx!.arc(mx, my, mr, 0, Math.PI * 2); ctx!.fill();
      ctx!.fillStyle = 'rgba(200,180,120,0.15)';
      ctx!.beginPath(); ctx!.arc(mx - 8, my - 5, 5, 0, Math.PI * 2); ctx!.fill();
      ctx!.beginPath(); ctx!.arc(mx + 6, my + 4, 3.5, 0, Math.PI * 2); ctx!.fill();
    }

    function drawStars(t: number) {
      for (const s of stars) {
        const alpha = s.permanent ? 0.7 + 0.3 * Math.sin(t * 0.002 + s.phase) : 0.3 + 0.5 * Math.sin(t * s.twinkleSpeed + s.phase);
        ctx!.fillStyle = s.permanent ? `rgba(255,223,100,${alpha})` : `rgba(255,255,255,${alpha})`;
        ctx!.beginPath(); ctx!.arc(s.x, s.y, s.size, 0, Math.PI * 2); ctx!.fill();
        if (s.permanent) {
          ctx!.fillStyle = `rgba(255,223,100,${alpha * 0.3})`;
          ctx!.beginPath(); ctx!.arc(s.x, s.y, s.size * 3, 0, Math.PI * 2); ctx!.fill();
        }
      }
    }

    function drawTrees(t: number) {
      const baseY = H * 0.82;
      for (const tr of trees) {
        const sway = Math.sin(t * 0.0005 + tr.x * 0.01) * 2;
        const shake = tr.shakeAmount > 0.1 ? Math.sin(t * 0.02) * tr.shakeAmount : 0;
        if (tr.shakeAmount > 0.1) tr.shakeAmount *= 0.95;
        const tx = tr.x + shake;
        ctx!.fillStyle = 'rgba(40,55,30,0.9)';
        ctx!.fillRect(tx - 4, baseY - tr.h * 0.35, 8, tr.h * 0.4);
        const layers = [
          { dx: 0, dy: -0.55, r: 0.45, c: 'rgba(20,70,35,0.9)' },
          { dx: -0.2, dy: -0.48, r: 0.35, c: 'rgba(30,85,40,0.85)' },
          { dx: 0.2, dy: -0.5, r: 0.3, c: 'rgba(25,80,38,0.85)' },
          { dx: 0, dy: -0.62, r: 0.28, c: 'rgba(35,95,45,0.8)' },
        ];
        for (const l of layers) {
          ctx!.fillStyle = l.c;
          ctx!.beginPath();
          ctx!.arc(tx + l.dx * tr.w + sway, baseY - tr.h * (-l.dy), tr.w * l.r, 0, Math.PI * 2);
          ctx!.fill();
        }
      }
    }

    function drawGround() {
      const baseY = H * 0.82;
      const grad = ctx!.createLinearGradient(0, baseY, 0, H);
      grad.addColorStop(0, '#1a4a25'); grad.addColorStop(0.3, '#123a1a'); grad.addColorStop(1, '#0a2510');
      ctx!.fillStyle = grad;
      ctx!.fillRect(0, baseY, W, H - baseY);
      ctx!.fillStyle = 'rgba(40,100,50,0.5)';
      for (let i = 0; i < 40; i++) {
        const gx = rand(0, W); const gy = baseY + rand(-2, 10);
        ctx!.beginPath(); ctx!.moveTo(gx - 2, gy); ctx!.lineTo(gx, gy - rand(5, 15)); ctx!.lineTo(gx + 2, gy); ctx!.fill();
      }
    }

    function drawMushrooms(t: number) {
      const s = stateRef.current;
      const streakBoost = Math.min(s.streak, 10) * 0.05;
      for (const m of mushrooms) {
        const glow = 0.3 + 0.3 * Math.sin(t * 0.002 + m.phase) + streakBoost;
        const mg = ctx!.createRadialGradient(m.x, m.y - m.size, 0, m.x, m.y - m.size, m.size * 3);
        mg.addColorStop(0, `hsla(${m.hue},80%,60%,${glow * 0.25})`);
        mg.addColorStop(1, `hsla(${m.hue},80%,60%,0)`);
        ctx!.fillStyle = mg;
        ctx!.fillRect(m.x - m.size * 3, m.y - m.size * 4, m.size * 6, m.size * 4);
        ctx!.fillStyle = 'rgba(200,200,180,0.3)';
        ctx!.fillRect(m.x - 1.5, m.y - m.size * 0.3, 3, m.size * 0.5);
        ctx!.fillStyle = `hsla(${m.hue},70%,50%,${0.4 + glow * 0.3})`;
        ctx!.beginPath(); ctx!.arc(m.x, m.y - m.size * 0.5, m.size * 0.7, Math.PI, 0); ctx!.fill();
        ctx!.fillStyle = `rgba(255,255,255,${0.2 + glow * 0.15})`;
        ctx!.beginPath(); ctx!.arc(m.x - m.size * 0.2, m.y - m.size * 0.65, m.size * 0.12, 0, Math.PI * 2); ctx!.fill();
        ctx!.beginPath(); ctx!.arc(m.x + m.size * 0.2, m.y - m.size * 0.55, m.size * 0.09, 0, Math.PI * 2); ctx!.fill();
      }
    }

    function drawFireflies(t: number) {
      const s = stateRef.current;
      // Spawn extra fireflies based on streak
      const targetExtra = Math.min(s.streak, 10) * 2;
      while (extraFireflyCount < targetExtra && fireflies.length < 50) {
        const x = rand(0, W); const y = rand(H * 0.2, H * 0.7);
        fireflies.push({ x, y, baseX: x, baseY: y, size: rand(2, 4), phase: rand(0, Math.PI * 2), speed: rand(0.4, 1), brightness: rand(0.5, 1), trail: [], targetX: x, targetY: y });
        extraFireflyCount++;
      }

      for (const ff of fireflies) {
        // Move toward target (swarm behavior)
        ff.x += (ff.targetX - ff.x) * 0.02 + Math.sin(t * 0.001 * ff.speed + ff.phase) * 1.5;
        ff.y += (ff.targetY - ff.y) * 0.02 + Math.cos(t * 0.0008 * ff.speed + ff.phase) * 1;
        ff.trail.push({ x: ff.x, y: ff.y, a: ff.brightness });
        if (ff.trail.length > 8) ff.trail.shift();
        for (let i = 0; i < ff.trail.length; i++) {
          const pt = ff.trail[i]; const trailAlpha = (i / ff.trail.length) * 0.3 * pt.a;
          ctx!.fillStyle = `rgba(255,238,170,${trailAlpha})`;
          ctx!.beginPath(); ctx!.arc(pt.x, pt.y, ff.size * 0.5 * (i / ff.trail.length), 0, Math.PI * 2); ctx!.fill();
        }
        const pulse = 0.5 + 0.5 * Math.sin(t * 0.003 + ff.phase);
        const glowR = ff.size * (2 + pulse);
        const glow = ctx!.createRadialGradient(ff.x, ff.y, 0, ff.x, ff.y, glowR);
        glow.addColorStop(0, `rgba(255,238,170,${ff.brightness * pulse * 0.8})`);
        glow.addColorStop(0.5, `rgba(255,238,170,${ff.brightness * pulse * 0.25})`);
        glow.addColorStop(1, 'rgba(255,238,170,0)');
        ctx!.fillStyle = glow;
        ctx!.fillRect(ff.x - glowR, ff.y - glowR, glowR * 2, glowR * 2);
        ctx!.fillStyle = `rgba(255,245,200,${ff.brightness * pulse})`;
        ctx!.beginPath(); ctx!.arc(ff.x, ff.y, ff.size * 0.6, 0, Math.PI * 2); ctx!.fill();
      }
    }

    function drawMist(t: number) {
      const s = stateRef.current;
      // Mist thickens when lives are low
      const livesBoost = (1 - s.livesRatio) * 0.04;
      for (const m of mists) {
        const offset = (t * m.speed * 0.05 + m.offset) % (W * 2);
        const opacity = m.baseOpacity + livesBoost;
        ctx!.fillStyle = `rgba(100,180,130,${opacity})`;
        for (let i = 0; i < 3; i++) {
          const mx = (offset + i * W * 0.7) % (W * 2) - W * 0.3;
          ctx!.beginPath();
          ctx!.ellipse(mx, m.y, W * 0.4, 15 + Math.sin(t * 0.0005 + i) * 5, 0, 0, Math.PI * 2);
          ctx!.fill();
        }
      }
    }

    function drawFlowers(t: number) {
      for (let i = flowers.length - 1; i >= 0; i--) {
        const f = flowers[i];
        f.life++;
        if (f.life > f.maxLife) { flowers.splice(i, 1); continue; }
        const pct = f.life / f.maxLife;
        const growScale = pct < 0.15 ? pct / 0.15 : pct > 0.7 ? 1 - (pct - 0.7) / 0.3 : 1;
        const size = f.size * growScale;
        if (size < 0.5) continue;
        // Stem
        ctx!.strokeStyle = `rgba(60,140,60,${growScale * 0.6})`;
        ctx!.lineWidth = 1.5;
        ctx!.beginPath(); ctx!.moveTo(f.x, f.y); ctx!.lineTo(f.x, f.y - size * 2); ctx!.stroke();
        // Petals
        const petalCount = 5;
        for (let p = 0; p < petalCount; p++) {
          const angle = (p / petalCount) * Math.PI * 2 + t * 0.001;
          const px = f.x + Math.cos(angle) * size;
          const py = f.y - size * 2 + Math.sin(angle) * size;
          ctx!.fillStyle = `hsla(${f.hue},75%,65%,${growScale * 0.7})`;
          ctx!.beginPath(); ctx!.arc(px, py, size * 0.4, 0, Math.PI * 2); ctx!.fill();
        }
        ctx!.fillStyle = `rgba(255,220,80,${growScale * 0.8})`;
        ctx!.beginPath(); ctx!.arc(f.x, f.y - size * 2, size * 0.3, 0, Math.PI * 2); ctx!.fill();
      }
    }

    function drawShootingStar() {
      shootingStarTimer -= 16;
      if ((shootingStarTimer <= 0 || forceShootingStar) && !shootingStar) {
        shootingStar = {
          x: rand(W * 0.1, W * 0.6), y: rand(H * 0.02, H * 0.15),
          vx: rand(3, 6), vy: rand(1, 3), life: 0, maxLife: rand(30, 60),
        };
        shootingStarTimer = rand(5000, 15000);
        forceShootingStar = false;
      }
      if (shootingStar) {
        shootingStar.x += shootingStar.vx; shootingStar.y += shootingStar.vy; shootingStar.life++;
        const pct = 1 - shootingStar.life / shootingStar.maxLife;
        if (pct <= 0) { shootingStar = null; return; }
        ctx!.strokeStyle = `rgba(255,255,255,${pct * 0.7})`;
        ctx!.lineWidth = 1.5;
        ctx!.beginPath();
        ctx!.moveTo(shootingStar.x, shootingStar.y);
        ctx!.lineTo(shootingStar.x - shootingStar.vx * 8, shootingStar.y - shootingStar.vy * 8);
        ctx!.stroke();
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
      processEvents();
      drawSky(t);
      drawStars(t);
      drawMoon();
      drawShootingStar();
      drawMist(t);
      drawTrees(t);
      drawGround();
      drawMushrooms(t);
      drawFlowers(t);
      drawFireflies(t);
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
