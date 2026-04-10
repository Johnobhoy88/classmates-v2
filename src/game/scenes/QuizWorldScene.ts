/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 *
 * QUIZ WORLD SCENE — Phaser 3 reactive background for all quiz games
 * Three themes: Forest (literacy), Cosmos (numeracy), Earth (geography)
 * Full engine power: particle emitters, tweens, camera effects, animated mascots
 */

import Phaser from 'phaser';

export type QuizTheme = 'forest' | 'cosmos' | 'earth';

// ==================== THEME PALETTES ====================

const PALETTES = {
  forest: {
    skyTop: 0x081820, skyMid: 0x0c2a1a, skyBot: 0x0f3522, ground: 0x071510,
    accent: 0x2ecc71, ambient: 0xaaff5a, mountDark: 0x091f14, mountLight: 0x0d2a18,
    treeDark: 0x091e12, treeLight: 0x0c2a1a, trunk: 0x1a0e08,
  },
  cosmos: {
    skyTop: 0x050510, skyMid: 0x0a0820, skyBot: 0x0c0628, ground: 0x060412,
    accent: 0x74b9ff, ambient: 0xffffff, nebula1: 0x6c5ce7, nebula2: 0xfd79a8,
    planetBody: 0x4a69bd, planetRing: 0x778beb,
  },
  earth: {
    skyTop: 0x0a1535, skyMid: 0x12254a, skyBot: 0x1a3560, ground: 0x0d2818,
    accent: 0x55efc4, ambient: 0x80ffb0, hillDark: 0x0a2218, hillLight: 0x0d2a20,
    aurora1: 0x55efc4, aurora2: 0x74b9ff, aurora3: 0xa29bfe,
  },
};

const BURST_COLORS = [0x2ecc71, 0xf1c40f, 0x3498db, 0xe74c3c, 0x9b59b6, 0x1abc9c];

export class QuizWorldScene extends Phaser.Scene {
  private theme!: QuizTheme;
  private mascot!: Phaser.GameObjects.Container;
  private burstEmitters: Phaser.GameObjects.Particles.ParticleEmitter[] = [];
  private bgGraphics!: Phaser.GameObjects.Graphics;
  private sceneryContainer!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'QuizWorld' });
  }

  init(data: { theme: QuizTheme }) {
    this.theme = data.theme || 'forest';
  }

  create() {
    const { width: W, height: H } = this.scale;

    // Generate particle textures
    this.generateTextures();

    // Background
    this.bgGraphics = this.add.graphics();
    this.drawBackground(W, H);

    // Scenery container (theme-specific elements)
    this.sceneryContainer = this.add.container(0, 0);
    this.drawScenery(W, H);

    // Ambient particles
    this.createAmbientParticles(W, H);

    // Burst particles (one per color)
    this.createBurstParticles(W, H);

    // Mascot character
    this.mascot = this.createMascot(W, H);
    this.add.existing(this.mascot);
    this.startIdleAnimation();

    // Handle resize
    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      const nW = gameSize.width;
      const nH = gameSize.height;
      this.bgGraphics.clear();
      this.drawBackground(nW, nH);
      this.sceneryContainer.removeAll(true);
      this.drawScenery(nW, nH);
      // Keep mascot grounded in its environment on resize
      if (this.theme === 'forest') {
        this.mascot.setPosition(nW * 0.88, nH * 0.58);
      } else if (this.theme === 'cosmos') {
        this.mascot.setPosition(nW * 0.85, nH * 0.68);
      } else {
        this.mascot.setPosition(nW * 0.85, nH * 0.6);
      }
    });
  }

  // ==================== TEXTURES ====================

  private generateTextures() {
    // Small circle for ambient particles
    if (!this.textures.exists('dot')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xffffff);
      g.fillCircle(4, 4, 4);
      g.generateTexture('dot', 8, 8);
      g.destroy();
    }

    // Confetti rectangles for burst
    BURST_COLORS.forEach((col, i) => {
      const key = `confetti_${i}`;
      if (!this.textures.exists(key)) {
        const g = this.make.graphics({ x: 0, y: 0 });
        g.fillStyle(col);
        g.fillRect(0, 0, 6, 8);
        g.generateTexture(key, 6, 8);
        g.destroy();
      }
    });

    // Star shape for cosmos
    if (!this.textures.exists('star4')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xffffff);
      g.fillCircle(3, 3, 1.5);
      g.fillRect(0, 2.5, 6, 1);
      g.fillRect(2.5, 0, 1, 6);
      g.generateTexture('star4', 6, 6);
      g.destroy();
    }
  }

  // ==================== BACKGROUND ====================

  private drawBackground(W: number, H: number) {
    const p = PALETTES[this.theme];
    const g = this.bgGraphics;

    if (this.theme === 'forest') {
      const pal = p as typeof PALETTES.forest;
      g.fillGradientStyle(pal.skyTop, pal.skyTop, pal.skyMid, pal.skyMid);
      g.fillRect(0, 0, W, H * 0.5);
      g.fillGradientStyle(pal.skyMid, pal.skyMid, pal.skyBot, pal.skyBot);
      g.fillRect(0, H * 0.5, W, H * 0.3);
      g.fillGradientStyle(pal.skyBot, pal.skyBot, pal.ground, pal.ground);
      g.fillRect(0, H * 0.8, W, H * 0.2);
    } else if (this.theme === 'cosmos') {
      const pal = p as typeof PALETTES.cosmos;
      g.fillGradientStyle(pal.skyTop, pal.skyTop, pal.skyMid, pal.skyMid);
      g.fillRect(0, 0, W, H * 0.45);
      g.fillGradientStyle(pal.skyMid, pal.skyMid, pal.skyBot, pal.skyBot);
      g.fillRect(0, H * 0.45, W, H * 0.35);
      g.fillGradientStyle(pal.skyBot, pal.skyBot, pal.ground, pal.ground);
      g.fillRect(0, H * 0.8, W, H * 0.2);
    } else {
      const pal = p as typeof PALETTES.earth;
      g.fillGradientStyle(pal.skyTop, pal.skyTop, pal.skyMid, pal.skyMid);
      g.fillRect(0, 0, W, H * 0.4);
      g.fillGradientStyle(pal.skyMid, pal.skyMid, pal.skyBot, pal.skyBot);
      g.fillRect(0, H * 0.4, W, H * 0.3);
      g.fillGradientStyle(pal.skyBot, pal.skyBot, pal.ground, pal.ground);
      g.fillRect(0, H * 0.7, W, H * 0.3);
    }
  }

  // ==================== SCENERY ====================

  private drawScenery(W: number, H: number) {
    const g = this.add.graphics();
    this.sceneryContainer.add(g);

    if (this.theme === 'forest') {
      this.drawForestScenery(g, W, H);
    } else if (this.theme === 'cosmos') {
      this.drawCosmosScenery(g, W, H);
    } else {
      this.drawEarthScenery(g, W, H);
    }
  }

  private drawForestScenery(g: Phaser.GameObjects.Graphics, W: number, H: number) {
    const pal = PALETTES.forest;

    // Stars in sky
    g.fillStyle(0xffffff);
    for (let i = 0; i < 40; i++) {
      const sx = (i * 137.5 + 23) % W;
      const sy = (i * 91.3 + 17) % (H * 0.35);
      g.fillCircle(sx, sy, 0.5 + (i % 3) * 0.3);
    }

    // Mountain silhouette
    g.fillStyle(pal.mountDark);
    g.beginPath();
    g.moveTo(0, H * 0.52);
    for (let x = 0; x <= W; x += 25) {
      g.lineTo(x, H * 0.52 - Math.sin(x * 0.007 + 1) * 45 - Math.sin(x * 0.018) * 20);
    }
    g.lineTo(W, H); g.lineTo(0, H); g.closePath(); g.fillPath();

    // Background trees
    for (let i = 0; i < 12; i++) {
      const tx = (i * W / 10) + Phaser.Math.Between(-20, 20);
      this.drawPineTree(g, tx, H * 0.63, 70 + (i % 3) * 25, 22 + (i % 2) * 8, pal.treeLight, 0.7);
    }

    // Ground
    g.fillStyle(pal.mountLight);
    g.fillRect(0, H * 0.74, W, H * 0.26);

    // Foreground trees
    for (let i = 0; i < 8; i++) {
      const tx = (i * W / 7) + Phaser.Math.Between(-15, 15);
      this.drawPineTree(g, tx, H * 0.83, 110 + (i % 3) * 35, 28 + (i % 2) * 12, pal.treeDark, 1);
    }

    // Mist (semi-transparent ellipses)
    g.fillStyle(pal.accent, 0.03);
    for (let i = 0; i < 5; i++) {
      g.fillEllipse(W * 0.2 * i + 50, H * 0.76, 200, 25);
    }
  }

  private drawCosmosScenery(g: Phaser.GameObjects.Graphics, W: number, H: number) {
    const pal = PALETTES.cosmos;

    // Stars (many small)
    for (let i = 0; i < 80; i++) {
      const sx = (i * 127 + 31) % W;
      const sy = (i * 89 + 13) % H;
      const r = 0.4 + (i % 5) * 0.25;
      g.fillStyle(0xffffff, 0.3 + (i % 3) * 0.15);
      g.fillCircle(sx, sy, r);
    }

    // Nebula blobs
    const nebX = [W * 0.2, W * 0.7, W * 0.4];
    const nebY = [H * 0.2, H * 0.35, H * 0.6];
    const nebHue = [pal.nebula1, pal.nebula2, pal.accent];
    for (let i = 0; i < 3; i++) {
      g.fillStyle(nebHue[i], 0.04);
      g.fillEllipse(nebX[i], nebY[i], 160 + i * 30, 100 + i * 15);
      g.fillStyle(nebHue[i], 0.025);
      g.fillEllipse(nebX[i] + 20, nebY[i] - 10, 200 + i * 20, 120 + i * 10);
    }

    // Planet
    g.fillStyle(pal.planetBody, 0.5);
    g.fillCircle(W * 0.18, H * 0.22, 28);
    // Planet shadow
    g.fillStyle(0x000000, 0.3);
    g.fillCircle(W * 0.18 + 8, H * 0.22 + 4, 28);
    // Planet ring
    g.lineStyle(2, pal.planetRing, 0.25);
    g.strokeEllipse(W * 0.18, H * 0.22, 70, 16);

    // Subtle grid lines (space grid)
    g.lineStyle(1, 0x6c5ce7, 0.03);
    for (let y = 0; y < H; y += 60) g.lineBetween(0, y, W, y);
    for (let x = 0; x < W; x += 60) g.lineBetween(x, 0, x, H);
  }

  private drawEarthScenery(g: Phaser.GameObjects.Graphics, W: number, H: number) {
    const pal = PALETTES.earth;

    // Stars
    g.fillStyle(0xffffff);
    for (let i = 0; i < 30; i++) {
      g.fillStyle(0xffffff, 0.2 + (i % 3) * 0.1);
      g.fillCircle((i * 131 + 19) % W, (i * 79 + 11) % (H * 0.35), 0.6);
    }

    // Aurora bands
    for (let band = 0; band < 3; band++) {
      const color = [pal.aurora1, pal.aurora2, pal.aurora3][band];
      g.lineStyle(12 + band * 4, color, 0.04);
      g.beginPath();
      for (let x = 0; x <= W; x += 15) {
        const y = H * 0.15 + band * 18 + Math.sin(x * 0.006 + band * 1.5) * 25;
        x === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
      }
      g.strokePath();
    }

    // Back hills
    g.fillStyle(pal.hillDark);
    g.beginPath(); g.moveTo(0, H * 0.65);
    for (let x = 0; x <= W; x += 20) {
      g.lineTo(x, H * 0.65 - Math.sin(x * 0.005 + 2) * 50 - Math.sin(x * 0.013) * 25);
    }
    g.lineTo(W, H); g.lineTo(0, H); g.closePath(); g.fillPath();

    // Front hills
    g.fillStyle(pal.hillLight);
    g.beginPath(); g.moveTo(0, H * 0.75);
    for (let x = 0; x <= W; x += 20) {
      g.lineTo(x, H * 0.75 - Math.sin(x * 0.008 + 0.5) * 35 - Math.sin(x * 0.02) * 15);
    }
    g.lineTo(W, H); g.lineTo(0, H); g.closePath(); g.fillPath();

    // Ground
    g.fillGradientStyle(pal.ground, pal.ground, 0x050f0a, 0x050f0a);
    g.fillRect(0, H * 0.82, W, H * 0.18);
  }

  private drawPineTree(g: Phaser.GameObjects.Graphics, x: number, groundY: number, h: number, w: number, color: number, alpha: number) {
    // Trunk
    g.fillStyle(PALETTES.forest.trunk, alpha);
    g.fillRect(x - 2.5, groundY - h * 0.25, 5, h * 0.25);
    // Foliage layers
    g.fillStyle(color, alpha);
    for (let i = 0; i < 4; i++) {
      const ly = groundY - h * 0.25 - (h * 0.75 * i / 4);
      const lw = w * (1 - i * 0.18);
      g.fillTriangle(x, ly - h * 0.75 / 4, x - lw / 2, ly, x + lw / 2, ly);
    }
  }

  // ==================== AMBIENT PARTICLES ====================

  private createAmbientParticles(W: number, H: number) {
    const pal = PALETTES[this.theme];

    if (this.theme === 'forest') {
      // Fireflies — gentle floating glow
      /* ambient emitter runs autonomously */ this.add.particles(0, 0, 'dot', {
        x: { min: 0, max: W },
        y: { min: H * 0.15, max: H * 0.75 },
        quantity: 1,
        frequency: 400,
        lifespan: { min: 3000, max: 6000 },
        scale: { start: 0.3, end: 0.8, ease: 'Sine.easeInOut' },
        alpha: { start: 0, end: 0.7, ease: 'Sine.easeInOut' },
        tint: (pal as typeof PALETTES.forest).ambient,
        blendMode: Phaser.BlendModes.ADD,
        speedX: { min: -8, max: 8 },
        speedY: { min: -12, max: -3 },
      });
    } else if (this.theme === 'cosmos') {
      // Twinkling stars
      /* ambient emitter runs autonomously */ this.add.particles(0, 0, 'star4', {
        x: { min: 0, max: W },
        y: { min: 0, max: H },
        quantity: 1,
        frequency: 300,
        lifespan: { min: 2000, max: 5000 },
        scale: { start: 0.2, end: 0.6, ease: 'Sine.easeInOut' },
        alpha: { start: 0, end: 0.5 },
        tint: [0xffffff, 0x74b9ff, 0xa29bfe, 0xffeaa7],
        blendMode: Phaser.BlendModes.ADD,
        speedX: { min: -3, max: 3 },
        speedY: { min: -2, max: 2 },
      });
    } else {
      // Aurora dust particles
      /* ambient emitter runs autonomously */ this.add.particles(0, 0, 'dot', {
        x: { min: 0, max: W },
        y: { min: H * 0.05, max: H * 0.4 },
        quantity: 1,
        frequency: 600,
        lifespan: { min: 4000, max: 8000 },
        scale: { start: 0.2, end: 0.5 },
        alpha: { start: 0, end: 0.35 },
        tint: [(pal as typeof PALETTES.earth).aurora1, (pal as typeof PALETTES.earth).aurora2, (pal as typeof PALETTES.earth).aurora3],
        blendMode: Phaser.BlendModes.ADD,
        speedX: { min: 5, max: 15 },
        speedY: { min: -5, max: 5 },
      });
    }
  }

  // ==================== BURST PARTICLES ====================

  private createBurstParticles(W: number, H: number) {
    // Create one emitter per confetti color — each can burst independently
    BURST_COLORS.forEach((_, i) => {
      const emitter = this.add.particles(W / 2, H / 2, `confetti_${i}`, {
        speed: { min: 80, max: 300 },
        angle: { min: 200, max: 340 },
        scale: { start: 1, end: 0.3 },
        alpha: { start: 1, end: 0 },
        rotate: { min: 0, max: 360 },
        lifespan: { min: 800, max: 1500 },
        gravityY: 200,
        emitting: false,
      });
      this.burstEmitters.push(emitter);
    });
  }

  // ==================== MASCOT ====================

  private createMascot(W: number, H: number): Phaser.GameObjects.Container {
    // Position each mascot where it makes sense in its environment:
    // Owl on a tree branch (forest), Robot near ground (cosmos), Fox on a hill (earth)
    let mx: number, my: number;
    if (this.theme === 'forest') {
      mx = W * 0.88; my = H * 0.58; // Perched at tree line level
    } else if (this.theme === 'cosmos') {
      mx = W * 0.85; my = H * 0.68; // Hovering near ground level
    } else {
      mx = W * 0.85; my = H * 0.6;  // Sitting on a hill
    }

    const container = this.add.container(mx, my);

    if (this.theme === 'forest') {
      this.buildOwl(container);
    } else if (this.theme === 'cosmos') {
      this.buildRobot(container);
    } else {
      this.buildFox(container);
    }

    container.setScale(0.9);
    return container;
  }

  private buildOwl(c: Phaser.GameObjects.Container) {
    const g = this.add.graphics();

    // Body (plump oval)
    g.fillStyle(0x5d4037);
    g.fillEllipse(0, 0, 40, 50);
    // Belly
    g.fillStyle(0x8d6e63);
    g.fillEllipse(0, 8, 26, 30);
    // Left wing
    g.fillStyle(0x4e342e);
    g.fillEllipse(-22, -2, 14, 28);
    // Right wing
    g.fillEllipse(22, -2, 14, 28);
    c.add(g);

    // Eyes (white circles with black pupils)
    const leftEye = this.add.graphics();
    leftEye.fillStyle(0xffffff); leftEye.fillCircle(-9, -14, 9);
    leftEye.fillStyle(0x1a1a1a); leftEye.fillCircle(-7, -14, 5);
    leftEye.fillStyle(0xffffff); leftEye.fillCircle(-6, -16, 2); // highlight
    c.add(leftEye);

    const rightEye = this.add.graphics();
    rightEye.fillStyle(0xffffff); rightEye.fillCircle(9, -14, 9);
    rightEye.fillStyle(0x1a1a1a); rightEye.fillCircle(11, -14, 5);
    rightEye.fillStyle(0xffffff); rightEye.fillCircle(12, -16, 2);
    c.add(rightEye);

    // Beak
    const beak = this.add.graphics();
    beak.fillStyle(0xff9800);
    beak.fillTriangle(0, -6, -4, -2, 4, -2);
    c.add(beak);

    // Ear tufts
    const tuftL = this.add.graphics();
    tuftL.fillStyle(0x5d4037);
    tuftL.fillTriangle(-14, -26, -8, -20, -18, -18);
    c.add(tuftL);
    const tuftR = this.add.graphics();
    tuftR.fillStyle(0x5d4037);
    tuftR.fillTriangle(14, -26, 8, -20, 18, -18);
    c.add(tuftR);

    // Feet
    g.fillStyle(0xff9800);
    g.fillCircle(-6, 26, 4); g.fillCircle(6, 26, 4);

    // Store refs for animation
    c.setData('leftEye', leftEye);
    c.setData('rightEye', rightEye);
    c.setData('wings', g);
  }

  private buildRobot(c: Phaser.GameObjects.Container) {
    const g = this.add.graphics();

    // Body
    g.fillStyle(0x636e72);
    g.fillRoundedRect(-18, -5, 36, 35, 6);
    // Chest plate
    g.fillStyle(0x74b9ff);
    g.fillRoundedRect(-10, 2, 20, 14, 3);
    // Chest glow
    g.fillStyle(0x0984e3, 0.6);
    g.fillCircle(0, 9, 4);

    // Head
    g.fillStyle(0x636e72);
    g.fillRoundedRect(-15, -28, 30, 25, 5);
    c.add(g);

    // Eyes (glowing)
    const leftEye = this.add.graphics();
    leftEye.fillStyle(0x55efc4); leftEye.fillCircle(-6, -18, 5);
    leftEye.fillStyle(0xffffff); leftEye.fillCircle(-5, -19, 2);
    c.add(leftEye);

    const rightEye = this.add.graphics();
    rightEye.fillStyle(0x55efc4); rightEye.fillCircle(6, -18, 5);
    rightEye.fillStyle(0xffffff); rightEye.fillCircle(7, -19, 2);
    c.add(rightEye);

    // Antenna
    const antenna = this.add.graphics();
    antenna.lineStyle(2, 0x636e72);
    antenna.lineBetween(0, -28, 0, -40);
    antenna.fillStyle(0xe74c3c);
    antenna.fillCircle(0, -42, 4);
    c.add(antenna);

    // Arms
    g.fillStyle(0x636e72);
    g.fillRoundedRect(-25, 0, 8, 20, 3);
    g.fillRoundedRect(17, 0, 8, 20, 3);

    // Legs
    g.fillStyle(0x636e72);
    g.fillRoundedRect(-12, 30, 10, 12, 3);
    g.fillRoundedRect(2, 30, 10, 12, 3);

    c.setData('leftEye', leftEye);
    c.setData('rightEye', rightEye);
    c.setData('antenna', antenna);
  }

  private buildFox(c: Phaser.GameObjects.Container) {
    const g = this.add.graphics();

    // Tail (behind body)
    const tail = this.add.graphics();
    tail.fillStyle(0xe67e22);
    tail.fillEllipse(22, 10, 28, 12);
    tail.fillStyle(0xffffff);
    tail.fillEllipse(32, 12, 10, 6);
    c.add(tail);

    // Body
    g.fillStyle(0xe67e22);
    g.fillEllipse(0, 5, 38, 30);
    // Belly
    g.fillStyle(0xffffff);
    g.fillEllipse(0, 12, 22, 16);
    c.add(g);

    // Head
    const head = this.add.graphics();
    head.fillStyle(0xe67e22);
    head.fillCircle(0, -18, 16);
    // Cheeks
    head.fillStyle(0xffffff);
    head.fillEllipse(-5, -10, 10, 8);
    head.fillEllipse(5, -10, 10, 8);
    c.add(head);

    // Ears
    const earL = this.add.graphics();
    earL.fillStyle(0xe67e22);
    earL.fillTriangle(-12, -30, -4, -22, -18, -22);
    earL.fillStyle(0xfab1a0);
    earL.fillTriangle(-12, -28, -6, -23, -16, -23);
    c.add(earL);
    const earR = this.add.graphics();
    earR.fillStyle(0xe67e22);
    earR.fillTriangle(12, -30, 4, -22, 18, -22);
    earR.fillStyle(0xfab1a0);
    earR.fillTriangle(12, -28, 6, -23, 16, -23);
    c.add(earR);

    // Eyes
    const leftEye = this.add.graphics();
    leftEye.fillStyle(0x1a1a1a); leftEye.fillCircle(-7, -20, 4);
    leftEye.fillStyle(0xffffff); leftEye.fillCircle(-6, -21, 1.5);
    c.add(leftEye);
    const rightEye = this.add.graphics();
    rightEye.fillStyle(0x1a1a1a); rightEye.fillCircle(7, -20, 4);
    rightEye.fillStyle(0xffffff); rightEye.fillCircle(8, -21, 1.5);
    c.add(rightEye);

    // Nose
    head.fillStyle(0x1a1a1a);
    head.fillCircle(0, -14, 3);

    // Feet
    g.fillStyle(0x5d4037);
    g.fillEllipse(-8, 22, 8, 5);
    g.fillEllipse(8, 22, 8, 5);

    c.setData('tail', tail);
    c.setData('leftEye', leftEye);
    c.setData('rightEye', rightEye);
    c.setData('earL', earL);
    c.setData('earR', earR);
  }

  // ==================== IDLE ANIMATION ====================

  private startIdleAnimation() {
    // Gentle bobbing (all mascots)
    this.tweens.add({
      targets: this.mascot,
      y: this.mascot.y - 5,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Periodic blink
    this.time.addEvent({
      delay: 3000,
      loop: true,
      callback: () => this.blinkMascot(),
    });

    // Theme-specific idle
    if (this.theme === 'cosmos') {
      // Antenna bob
      const antenna = this.mascot.getData('antenna') as Phaser.GameObjects.Graphics;
      if (antenna) {
        this.tweens.add({
          targets: antenna,
          angle: { from: -5, to: 5 },
          duration: 1200,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      }
    } else if (this.theme === 'earth') {
      // Tail sway
      const tail = this.mascot.getData('tail') as Phaser.GameObjects.Graphics;
      if (tail) {
        this.tweens.add({
          targets: tail,
          angle: { from: -8, to: 8 },
          duration: 1500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      }
    }
  }

  private blinkMascot() {
    const leftEye = this.mascot.getData('leftEye') as Phaser.GameObjects.Graphics;
    const rightEye = this.mascot.getData('rightEye') as Phaser.GameObjects.Graphics;
    if (!leftEye || !rightEye) return;

    this.tweens.add({
      targets: [leftEye, rightEye],
      scaleY: 0.1,
      duration: 80,
      yoyo: true,
      ease: 'Power2',
    });
  }

  // ==================== EVENT HANDLERS ====================

  handleEvent(event: string) {
    switch (event) {
      case 'correct': this.onCorrect(); break;
      case 'wrong': this.onWrong(); break;
      case 'wordComplete': this.onWordComplete(); break;
      case 'wordFailed': this.onWordFailed(); break;
      case 'gameComplete': this.onGameComplete(); break;
    }
  }

  private onCorrect() {
    const { width: W, height: H } = this.scale;

    // Confetti burst from center (no camera flash — save that for streaks/completion)
    this.burstEmitters.forEach(e => {
      e.setPosition(W / 2, H * 0.4);
      e.explode(4);
    });

    // Mascot celebrates — bounce up with scale pop
    this.tweens.add({
      targets: this.mascot,
      y: this.mascot.y - 15,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 150,
      yoyo: true,
      ease: 'Back.easeOut',
    });
  }

  private onWrong() {
    // Camera shake
    this.cameras.main.shake(250, 0.006);

    // Mascot sad — droop down, shrink slightly
    this.tweens.add({
      targets: this.mascot,
      y: this.mascot.y + 5,
      scaleX: 0.85,
      scaleY: 0.85,
      duration: 200,
      yoyo: true,
      ease: 'Power2',
    });
  }

  private onWordComplete() {
    const { width: W, height: H } = this.scale;

    // Celebration without camera flash (flash is reserved for game completion only)
    this.burstEmitters.forEach(e => {
      e.setPosition(W / 2, H * 0.35);
      e.explode(8);
    });

    // Mascot bigger bounce
    this.tweens.add({
      targets: this.mascot,
      y: this.mascot.y - 20,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 200,
      yoyo: true,
      ease: 'Back.easeOut',
    });
  }

  private onWordFailed() {
    // Gentle shake only — no camera flash (too distracting for kids)
    this.cameras.main.shake(300, 0.008);

    this.tweens.add({
      targets: this.mascot,
      y: this.mascot.y + 8,
      angle: { from: -3, to: 3 },
      duration: 100,
      yoyo: true,
      repeat: 2,
      ease: 'Sine.easeInOut',
    });
  }

  private onGameComplete() {
    const { width: W, height: H } = this.scale;

    // Grand flash
    this.cameras.main.flash(500, 255, 255, 200);

    // Massive confetti storm
    this.burstEmitters.forEach(e => {
      e.setPosition(W / 2, H * 0.3);
      e.explode(25);
    });
    // Second wave from sides
    this.time.delayedCall(200, () => {
      this.burstEmitters.forEach((e, i) => {
        e.setPosition(i % 2 === 0 ? W * 0.2 : W * 0.8, H * 0.3);
        e.explode(15);
      });
    });

    // Mascot big celebrate — spin and bounce
    this.tweens.add({
      targets: this.mascot,
      y: this.mascot.y - 30,
      scaleX: 1.3,
      scaleY: 1.3,
      angle: 360,
      duration: 600,
      yoyo: true,
      ease: 'Back.easeOut',
    });
  }
}
