/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 *
 * Landing backdrop — Bright Highland Day
 * Rolling green hills, blue sky, fluffy clouds, sunshine,
 * birds, butterflies, daisies, trees
 * For the kids of South Lodge Primary, Invergordon
 * Ported from V1 landing-fx.js
 */

import { useEffect, useRef } from 'react';

function rand(a: number, b: number) { return a + Math.random() * (b - a); }

interface Cloud { x: number; y: number; w: number; h: number; speed: number; puffs: number; opacity: number; }
interface Bird { x: number; y: number; speed: number; wingPhase: number; size: number; }
interface HillLayer { points: { x: number; y: number }[]; color1: string; color2: string; sway: number; }
interface Daisy { x: number; y: number; size: number; color: string; phase: number; }
interface Butterfly { x: number; y: number; vx: number; vy: number; wingPhase: number; size: number; color: string; }
interface SunRay { angle: number; length: number; width: number; opacity: number; }

export function LandingScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const running = useRef(false);
  const animId = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0, H = 0;
    let clouds: Cloud[] = [];
    let birds: Bird[] = [];
    let hillLayers: HillLayer[] = [];
    let daisies: Daisy[] = [];
    let butterflies: Butterfly[] = [];
    let sunRays: SunRay[] = [];
    void 0; // scene state initialized

    function generateScene() {
      if (!W || !H) return;

      clouds = [];
      for (let i = 0; i < 8; i++) {
        clouds.push({ x: rand(-100, W + 100), y: rand(H * 0.04, H * 0.28), w: rand(100, 220), h: rand(40, 70), speed: rand(0.15, 0.5), puffs: Math.floor(rand(3, 6)), opacity: rand(0.7, 0.95) });
      }

      birds = [];
      for (let i = 0; i < 5; i++) {
        birds.push({ x: rand(0, W), y: rand(H * 0.08, H * 0.25), speed: rand(0.4, 1.2), wingPhase: rand(0, Math.PI * 2), size: rand(4, 8) });
      }

      hillLayers = [];
      const farPoints: { x: number; y: number }[] = [];
      for (let x = 0; x <= W + 40; x += 40) {
        farPoints.push({ x, y: H * 0.48 + Math.sin(x * 0.004 + 1.2) * H * 0.06 + Math.sin(x * 0.009) * H * 0.03 });
      }
      hillLayers.push({ points: farPoints, color1: '#5b9f6e', color2: '#3d7a50', sway: 0.002 });

      const midPoints: { x: number; y: number }[] = [];
      for (let x = 0; x <= W + 40; x += 30) {
        midPoints.push({ x, y: H * 0.58 + Math.sin(x * 0.006 + 0.5) * H * 0.05 + Math.sin(x * 0.013) * H * 0.025 });
      }
      hillLayers.push({ points: midPoints, color1: '#4CAF50', color2: '#2E7D32', sway: 0.003 });

      const nearPoints: { x: number; y: number }[] = [];
      for (let x = 0; x <= W + 40; x += 25) {
        nearPoints.push({ x, y: H * 0.72 + Math.sin(x * 0.008 + 2) * H * 0.04 + Math.sin(x * 0.015) * H * 0.02 });
      }
      hillLayers.push({ points: nearPoints, color1: '#66BB6A', color2: '#388E3C', sway: 0.004 });

      daisies = [];
      for (let i = 0; i < 35; i++) {
        const dx = rand(0, W);
        const hillY = H * 0.72 + Math.sin(dx * 0.008 + 2) * H * 0.04 + Math.sin(dx * 0.015) * H * 0.02;
        daisies.push({ x: dx, y: hillY + rand(-8, 20), size: rand(3, 7), color: ['#fff', '#FFD93D', '#FF6B6B', '#74b9ff', '#a29bfe', '#fd79a8'][Math.floor(rand(0, 6))], phase: rand(0, Math.PI * 2) });
      }

      butterflies = [];
      for (let i = 0; i < 4; i++) {
        butterflies.push({ x: rand(W * 0.1, W * 0.9), y: rand(H * 0.35, H * 0.65), vx: rand(-0.3, 0.3), vy: rand(-0.2, 0.2), wingPhase: rand(0, Math.PI * 2), size: rand(5, 9), color: ['#FF6B6B', '#FFD93D', '#74b9ff', '#a29bfe', '#fd79a8', '#55efc4'][Math.floor(rand(0, 6))] });
      }

      sunRays = [];
      for (let i = 0; i < 8; i++) {
        sunRays.push({ angle: (i / 8) * Math.PI * 2, length: rand(80, 160), width: rand(15, 40), opacity: rand(0.03, 0.08) });
      }
    }

    function drawSky() {
      const grad = ctx!.createLinearGradient(0, 0, 0, H * 0.7);
      grad.addColorStop(0, '#4FC3F7');
      grad.addColorStop(0.3, '#81D4FA');
      grad.addColorStop(0.6, '#B3E5FC');
      grad.addColorStop(1, '#E1F5FE');
      ctx!.fillStyle = grad;
      ctx!.fillRect(0, 0, W, H);
    }

    function drawSun(time: number) {
      const sx = W * 0.78, sy = H * 0.12, sr = 40;
      const t = time * 0.001;

      const glow = ctx!.createRadialGradient(sx, sy, sr * 0.5, sx, sy, sr * 4);
      glow.addColorStop(0, 'rgba(255,235,59,0.3)');
      glow.addColorStop(0.3, 'rgba(255,235,59,0.1)');
      glow.addColorStop(1, 'rgba(255,235,59,0)');
      ctx!.fillStyle = glow;
      ctx!.fillRect(sx - sr * 4, sy - sr * 4, sr * 8, sr * 8);

      ctx!.save();
      ctx!.translate(sx, sy);
      ctx!.rotate(t * 0.1);
      for (let i = 0; i < sunRays.length; i++) {
        const r = sunRays[i];
        const pulseLen = r.length + Math.sin(t * 0.5 + i) * 20;
        ctx!.save();
        ctx!.rotate(r.angle);
        ctx!.beginPath();
        ctx!.moveTo(sr * 0.8, -r.width * 0.5);
        ctx!.lineTo(pulseLen, 0);
        ctx!.lineTo(sr * 0.8, r.width * 0.5);
        ctx!.closePath();
        ctx!.fillStyle = `rgba(255,235,59,${r.opacity + Math.sin(t + i) * 0.02})`;
        ctx!.fill();
        ctx!.restore();
      }
      ctx!.restore();

      const sunGrad = ctx!.createRadialGradient(sx, sy, 0, sx, sy, sr);
      sunGrad.addColorStop(0, '#FFF9C4');
      sunGrad.addColorStop(0.7, '#FFD93D');
      sunGrad.addColorStop(1, '#F0A500');
      ctx!.fillStyle = sunGrad;
      ctx!.beginPath();
      ctx!.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx!.fill();
    }

    function drawClouds(time: number) {
      const t = time * 0.001;
      for (const c of clouds) {
        let cx = c.x + t * c.speed * 20;
        if (cx > W + c.w) cx -= W + c.w * 2;
        if (cx < -c.w) cx += W + c.w * 2;
        ctx!.globalAlpha = c.opacity;
        ctx!.fillStyle = '#fff';
        const pw = c.w / c.puffs;
        for (let p = 0; p < c.puffs; p++) {
          const px = cx + p * pw * 0.7;
          const py = c.y + Math.sin(p * 1.5) * c.h * 0.2;
          const pr = pw * 0.55 + Math.sin(p * 2.1) * pw * 0.15;
          ctx!.beginPath();
          ctx!.arc(px, py, pr, 0, Math.PI * 2);
          ctx!.fill();
        }
        ctx!.beginPath();
        ctx!.ellipse(cx + c.w * 0.3, c.y + c.h * 0.15, c.w * 0.45, c.h * 0.25, 0, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.globalAlpha = 1;
      }
    }

    function drawBirds(time: number) {
      const t = time * 0.001;
      ctx!.strokeStyle = '#546E7A';
      ctx!.lineWidth = 1.5;
      ctx!.lineCap = 'round';
      for (const b of birds) {
        const bx = (b.x + t * b.speed * 30) % (W + 100) - 50;
        const by = b.y + Math.sin(t * 0.8 + b.wingPhase) * 8;
        const wing = Math.sin(t * 3 + b.wingPhase) * b.size * 0.6;
        ctx!.beginPath();
        ctx!.moveTo(bx - b.size, by - wing);
        ctx!.quadraticCurveTo(bx - b.size * 0.3, by, bx, by);
        ctx!.quadraticCurveTo(bx + b.size * 0.3, by, bx + b.size, by - wing);
        ctx!.stroke();
      }
    }

    function drawHills(time: number) {
      const t = time * 0.001;
      for (const layer of hillLayers) {
        const pts = layer.points;
        const grad = ctx!.createLinearGradient(0, H * 0.4, 0, H);
        grad.addColorStop(0, layer.color1);
        grad.addColorStop(1, layer.color2);
        ctx!.fillStyle = grad;
        ctx!.beginPath();
        const offY = Math.sin(t * layer.sway * 100) * 2;
        ctx!.moveTo(pts[0].x, pts[0].y + offY);
        for (let i = 1; i < pts.length; i++) {
          const prev = pts[i - 1];
          const cur = pts[i];
          const cpx = (prev.x + cur.x) / 2;
          const cpy = (prev.y + cur.y) / 2 + offY;
          ctx!.quadraticCurveTo(prev.x, prev.y + offY, cpx, cpy);
        }
        ctx!.lineTo(W + 20, H);
        ctx!.lineTo(0, H);
        ctx!.closePath();
        ctx!.fill();
      }
    }

    function drawTrees(time: number) {
      const t = time * 0.001;
      const treePositions = [
        { x: W * 0.12, hill: 1 }, { x: W * 0.28, hill: 0 }, { x: W * 0.45, hill: 1 },
        { x: W * 0.62, hill: 0 }, { x: W * 0.85, hill: 1 }, { x: W * 0.95, hill: 0 },
      ];
      for (let i = 0; i < treePositions.length; i++) {
        const tp = treePositions[i];
        const layer = hillLayers[tp.hill];
        if (!layer || !layer.points.length) continue;
        let closestPt = layer.points[0];
        for (let j = 1; j < layer.points.length; j++) {
          if (Math.abs(layer.points[j].x - tp.x) < Math.abs(closestPt.x - tp.x)) closestPt = layer.points[j];
        }
        const ty = closestPt.y - 5;
        const sway = Math.sin(t * 0.8 + i * 2) * 2;
        const treeH = 28 + (i % 3) * 10;
        ctx!.fillStyle = '#5D4037';
        ctx!.fillRect(tp.x - 3, ty - treeH * 0.4, 6, treeH * 0.5);
        ctx!.fillStyle = i % 2 === 0 ? '#2E7D32' : '#388E3C';
        ctx!.beginPath(); ctx!.arc(tp.x + sway, ty - treeH * 0.55, treeH * 0.35, 0, Math.PI * 2); ctx!.fill();
        ctx!.fillStyle = i % 2 === 0 ? '#43A047' : '#4CAF50';
        ctx!.beginPath(); ctx!.arc(tp.x + sway - treeH * 0.15, ty - treeH * 0.45, treeH * 0.25, 0, Math.PI * 2); ctx!.fill();
        ctx!.beginPath(); ctx!.arc(tp.x + sway + treeH * 0.18, ty - treeH * 0.48, treeH * 0.22, 0, Math.PI * 2); ctx!.fill();
      }
    }

    function drawDaisies(time: number) {
      const t = time * 0.001;
      for (const d of daisies) {
        const sway = Math.sin(t * 1.2 + d.phase) * 2;
        ctx!.strokeStyle = '#43A047';
        ctx!.lineWidth = 1.5;
        ctx!.beginPath();
        ctx!.moveTo(d.x, d.y + d.size * 2);
        ctx!.quadraticCurveTo(d.x + sway, d.y + d.size, d.x + sway, d.y);
        ctx!.stroke();
        const petalCount = 5;
        ctx!.fillStyle = d.color;
        for (let p = 0; p < petalCount; p++) {
          const angle = (p / petalCount) * Math.PI * 2 + t * 0.2;
          const px = d.x + sway + Math.cos(angle) * d.size * 0.8;
          const py = d.y + Math.sin(angle) * d.size * 0.8;
          ctx!.beginPath(); ctx!.arc(px, py, d.size * 0.35, 0, Math.PI * 2); ctx!.fill();
        }
        ctx!.fillStyle = '#FFD93D';
        ctx!.beginPath(); ctx!.arc(d.x + sway, d.y, d.size * 0.3, 0, Math.PI * 2); ctx!.fill();
      }
    }

    function drawButterflies(time: number) {
      const t = time * 0.001;
      for (let i = 0; i < butterflies.length; i++) {
        const b = butterflies[i];
        b.x += Math.sin(t * 0.5 + i * 3) * 0.5 + b.vx;
        b.y += Math.sin(t * 0.7 + i * 2) * 0.3 + b.vy;
        if (b.x < -20) b.x = W + 20;
        if (b.x > W + 20) b.x = -20;
        if (b.y < H * 0.25) b.y = H * 0.25;
        if (b.y > H * 0.75) b.y = H * 0.75;
        const wing = Math.sin(t * 6 + b.wingPhase) * 0.7;
        ctx!.save();
        ctx!.translate(b.x, b.y);
        ctx!.fillStyle = b.color;
        ctx!.globalAlpha = 0.8;
        ctx!.save(); ctx!.scale(wing, 1);
        ctx!.beginPath(); ctx!.ellipse(-b.size * 0.4, -b.size * 0.2, b.size * 0.6, b.size * 0.4, -0.3, 0, Math.PI * 2); ctx!.fill();
        ctx!.restore();
        ctx!.save(); ctx!.scale(-wing, 1);
        ctx!.beginPath(); ctx!.ellipse(-b.size * 0.4, -b.size * 0.2, b.size * 0.6, b.size * 0.4, -0.3, 0, Math.PI * 2); ctx!.fill();
        ctx!.restore();
        ctx!.fillStyle = '#5D4037';
        ctx!.globalAlpha = 1;
        ctx!.beginPath(); ctx!.ellipse(0, 0, 1.5, b.size * 0.35, 0, 0, Math.PI * 2); ctx!.fill();
        ctx!.restore();
      }
    }

    function loop(t: number) {
      if (!running.current) return;

      if (canvas!.width !== canvas!.clientWidth || canvas!.height !== canvas!.clientHeight) {
        W = canvas!.width = canvas!.clientWidth;
        H = canvas!.height = canvas!.clientHeight;
        generateScene();
      }

      drawSky();
      drawSun(t);
      drawClouds(t);
      drawBirds(t);
      drawHills(t);
      drawTrees(t);
      drawDaisies(t);
      drawButterflies(t);

      animId.current = requestAnimationFrame(loop);
    }

    W = canvas.width = canvas.clientWidth || 600;
    H = canvas.height = canvas.clientHeight || 400;
    generateScene();
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
