import Phaser from 'phaser';

export interface GameConfig {
  parent: HTMLElement;
  width?: number;
  height?: number;
  scenes: Phaser.Types.Scenes.SceneType[];
}

export function createPhaserGame(config: GameConfig): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent: config.parent,
    width: config.width || config.parent.clientWidth,
    height: config.height || config.parent.clientHeight,
    backgroundColor: '#0b1a2e',
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: config.scenes,
    physics: {
      default: 'arcade',
      arcade: { gravity: { x: 0, y: 0 }, debug: false },
    },
    input: {
      keyboard: true,
      mouse: true,
      touch: true,
    },
    audio: {
      disableWebAudio: false,
    },
    render: {
      pixelArt: false,
      antialias: true,
    },
  });
}
