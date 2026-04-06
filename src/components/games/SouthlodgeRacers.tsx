import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { sfxCorrect, sfxWrong, sfxStreak, sfxLevelUp } from '../../game/systems/AudioSystem';
import { recordGameResult } from '../../game/systems/ProgressTracker';
import { useAuth } from '../auth/AuthProvider';
import { buildMissionWords, getDefaultPack, type WordEntry as PackWordEntry } from '../../game/content/racers-packs';

// ============================================================
// SOUTHLODGE RACERS — Faithful Three.js port from V1
// 3-lane spelling racer: steer into the correct word gate
// ============================================================

const LANE_X = [-6, 0, 6];
const COLORS = {
  sky: 0x92d4ee, road: 0x24313a, verge: 0x7f9f52,
  laneMarker: 0xffffff, poleDark: 0x17313f, signGold: 0xf3b53f,
  carBody: 0xed6a2c, carCab: 0xfff2d9, carBumper: 0x163545,
  treeTrunk: 0x6a4b2f, treeCrown: 0x2d6b45, mountain: 0x7088a1,
};

interface WordEntry {
  word: string;
  sentence: string;
  audioText: string;
  confusions: string[];
}

interface RacerSession {
  words: WordEntry[];
  wordIndex: number;
  completed: number;
  correct: number;
  streak: number;
  maxStreak: number;
  shields: number;
  speed: number;
  speedBoost: number;
  penalty: number;
  playerX: number;
  targetLane: number;
  running: boolean;
  missed: Array<{ w: string; h: string }>;
  distance: number;
}

// Simple word packs inline (full packs loaded from racers-packs.ts when available)
const FALLBACK_WORDS: WordEntry[] = [
  { word: 'cat', sentence: 'The cat sat on the mat.', audioText: 'Spell cat.', confusions: ['cot', 'cut'] },
  { word: 'dog', sentence: 'The dog ran fast.', audioText: 'Spell dog.', confusions: ['dig', 'dug'] },
  { word: 'sun', sentence: 'The sun is bright.', audioText: 'Spell sun.', confusions: ['sin', 'son'] },
  { word: 'hat', sentence: 'She wore a red hat.', audioText: 'Spell hat.', confusions: ['hit', 'hot'] },
  { word: 'bed', sentence: 'Time for bed.', audioText: 'Spell bed.', confusions: ['bad', 'bid'] },
  { word: 'cup', sentence: 'A cup of milk.', audioText: 'Spell cup.', confusions: ['cap', 'cop'] },
  { word: 'pig', sentence: 'The pig is pink.', audioText: 'Spell pig.', confusions: ['peg', 'pug'] },
];

function buildCar(): THREE.Group {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.9, 4.2),
    new THREE.MeshLambertMaterial({ color: COLORS.carBody, flatShading: true })
  );
  body.position.y = 0.65;
  g.add(body);
  const cab = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 0.7, 2.0),
    new THREE.MeshLambertMaterial({ color: COLORS.carCab, flatShading: true })
  );
  cab.position.set(0, 1.3, -0.4);
  g.add(cab);
  const bumper = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.3, 0.3),
    new THREE.MeshLambertMaterial({ color: COLORS.carBumper, flatShading: true })
  );
  bumper.position.set(0, 0.35, 2.1);
  g.add(bumper);
  return g;
}

function buildRoadSegment(): THREE.Group {
  const g = new THREE.Group();
  const road = new THREE.Mesh(
    new THREE.BoxGeometry(18, 0.2, 40),
    new THREE.MeshLambertMaterial({ color: COLORS.road, flatShading: true })
  );
  g.add(road);
  [-1, 1].forEach((side) => {
    const verge = new THREE.Mesh(
      new THREE.BoxGeometry(22, 0.1, 40),
      new THREE.MeshLambertMaterial({ color: COLORS.verge, flatShading: true })
    );
    verge.position.set(side * 17, -0.05, 0);
    g.add(verge);
  });
  [-3, 3].forEach((x) => {
    const marker = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.03, 4.4),
      new THREE.MeshLambertMaterial({ color: COLORS.laneMarker })
    );
    marker.position.set(x, 0.12, 0);
    g.add(marker);
  });
  return g;
}

function buildGate(entry: WordEntry): THREE.Group & { userData: { correctLane: number } } {
  const g = new THREE.Group() as THREE.Group & { userData: { correctLane: number } };
  const correctLane = Math.floor(Math.random() * 3);
  g.userData = { correctLane };

  for (let lane = 0; lane < 3; lane++) {
    const x = LANE_X[lane];
    const text = lane === correctLane ? entry.word : entry.confusions[lane > correctLane ? lane - 1 : lane] || '???';

    // Poles
    [-2.1, 2.1].forEach((px) => {
      const pole = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 5.2, 0.5),
        new THREE.MeshLambertMaterial({ color: COLORS.poleDark, flatShading: true })
      );
      pole.position.set(x + px, 2.6, 0);
      g.add(pole);
    });

    // Sign
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 110;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#f3b53f';
    ctx.fillRect(0, 0, 256, 110);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(6, 6, 244, 98);
    ctx.fillStyle = '#1a2a3a';
    ctx.font = 'bold 42px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 55);

    const tex = new THREE.CanvasTexture(canvas);
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(4.5, 2.0),
      new THREE.MeshBasicMaterial({ map: tex })
    );
    sign.position.set(x, 3.5, 0.26);
    g.add(sign);
  }

  return g;
}

function speakWord(text: string) {
  if (!window.speechSynthesis || !text) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.92; u.pitch = 1.02; u.lang = 'en-GB';
  window.speechSynthesis.speak(u);
}

export function SouthlodgeRacers({ onExit }: { onExit: () => void }) {
  const { pupil } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [result, setResult] = useState<{ correct: number; total: number; stars: number; maxStreak: number; missed: Array<{ w: string; h: string }> } | null>(null);
  const sessionRef = useRef<RacerSession | null>(null);
  const sceneRef = useRef<{ renderer: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.PerspectiveCamera; clock: THREE.Clock; car: THREE.Group; roadSegs: THREE.Group[]; trees: THREE.Group[]; gate: (THREE.Group & { userData: { correctLane: number } }) | null; frameId: number | null } | null>(null);

  const handleComplete = useCallback((session: RacerSession) => {
    const total = session.words.length;
    const pct = session.correct / total;
    const stars = pct >= 0.9 ? 3 : pct >= 0.65 ? 2 : pct >= 0.35 ? 1 : 0;
    if (stars >= 3) sfxLevelUp();
    if (pupil) {
      recordGameResult({ pupilId: pupil.id, gameId: 'hdash', score: Math.round(pct * 100), stars, streak: 0, bestStreak: session.maxStreak, correct: session.correct, total });
    }
    setResult({ correct: session.correct, total, stars, maxStreak: session.maxStreak, missed: session.missed });
  }, [pupil]);

  useEffect(() => {
    if (!containerRef.current || result) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setSize(width, height);
    renderer.setClearColor(COLORS.sky);
    container.appendChild(renderer.domElement);

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(COLORS.sky, 90, 280);

    // Camera
    const camera = new THREE.PerspectiveCamera(58, width / height, 0.5, 400);
    camera.position.set(0, 6.4, 68);
    camera.lookAt(0, 4, -30);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.72));
    const sun = new THREE.DirectionalLight(0xfff2d4, 1.05);
    sun.position.set(20, 35, 16);
    scene.add(sun);

    // Road segments
    const roadSegs: THREE.Group[] = [];
    for (let i = 0; i < 11; i++) {
      const seg = buildRoadSegment();
      seg.position.z = -i * 40 + 200;
      scene.add(seg);
      roadSegs.push(seg);
    }

    // Trees
    const trees: THREE.Group[] = [];
    for (let i = 0; i < 18; i++) {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 2.2, 6), new THREE.MeshLambertMaterial({ color: COLORS.treeTrunk, flatShading: true }));
      trunk.position.y = 1.1;
      tree.add(trunk);
      const crown = new THREE.Mesh(new THREE.ConeGeometry(1.6, 3.8, 6), new THREE.MeshLambertMaterial({ color: COLORS.treeCrown, flatShading: true }));
      crown.position.y = 3.6;
      tree.add(crown);
      const side = i % 2 === 0 ? -1 : 1;
      tree.position.set(side * (12 + Math.random() * 8), 0, -i * 22);
      scene.add(tree);
      trees.push(tree);
    }

    // Mountains
    for (let i = 0; i < 5; i++) {
      const mt = new THREE.Mesh(new THREE.ConeGeometry(18 + Math.random() * 12, 30 + Math.random() * 20, 5), new THREE.MeshLambertMaterial({ color: COLORS.mountain, flatShading: true }));
      mt.position.set(-55 + i * 28 + Math.random() * 10, 8, -180 - Math.random() * 30);
      scene.add(mt);
    }

    // Car
    const car = buildCar();
    car.position.set(0, 0.2, 50);
    scene.add(car);

    // Session
    // Load real V1 pack data
    let words: WordEntry[];
    try {
      const pack = getDefaultPack('Early');
      const missionWords = buildMissionWords(pack.id, 7);
      words = missionWords.map((mw: PackWordEntry) => ({
        word: mw.word,
        sentence: mw.sentence,
        audioText: mw.audioText,
        confusions: mw.confusions,
      }));
    } catch {
      words = [...FALLBACK_WORDS];
    }

    const session: RacerSession = {
      words, wordIndex: 0, completed: 0, correct: 0, streak: 0, maxStreak: 0,
      shields: 3, speed: 18, speedBoost: 0, penalty: 0, playerX: 0, targetLane: 1,
      running: true, missed: [], distance: 0,
    };
    sessionRef.current = session;

    // Spawn first gate
    let currentGate: (THREE.Group & { userData: { correctLane: number } }) | null = null;
    function spawnGate() {
      if (currentGate) { scene.remove(currentGate); currentGate = null; }
      if (session.wordIndex >= session.words.length) return;
      const entry = session.words[session.wordIndex];
      currentGate = buildGate(entry);
      currentGate.position.z = -140;
      scene.add(currentGate);
      speakWord(entry.audioText);
    }
    spawnGate();

    const sceneData = { renderer, scene, camera, clock: new THREE.Clock(), car, roadSegs, trees, gate: currentGate, frameId: null as number | null };
    sceneRef.current = sceneData;

    // Input
    let targetLane = 1;
    let lastSteer = 0;
    function steer(dir: number) {
      const now = performance.now();
      if (now - lastSteer < 130) return;
      lastSteer = now;
      targetLane = Math.max(0, Math.min(2, targetLane + dir));
      session.targetLane = targetLane;
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft' || e.key === 'a') steer(-1);
      if (e.key === 'ArrowRight' || e.key === 'd') steer(1);
    }
    window.addEventListener('keydown', onKeyDown);

    // Game loop
    function animate() {
      if (!session.running) return;
      sceneData.frameId = requestAnimationFrame(animate);
      const delta = Math.min(sceneData.clock.getDelta(), 0.05);

      // Speed
      const targetSpeed = Math.max(14, Math.min(32, session.speed + session.speedBoost - session.penalty));
      session.speedBoost = Math.max(0, session.speedBoost - delta * 4.2);
      session.penalty = Math.max(0, session.penalty - delta * 3.6);
      session.distance += targetSpeed * delta * 0.5;

      // Move road
      roadSegs.forEach((seg) => {
        seg.position.z += targetSpeed * delta;
        if (seg.position.z > 80) seg.position.z -= 11 * 40;
      });
      trees.forEach((tree) => {
        tree.position.z += targetSpeed * delta * 1.08;
        if (tree.position.z > 80) tree.position.z -= 18 * 22;
      });

      // Steer car
      session.playerX += (LANE_X[session.targetLane] - session.playerX) * Math.min(1, 9 * delta);
      car.position.x = session.playerX;
      car.rotation.z = (LANE_X[session.targetLane] - session.playerX) * -0.06;

      // Camera follow
      camera.position.x += (session.playerX * 0.14 - camera.position.x) * 2 * delta;

      // Gate movement & collision
      if (currentGate) {
        currentGate.position.z += targetSpeed * delta;
        if (currentGate.position.z >= 44) {
          // Resolve
          let closestLane = 1;
          let closestDist = Infinity;
          LANE_X.forEach((lx, i) => {
            const d = Math.abs(session.playerX - lx);
            if (d < closestDist) { closestDist = d; closestLane = i; }
          });

          const isCorrect = closestLane === currentGate.userData.correctLane;
          session.completed++;

          if (isCorrect) {
            session.correct++;
            session.streak++;
            session.maxStreak = Math.max(session.maxStreak, session.streak);
            session.speedBoost = 7.5;
            sfxCorrect();
            if (session.streak >= 8) sfxLevelUp();
            else if (session.streak >= 3) sfxStreak();
            // Shield regen at streaks 5 and 8
            if ((session.streak === 5 || session.streak === 8) && session.shields < 3) session.shields++;
          } else {
            session.streak = 0;
            session.shields = Math.max(0, session.shields - 1);
            session.penalty = 5.5;
            const entry = session.words[session.wordIndex];
            session.missed.push({ w: entry.word, h: entry.sentence });
            sfxWrong();
          }

          scene.remove(currentGate);
          currentGate = null;
          session.wordIndex++;

          if (session.wordIndex >= session.words.length) {
            session.running = false;
            handleComplete(session);
          } else {
            setTimeout(spawnGate, 300);
          }
        }
      }

      renderer.render(scene, camera);
    }
    animate();

    // Resize
    function onResize() {
      const w = container.clientWidth, h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);

    return () => {
      session.running = false;
      if (sceneData.frameId) cancelAnimationFrame(sceneData.frameId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [result, handleComplete]);

  if (result) {
    const pct = Math.round((result.correct / result.total) * 100);
    const stars = '\u2B50'.repeat(result.stars) + '\u2606'.repeat(3 - result.stars);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-slate-900 to-emerald-900/30">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full text-center border border-white/20">
          <div className="text-3xl mb-3">{stars}</div>
          <h2 className="text-xl font-bold text-white mb-2">Southlodge Racers!</h2>
          <p className="text-emerald-300 text-lg">{result.correct}/{result.total} correct ({pct}%)</p>
          {result.maxStreak >= 3 && <p className="text-amber-300 text-sm mt-2">Best streak: {result.maxStreak}</p>}
          {result.missed.length > 0 && (
            <div className="text-left mt-4">{result.missed.map((m, i) =>
              <div key={i} className="bg-white/5 rounded-lg px-3 py-2 mb-1 border border-white/10 text-sm">
                <span className="text-white font-bold">{m.w}</span>
                <span className="text-white/40 ml-2">— {m.h}</span>
              </div>
            )}</div>
          )}
          <div className="flex gap-3 mt-6">
            <button onClick={() => setResult(null)} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl">Race Again</button>
            <button onClick={onExit} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20">Back</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 relative">
      <button onClick={() => { if (sessionRef.current) sessionRef.current.running = false; onExit(); }}
        className="absolute top-4 left-4 z-10 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold backdrop-blur-sm border border-white/20">
        &larr; Quit
      </button>
      {/* HUD */}
      <div className="absolute top-4 right-4 z-10 flex gap-3 text-white text-sm font-bold">
        <span className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-lg">Use &larr; &rarr; to steer</span>
      </div>
      {/* Touch controls */}
      <button onPointerDown={() => { if (sessionRef.current) { sessionRef.current.targetLane = Math.max(0, sessionRef.current.targetLane - 1); } }}
        className="absolute bottom-8 left-8 z-10 w-20 h-20 bg-white/10 hover:bg-white/20 rounded-full text-white text-3xl font-bold backdrop-blur-sm border border-white/20 active:scale-90">&larr;</button>
      <button onPointerDown={() => { if (sessionRef.current) { sessionRef.current.targetLane = Math.min(2, sessionRef.current.targetLane + 1); } }}
        className="absolute bottom-8 right-8 z-10 w-20 h-20 bg-white/10 hover:bg-white/20 rounded-full text-white text-3xl font-bold backdrop-blur-sm border border-white/20 active:scale-90">&rarr;</button>
      <div ref={containerRef} className="w-full h-screen" />
    </div>
  );
}
