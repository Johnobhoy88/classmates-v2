export interface PhonicsEntry {
  sound: string;
  words: string[];
  wrong: string[];
}

export const PHONICS: PhonicsEntry[][] = [
  // Level 1 — CVC and simple digraphs
  [
    { sound: 'sh', words: ['ship', 'shop', 'fish', 'shell'], wrong: ['sip', 'stop', 'fin'] },
    { sound: 'ch', words: ['chip', 'chin', 'chop', 'chat'], wrong: ['cap', 'tip', 'top'] },
    { sound: 'th', words: ['this', 'that', 'them', 'thin'], wrong: ['tin', 'ten', 'tan'] },
    { sound: 'ng', words: ['ring', 'sing', 'king', 'long'], wrong: ['rig', 'sit', 'kit'] },
    { sound: 'ai', words: ['rain', 'tail', 'train', 'snail'], wrong: ['run', 'tin', 'ten'] },
    { sound: 'ee', words: ['tree', 'bee', 'see', 'green'], wrong: ['try', 'big', 'sit'] },
    { sound: 'oa', words: ['boat', 'coat', 'goat', 'road'], wrong: ['bat', 'cat', 'got'] },
    { sound: 'oo', words: ['moon', 'spoon', 'boot', 'food'], wrong: ['man', 'spin', 'bit'] },
  ],
  // Level 2 — Blends and longer vowels
  [
    { sound: 'bl', words: ['blue', 'black', 'blow', 'block'], wrong: ['clue', 'back', 'flow'] },
    { sound: 'cr', words: ['crab', 'cross', 'cream', 'crisp'], wrong: ['grab', 'loss', 'dream'] },
    { sound: 'str', words: ['string', 'strong', 'street', 'stream'], wrong: ['sing', 'song', 'sweet'] },
    { sound: 'igh', words: ['light', 'night', 'right', 'flight'], wrong: ['lit', 'not', 'rift'] },
    { sound: 'ow', words: ['cow', 'town', 'brown', 'crown'], wrong: ['caw', 'ton', 'bran'] },
    { sound: 'ou', words: ['house', 'mouse', 'cloud', 'round'], wrong: ['hose', 'moose', 'clad'] },
    { sound: 'ear', words: ['hear', 'near', 'dear', 'clear'], wrong: ['hair', 'nor', 'dare'] },
    { sound: 'air', words: ['fair', 'hair', 'chair', 'stair'], wrong: ['far', 'her', 'cheer'] },
  ],
  // Level 3 — Complex patterns
  [
    { sound: 'tion', words: ['station', 'nation', 'action', 'fraction'], wrong: ['statin', 'notion', 'active'] },
    { sound: 'ous', words: ['famous', 'nervous', 'enormous', 'dangerous'], wrong: ['famine', 'never', 'energy'] },
    { sound: 'ture', words: ['nature', 'picture', 'future', 'adventure'], wrong: ['natal', 'picked', 'further'] },
    { sound: 'sion', words: ['vision', 'mission', 'tension', 'decision'], wrong: ['visual', 'missing', 'tense'] },
    { sound: 'cian', words: ['musician', 'magician', 'optician', 'politician'], wrong: ['musical', 'magical', 'optical'] },
    { sound: 'ible', words: ['possible', 'visible', 'horrible', 'terrible'], wrong: ['posit', 'visit', 'horror'] },
  ],
];
