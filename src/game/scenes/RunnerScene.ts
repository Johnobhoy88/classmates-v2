/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 *
 * SOUTHLODGE RUNNERS — Temple Run / Subway Surfers style endless runner.
 * Phaser 3 with pseudo-3D road, 3-lane swipe controls, spelling word gates,
 * Highland-themed obstacles, coins, particles, camera effects.
 * CfE: LIT 1-13a (spelling), LIT 1-21a (word recognition)
 */

import Phaser from 'phaser';

// ============================================================
// TYPES
// ============================================================

interface WordChallenge {
  word: string;
  confusions: string[];
  sentence: string;
}

interface RunnerCallbacks {
  onCoinCollect: () => void;
  onCorrectWord: (streak: number) => void;
  onWrongWord: () => void;
  onLifeLost: (remaining: number) => void;
  onGameOver: (score: number, wordsCorrect: number, wordsTotal: number, bestStreak: number) => void;
}

// ============================================================
// CONSTANTS
// ============================================================

const LANE_POSITIONS = [-120, 0, 120]; // x offsets for 3 lanes
const ROAD_WIDTH = 400;
const GROUND_Y = 0.78; // ground line as fraction of height

// Colour palette — Scottish Highland theme
const PAL = {
  sky: 0x7fb5d4,
  skyBot: 0xc4dce8,
  mountain: 0x6b7f96,
  mountainSnow: 0xe8edf2,
  hill: 0x4a7a3f,
  hillLight: 0x5d9a4e,
  grass: 0x3d8a2e,
  grassDark: 0x2d6a1e,
  road: 0x3a3a3a,
  roadLine: 0xdddddd,
  roadEdge: 0x888888,
  coin: 0xffd700,
  coinShine: 0xfff4aa,
  obstacle: 0x6b4226,
  obstacleTop: 0x8b5a2b,
  gateCorrect: 0x22c55e,
  gateWrong: 0xef4444,
  gateNeutral: 0x3b82f6,
  player: 0x2563eb,
  playerHighlight: 0x60a5fa,
  playerShoe: 0xdc2626,
};

// ============================================================
// RUNNER SCENE
// ============================================================

export class RunnerScene extends Phaser.Scene {
  private callbacks!: RunnerCallbacks;
  private words: WordChallenge[] = [];

  // Game state
  private lane = 1; // 0=left, 1=center, 2=right
  private targetLane = 1;
  private playerX = 0;
  private isJumping = false;
  private isSliding = false;
  private jumpVelocity = 0;
  private playerYOffset = 0;
  private speed = 3;
  private distance = 0;
  private score = 0;
  private lives = 3;
  private wordIdx = 0;
  private wordsCorrect = 0;
  private wordsTotal = 0;
  private streak = 0;
  private bestStreak = 0;
  private gameOver = false;
  private invincible = false;

  // Visual elements
  private playerContainer!: Phaser.GameObjects.Container;
  private playerBody!: Phaser.GameObjects.Graphics;
  private roadGraphics!: Phaser.GameObjects.Graphics;
  private bgGraphics!: Phaser.GameObjects.Graphics;
  // uiText removed — HUD uses individual text objects
  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private streakText!: Phaser.GameObjects.Text;

  // Road objects
  private coins: Array<{ lane: number; z: number; collected: boolean }> = [];
  private obstacles: Array<{ lane: number; z: number; hit: boolean; type: string }> = [];
  private wordGates: Array<{
    z: number;
    options: Array<{ lane: number; text: string; correct: boolean }>;
    passed: boolean;
  }> = [];

  // Particles
  private coinEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private dustEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private sparkEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  // Swipe detection
  private swipeStartX = 0;
  private swipeStartY = 0;
  private swipeStartTime = 0;

  // Animation
  private runFrame = 0;
  private frameTimer = 0;
  private mountainOffset = 0;
  private hillOffset = 0;

  constructor() {
    super({ key: 'RunnerScene' });
  }

  init(data: { words?: WordChallenge[]; callbacks?: RunnerCallbacks }) {
    if (!data?.callbacks || !data?.words) return; // Safety: don't init without data
    this.callbacks = data.callbacks;
    this.words = data.words;
    this.lane = 1;
    this.targetLane = 1;
    this.playerX = 0;
    this.speed = 3;
    this.distance = 0;
    this.score = 0;
    this.lives = 3;
    this.wordIdx = 0;
    this.wordsCorrect = 0;
    this.wordsTotal = 0;
    this.streak = 0;
    this.bestStreak = 0;
    this.gameOver = false;
    this.isJumping = false;
    this.isSliding = false;
    this.jumpVelocity = 0;
    this.playerYOffset = 0;
    this.invincible = false;
    this.coins = [];
    this.obstacles = [];
    this.wordGates = [];
    this.runFrame = 0;
    this.mountainOffset = 0;
    this.hillOffset = 0;
  }

  create() {
    if (!this.callbacks) return; // Not initialized — skip
    const { width: W, height: H } = this.scale;

    // Background layer (drawn once, scrolled via offset)
    this.bgGraphics = this.add.graphics();

    // Road layer (redrawn each frame for pseudo-3D)
    this.roadGraphics = this.add.graphics();

    // Create particle textures
    this.createParticleTextures();

    // Particle emitters
    this.coinEmitter = this.add.particles(0, 0, 'sparkTex', {
      speed: { min: 50, max: 150 },
      scale: { start: 1, end: 0 },
      lifespan: 400,
      tint: PAL.coin,
      emitting: false,
    });

    this.dustEmitter = this.add.particles(0, 0, 'dustTex', {
      speed: { min: 10, max: 40 },
      scale: { start: 0.8, end: 0 },
      lifespan: 600,
      alpha: { start: 0.5, end: 0 },
      tint: 0xccccaa,
      emitting: false,
    });

    this.sparkEmitter = this.add.particles(0, 0, 'sparkTex', {
      speed: { min: 80, max: 200 },
      scale: { start: 1.2, end: 0 },
      lifespan: 500,
      emitting: false,
    });

    // Player
    this.playerContainer = this.add.container(W / 2, H * GROUND_Y);
    this.playerBody = this.add.graphics();
    this.playerContainer.add(this.playerBody);
    this.drawPlayer();

    // HUD
    this.scoreText = this.add.text(W / 2, 20, '0', {
      fontSize: '28px', fontFamily: 'Nunito, sans-serif', color: '#ffffff',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5, 0).setDepth(100);

    this.livesText = this.add.text(W - 15, 15, '❤️❤️❤️', {
      fontSize: '20px',
    }).setOrigin(1, 0).setDepth(100);

    this.streakText = this.add.text(W / 2, 52, '', {
      fontSize: '16px', fontFamily: 'Nunito, sans-serif', color: '#fbbf24',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5, 0).setDepth(100);

    // Generate initial objects
    this.generateObjects(0, 2000);

    // Touch/swipe input
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      this.swipeStartX = p.x;
      this.swipeStartY = p.y;
      this.swipeStartTime = p.time;
    });

    this.input.on('pointerup', (p: Phaser.Input.Pointer) => {
      const dx = p.x - this.swipeStartX;
      const dy = p.y - this.swipeStartY;
      const dt = p.time - this.swipeStartTime;
      if (dt > 500) return; // too slow

      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (absDx > 30 && absDx > absDy) {
        // Horizontal swipe — change lane
        if (dx > 0 && this.targetLane < 2) this.targetLane++;
        else if (dx < 0 && this.targetLane > 0) this.targetLane--;
      } else if (absDy > 30 && absDy > absDx) {
        if (dy < 0 && !this.isJumping) {
          // Swipe up — jump
          this.isJumping = true;
          this.jumpVelocity = -12;
        } else if (dy > 0 && !this.isSliding) {
          // Swipe down — slide
          this.isSliding = true;
          this.time.delayedCall(500, () => { this.isSliding = false; });
        }
      } else if (absDx < 10 && absDy < 10) {
        // Tap — jump (simpler for young kids)
        if (!this.isJumping) {
          this.isJumping = true;
          this.jumpVelocity = -12;
        }
      }
    });

    // Keyboard fallback
    this.input.keyboard!.on('keydown-LEFT', () => { if (this.targetLane > 0) this.targetLane--; });
    this.input.keyboard!.on('keydown-RIGHT', () => { if (this.targetLane < 2) this.targetLane++; });
    this.input.keyboard!.on('keydown-UP', () => {
      if (!this.isJumping) { this.isJumping = true; this.jumpVelocity = -12; }
    });
    this.input.keyboard!.on('keydown-DOWN', () => {
      if (!this.isSliding) { this.isSliding = true; this.time.delayedCall(500, () => { this.isSliding = false; }); }
    });
    this.input.keyboard!.on('keydown-SPACE', () => {
      if (!this.isJumping) { this.isJumping = true; this.jumpVelocity = -12; }
    });

    // Handle resize
    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      const rW = gameSize.width;
      this.scoreText.setPosition(rW / 2, 20);
      this.livesText.setPosition(rW - 15, 15);
      this.streakText.setPosition(rW / 2, 52);
    });
  }

  private createParticleTextures() {
    // Spark texture
    const sparkG = this.add.graphics();
    sparkG.fillStyle(0xffffff);
    sparkG.fillCircle(4, 4, 4);
    sparkG.generateTexture('sparkTex', 8, 8);
    sparkG.destroy();

    // Dust texture
    const dustG = this.add.graphics();
    dustG.fillStyle(0xffffff, 0.6);
    dustG.fillCircle(6, 6, 6);
    dustG.generateTexture('dustTex', 12, 12);
    dustG.destroy();
  }

  update(_time: number, delta: number) {
    if (this.gameOver) return;

    const { width: W, height: H } = this.scale;
    const dt = delta / 16.67; // normalize to 60fps

    // Speed increases over time
    this.speed = 3 + this.distance * 0.0003;
    this.distance += this.speed * dt;

    // Smooth lane transition
    const targetX = LANE_POSITIONS[this.targetLane];
    this.playerX += (targetX - this.playerX) * 0.15 * dt;
    this.lane = this.targetLane;

    // Jump physics
    if (this.isJumping) {
      this.jumpVelocity += 0.6 * dt; // gravity
      this.playerYOffset += this.jumpVelocity * dt;
      if (this.playerYOffset >= 0) {
        this.playerYOffset = 0;
        this.isJumping = false;
        this.jumpVelocity = 0;
        // Landing dust
        this.dustEmitter.setPosition(W / 2 + this.playerX, H * GROUND_Y);
        this.dustEmitter.explode(5);
      }
    }

    // Run animation
    this.frameTimer += delta;
    if (this.frameTimer > 100) {
      this.runFrame = (this.runFrame + 1) % 4;
      this.frameTimer = 0;
    }

    // Parallax scroll
    this.mountainOffset += this.speed * 0.1 * dt;
    this.hillOffset += this.speed * 0.3 * dt;

    // Move objects toward player
    const moveSpeed = this.speed * 4 * dt;

    // Check coins
    for (const coin of this.coins) {
      coin.z -= moveSpeed;
      if (!coin.collected && coin.z < 50 && coin.z > -20 && coin.lane === this.lane && !this.isJumping) {
        coin.collected = true;
        this.score += 5;
        this.callbacks.onCoinCollect();
        this.coinEmitter.setPosition(W / 2 + this.playerX, H * GROUND_Y - 30);
        this.coinEmitter.explode(8);
      }
    }

    // Check obstacles
    for (const obs of this.obstacles) {
      obs.z -= moveSpeed;
      if (!obs.hit && obs.z < 40 && obs.z > -10 && obs.lane === this.lane) {
        if (this.isJumping && this.playerYOffset < -40) continue; // jumped over
        if (this.isSliding && obs.type === 'high') continue; // slid under
        obs.hit = true;
        if (!this.invincible) {
          this.loseLife();
        }
      }
    }

    // Check word gates
    for (const gate of this.wordGates) {
      gate.z -= moveSpeed;
      if (!gate.passed && gate.z < 40 && gate.z > -10) {
        gate.passed = true;
        this.wordsTotal++;
        const chosen = gate.options.find(o => o.lane === this.lane);
        if (chosen?.correct) {
          this.wordsCorrect++;
          this.streak++;
          if (this.streak > this.bestStreak) this.bestStreak = this.streak;
          this.score += 10 + this.streak * 2;
          this.callbacks.onCorrectWord(this.streak);
          this.sparkEmitter.setParticleTint(0x22c55e);
          this.sparkEmitter.setPosition(W / 2 + this.playerX, H * GROUND_Y - 20);
          this.sparkEmitter.explode(12);
          this.cameras.main.shake(100, 0.005);
        } else {
          this.streak = 0;
          this.callbacks.onWrongWord();
          this.sparkEmitter.setParticleTint(0xef4444);
          this.sparkEmitter.setPosition(W / 2 + this.playerX, H * GROUND_Y - 20);
          this.sparkEmitter.explode(8);
          this.cameras.main.shake(200, 0.01);
        }
      }
    }

    // Clean up passed objects and generate new ones
    this.coins = this.coins.filter(c => c.z > -100);
    this.obstacles = this.obstacles.filter(o => o.z > -100);
    this.wordGates = this.wordGates.filter(g => g.z > -200);

    const maxZ = Math.max(
      ...this.coins.map(c => c.z),
      ...this.obstacles.map(o => o.z),
      ...this.wordGates.map(g => g.z),
      500,
    );
    if (maxZ < 1500) {
      this.generateObjects(maxZ, maxZ + 1000);
    }

    // Draw everything
    this.drawBackground(W, H);
    this.drawRoad(W, H);
    this.drawPlayer();

    // Update player position
    this.playerContainer.setPosition(W / 2 + this.playerX, H * GROUND_Y + this.playerYOffset);

    // Update HUD
    this.scoreText.setText(String(this.score));
    const hearts = '❤️'.repeat(this.lives) + '🖤'.repeat(3 - this.lives);
    this.livesText.setText(hearts);
    this.streakText.setText(this.streak >= 2 ? `🔥 ${this.streak} streak!` : '');
  }

  private loseLife() {
    this.lives--;
    this.callbacks.onLifeLost(this.lives);
    this.cameras.main.shake(300, 0.015);

    // Brief invincibility
    this.invincible = true;
    this.tweens.add({
      targets: this.playerContainer,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        this.playerContainer.setAlpha(1);
        this.invincible = false;
      },
    });

    if (this.lives <= 0) {
      this.gameOver = true;
      this.cameras.main.flash(500, 200, 50, 50);
      this.time.delayedCall(800, () => {
        this.callbacks.onGameOver(this.score, this.wordsCorrect, this.wordsTotal, this.bestStreak);
      });
    }
  }

  private generateObjects(fromZ: number, toZ: number) {
    // Coins — clusters of 3
    for (let z = fromZ + 100; z < toZ; z += 200 + Math.random() * 150) {
      const coinLane = Math.floor(Math.random() * 3);
      for (let i = 0; i < 3; i++) {
        this.coins.push({ lane: coinLane, z: z + i * 40, collected: false });
      }
    }

    // Obstacles
    for (let z = fromZ + 250; z < toZ; z += 300 + Math.random() * 200) {
      const obsLane = Math.floor(Math.random() * 3);
      const type = Math.random() > 0.5 ? 'low' : 'high';
      this.obstacles.push({ lane: obsLane, z, hit: false, type });
    }

    // Word gates — one per ~500 distance
    for (let z = fromZ + 400; z < toZ; z += 500) {
      if (this.wordIdx >= this.words.length) continue;
      const w = this.words[this.wordIdx];
      this.wordIdx++;

      // Place correct answer in a random lane
      const correctLane = Math.floor(Math.random() * 3);
      const options: Array<{ lane: number; text: string; correct: boolean }> = [];
      const wrongWords = [...w.confusions].sort(() => Math.random() - 0.5).slice(0, 2);

      for (let l = 0; l < 3; l++) {
        if (l === correctLane) {
          options.push({ lane: l, text: w.word, correct: true });
        } else {
          options.push({ lane: l, text: wrongWords.pop() || 'wrong', correct: false });
        }
      }

      this.wordGates.push({ z, options, passed: false });
    }
  }

  // ============================================================
  // DRAWING
  // ============================================================

  private drawBackground(W: number, H: number) {
    const g = this.bgGraphics;
    g.clear();

    const groundY = H * GROUND_Y;

    // Sky gradient
    for (let i = 0; i < 20; i++) {
      const t = i / 20;
      const r = Phaser.Math.Linear(0x7f, 0xc4, t);
      const gr = Phaser.Math.Linear(0xb5, 0xdc, t);
      const b = Phaser.Math.Linear(0xd4, 0xe8, t);
      g.fillStyle(Phaser.Display.Color.GetColor(r, gr, b));
      g.fillRect(0, i * (groundY / 20), W, groundY / 20 + 1);
    }

    // Mountains (parallax slow)
    g.fillStyle(PAL.mountain, 0.6);
    g.beginPath();
    g.moveTo(0, groundY * 0.55);
    for (let x = 0; x <= W; x += 5) {
      const y = groundY * 0.55 - Math.sin((x + this.mountainOffset) * 0.004) * 60 - Math.sin((x + this.mountainOffset) * 0.009) * 30;
      g.lineTo(x, y);
    }
    g.lineTo(W, groundY);
    g.lineTo(0, groundY);
    g.closePath();
    g.fillPath();

    // Snow caps
    g.fillStyle(PAL.mountainSnow, 0.4);
    for (let i = 0; i < 4; i++) {
      const peakX = ((i * W / 3.5 + this.mountainOffset * 0.15) % (W + 200)) - 100;
      const peakY = groundY * 0.35 + Math.sin(i * 1.7) * 20;
      g.fillTriangle(peakX, peakY, peakX - 25, peakY + 15, peakX + 25, peakY + 15);
    }

    // Hills (parallax medium)
    g.fillStyle(PAL.hill, 0.7);
    g.beginPath();
    g.moveTo(0, groundY * 0.7);
    for (let x = 0; x <= W; x += 5) {
      const y = groundY * 0.7 - Math.sin((x + this.hillOffset) * 0.006) * 35 - Math.sin((x + this.hillOffset) * 0.015) * 15;
      g.lineTo(x, y);
    }
    g.lineTo(W, groundY);
    g.lineTo(0, groundY);
    g.closePath();
    g.fillPath();

    // Lighter hills in front
    g.fillStyle(PAL.hillLight, 0.5);
    g.beginPath();
    g.moveTo(0, groundY * 0.8);
    for (let x = 0; x <= W; x += 5) {
      const y = groundY * 0.8 - Math.sin((x + this.hillOffset * 1.5) * 0.008) * 25;
      g.lineTo(x, y);
    }
    g.lineTo(W, groundY);
    g.lineTo(0, groundY);
    g.closePath();
    g.fillPath();

    // Grass
    g.fillStyle(PAL.grass);
    g.fillRect(0, groundY, W, H - groundY);
  }

  private drawRoad(W: number, H: number) {
    const g = this.roadGraphics;
    g.clear();

    const groundY = H * GROUND_Y;
    const cx = W / 2;
    const horizon = groundY * 0.65;
    const roadTopW = 40;
    const roadBotW = ROAD_WIDTH;

    // Road surface (trapezoid)
    g.fillStyle(PAL.road);
    g.beginPath();
    g.moveTo(cx - roadTopW / 2, horizon);
    g.lineTo(cx + roadTopW / 2, horizon);
    g.lineTo(cx + roadBotW / 2, groundY);
    g.lineTo(cx - roadBotW / 2, groundY);
    g.closePath();
    g.fillPath();

    // Road edges
    g.lineStyle(2, PAL.roadEdge);
    g.lineBetween(cx - roadTopW / 2, horizon, cx - roadBotW / 2, groundY);
    g.lineBetween(cx + roadTopW / 2, horizon, cx + roadBotW / 2, groundY);

    // Lane markers (perspective)
    for (let i = 0; i < 15; i++) {
      const t = i / 15;
      const y = horizon + (groundY - horizon) * t;
      const w = roadTopW + (roadBotW - roadTopW) * t;
      const segLen = (groundY - horizon) / 15;

      // Dashed center lines
      if (i % 2 === 0) {
        g.lineStyle(2, PAL.roadLine, 0.5);
        g.lineBetween(cx - w / 6, y, cx - w / 6, y + segLen);
        g.lineBetween(cx + w / 6, y, cx + w / 6, y + segLen);
      }
    }

    // Draw objects on road (back to front for proper z-ordering)
    const allObjects: Array<{ z: number; draw: (perspective: number, screenY: number, roadW: number) => void }> = [];

    // Coins
    for (const coin of this.coins) {
      if (coin.collected || coin.z < 0 || coin.z > 1000) continue;
      allObjects.push({
        z: coin.z,
        draw: (p, sy, _rw) => {
          const laneX = cx + LANE_POSITIONS[coin.lane] * p;
          const size = 8 * p;
          g.fillStyle(PAL.coin);
          g.fillCircle(laneX, sy - 15 * p, size);
          g.fillStyle(PAL.coinShine, 0.6);
          g.fillCircle(laneX - 2 * p, sy - 17 * p, size * 0.5);
        },
      });
    }

    // Obstacles
    for (const obs of this.obstacles) {
      if (obs.hit || obs.z < 0 || obs.z > 1000) continue;
      allObjects.push({
        z: obs.z,
        draw: (p, sy, _rw) => {
          const laneX = cx + LANE_POSITIONS[obs.lane] * p;
          const w = 30 * p;
          const h = obs.type === 'high' ? 40 * p : 20 * p;
          const baseY = obs.type === 'high' ? sy - 30 * p : sy;
          // Barrel / fence
          g.fillStyle(PAL.obstacle);
          g.fillRoundedRect(laneX - w / 2, baseY - h, w, h, 3 * p);
          g.fillStyle(PAL.obstacleTop, 0.7);
          g.fillRect(laneX - w / 2, baseY - h, w, 3 * p);
        },
      });
    }

    // Word gates
    for (const gate of this.wordGates) {
      if (gate.passed || gate.z < 0 || gate.z > 1200) continue;
      allObjects.push({
        z: gate.z,
        draw: (p, sy, _rw) => {
          // Draw 3 lane signs
          for (const opt of gate.options) {
            const laneX = cx + LANE_POSITIONS[opt.lane] * p;
            const signW = 70 * p;
            const signH = 28 * p;
            const signY = sy - 35 * p;

            // Sign background
            g.fillStyle(PAL.gateNeutral, 0.9);
            g.fillRoundedRect(laneX - signW / 2, signY - signH / 2, signW, signH, 5 * p);

            // Sign border
            g.lineStyle(2 * p, 0xffffff, 0.5);
            g.strokeRoundedRect(laneX - signW / 2, signY - signH / 2, signW, signH, 5 * p);
          }

          // Text drawn via Phaser text objects (expensive, so we use a simple approach)
          // For each gate, show text only when close enough
          if (gate.z < 400) {
            for (const opt of gate.options) {
              const laneX = cx + LANE_POSITIONS[opt.lane] * p;
              const signY = sy - 35 * p;
              const fontSize = Math.max(10, Math.round(16 * p));

              // Use existing text or create temporary
              const txt = this.add.text(laneX, signY, opt.text, {
                fontSize: `${fontSize}px`,
                fontFamily: 'Nunito, sans-serif',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2,
              }).setOrigin(0.5).setDepth(50);

              // Auto-destroy after frame
              this.time.delayedCall(20, () => txt.destroy());
            }
          }
        },
      });
    }

    // Sort by z (far to near) and draw
    allObjects.sort((a, b) => b.z - a.z);
    for (const obj of allObjects) {
      const t = 1 - Math.min(obj.z / 1000, 1);
      const perspective = 0.1 + t * 0.9;
      const screenY = horizon + (groundY - horizon) * t;
      const rw = roadTopW + (roadBotW - roadTopW) * t;
      obj.draw(perspective, screenY, rw);
    }
  }

  private drawPlayer() {
    const g = this.playerBody;
    g.clear();

    const scale = this.isSliding ? 0.6 : 1;
    const squash = this.isSliding ? 1.4 : 1;

    // Shadow
    g.fillStyle(0x000000, 0.2);
    g.fillEllipse(0, 5, 30 * squash, 8);

    // Body
    g.fillStyle(PAL.player);
    g.fillRoundedRect(-12 * squash, -45 * scale, 24 * squash, 35 * scale, 6);

    // Head
    g.fillStyle(PAL.playerHighlight);
    g.fillCircle(0, -50 * scale, 12);

    // Eyes
    g.fillStyle(0xffffff);
    g.fillCircle(-4, -52 * scale, 4);
    g.fillCircle(4, -52 * scale, 4);
    g.fillStyle(0x111111);
    g.fillCircle(-3, -52 * scale, 2);
    g.fillCircle(5, -52 * scale, 2);

    // Legs (animated)
    const legOffset = this.isJumping ? -8 : Math.sin(this.runFrame * Math.PI / 2) * 8;
    g.fillStyle(PAL.playerShoe);
    if (!this.isSliding) {
      g.fillRoundedRect(-10, -10 + legOffset, 8, 14, 3);
      g.fillRoundedRect(2, -10 - legOffset, 8, 14, 3);
    }

    // Arms
    const armSwing = this.isJumping ? -15 : Math.sin(this.runFrame * Math.PI / 2) * 12;
    g.fillStyle(PAL.player);
    g.fillRoundedRect(-18, -40 * scale - armSwing, 6, 18, 3);
    g.fillRoundedRect(12, -40 * scale + armSwing, 6, 18, 3);
  }
}
