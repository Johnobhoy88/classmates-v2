/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

// Ported from classmates/src/scripts/domain/southlodge-racers-packs.js
// All content exactly preserved — every word, sentence, confusion distractor.

import { shuffle } from '../../utils/shuffle';

/* ── Interfaces ─────────────────────────────────────────────── */

export interface WordEntry {
  word: string;
  sentence: string;
  audioText: string;
  errorPatternTag: string;
  confusions: string[];
}

export interface MissionWord extends WordEntry {
  id: string;
}

export interface Pack {
  id: string;
  title: string;
  shortTitle: string;
  stageBand: string;
  skillFocus: string;
  cfeOutcomeLabels: string[];
  accent: string;
  words: WordEntry[];
}

export interface StageBand {
  id: string;
  label: string;
  subtitle: string;
  accent: string;
  description: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface Activity {
  id: string;
  title: string;
  screenId: string;
  category: string;
}

/* ── Static data ────────────────────────────────────────────── */

export const ACTIVITY: Activity = {
  id: 'southlodgeracers',
  title: 'Southlodge Racers',
  screenId: 'hdash',
  category: 'literacy'
};

export const STAGE_BANDS: StageBand[] = [
  { id: 'Early', label: 'Early', subtitle: 'P1-P2', accent: '#f0a500', description: 'Short patterned words and first sounds' },
  { id: 'First', label: 'First', subtitle: 'P2-P4', accent: '#0984e3', description: 'Common spelling rules and growing word patterns' },
  { id: 'Second', label: 'Second', subtitle: 'P5-P7', accent: '#6c5ce7', description: 'Word structure, meaning, and curriculum vocabulary' }
];

export const ERROR_PATTERN_LABELS: Record<string, string> = {
  'cvc-short-a': 'Short a CVC words',
  'cvc-short-e': 'Short e CVC words',
  'cvc-short-o': 'Short o CVC words',
  'cvc-short-u': 'Short u CVC words',
  'cvc-short-i': 'Short i CVC words',
  'digraph-ch': 'ch digraphs',
  'digraph-sh': 'sh digraphs',
  'digraph-th': 'th digraphs',
  'digraph-ng': 'ng digraphs',
  'digraph-wh': 'wh digraphs',
  'blend-cl': 'cl blends',
  'blend-dr': 'dr blends',
  'blend-fr': 'fr blends',
  'blend-sn': 'sn blends',
  'blend-st': 'st blends',
  'blend-tr': 'tr blends',
  'cvcc-ccvc': 'CCVC and CVCC patterns',
  'silent-e': 'silent e words',
  'vowel-team-ai': 'ai vowel teams',
  'vowel-team-ee': 'ee vowel teams',
  'vowel-team-oa': 'oa vowel teams',
  'vowel-team-ea': 'ea vowel teams',
  'prefixes': 'prefixes',
  'suffixes': 'suffixes',
  'homophones': 'homophones',
  'curriculum-vocab': 'curriculum vocabulary'
};

export const PACKS: Pack[] = [
  {
    id: 'early-cvc',
    title: 'CVC Road Sprint',
    shortTitle: 'CVC words',
    stageBand: 'Early',
    skillFocus: 'CVC words',
    cfeOutcomeLabels: ['LIT 0-21a', 'ENG 0-12a'],
    accent: '#f0a500',
    words: [
      { word: 'cat', sentence: 'The cat curled up on the mat.', audioText: 'Spell cat. The cat curled up on the mat.', errorPatternTag: 'cvc-short-a', confusions: ['cot', 'cut'] },
      { word: 'bed', sentence: 'Make your bed before school.', audioText: 'Spell bed. Make your bed before school.', errorPatternTag: 'cvc-short-e', confusions: ['bad', 'bid'] },
      { word: 'fox', sentence: 'A fox ran across the field.', audioText: 'Spell fox. A fox ran across the field.', errorPatternTag: 'cvc-short-o', confusions: ['fix', 'fax'] },
      { word: 'sun', sentence: 'The sun came out after the rain.', audioText: 'Spell sun. The sun came out after the rain.', errorPatternTag: 'cvc-short-u', confusions: ['son', 'sin'] },
      { word: 'pin', sentence: 'Use a pin to hang the notice.', audioText: 'Spell pin. Use a pin to hang the notice.', errorPatternTag: 'cvc-short-i', confusions: ['pan', 'pen'] },
      { word: 'jam', sentence: 'Spread jam on the toast.', audioText: 'Spell jam. Spread jam on the toast.', errorPatternTag: 'cvc-short-a', confusions: ['jem', 'job'] }
    ]
  },
  {
    id: 'early-digraphs',
    title: 'Digraph Glen Dash',
    shortTitle: 'Common digraphs',
    stageBand: 'Early',
    skillFocus: 'Common digraphs',
    cfeOutcomeLabels: ['LIT 0-21a', 'ENG 0-12a'],
    accent: '#ff7f50',
    words: [
      { word: 'ship', sentence: 'The ship sailed past the harbour.', audioText: 'Spell ship. The ship sailed past the harbour.', errorPatternTag: 'digraph-sh', confusions: ['sip', 'shop'] },
      { word: 'chat', sentence: 'We had a quick chat at break.', audioText: 'Spell chat. We had a quick chat at break.', errorPatternTag: 'digraph-ch', confusions: ['cat', 'chap'] },
      { word: 'thin', sentence: 'The thin rope snapped in the wind.', audioText: 'Spell thin. The thin rope snapped in the wind.', errorPatternTag: 'digraph-th', confusions: ['tin', 'than'] },
      { word: 'ring', sentence: 'The bell began to ring loudly.', audioText: 'Spell ring. The bell began to ring loudly.', errorPatternTag: 'digraph-ng', confusions: ['rig', 'rang'] },
      { word: 'whale', sentence: 'We drew a giant whale in art.', audioText: 'Spell whale. We drew a giant whale in art.', errorPatternTag: 'digraph-wh', confusions: ['wale', 'while'] },
      { word: 'chick', sentence: 'A chick hatched from the egg.', audioText: 'Spell chick. A chick hatched from the egg.', errorPatternTag: 'digraph-ch', confusions: ['tick', 'cheek'] }
    ]
  },
  {
    id: 'early-blends',
    title: 'Blend Brae Rally',
    shortTitle: 'Simple blends',
    stageBand: 'Early',
    skillFocus: 'Simple blends',
    cfeOutcomeLabels: ['LIT 0-21a', 'ENG 0-12a'],
    accent: '#ffb142',
    words: [
      { word: 'frog', sentence: 'The frog leapt into the pond.', audioText: 'Spell frog. The frog leapt into the pond.', errorPatternTag: 'blend-fr', confusions: ['fog', 'from'] },
      { word: 'step', sentence: 'Take one careful step at a time.', audioText: 'Spell step. Take one careful step at a time.', errorPatternTag: 'blend-st', confusions: ['sep', 'stop'] },
      { word: 'clap', sentence: 'Clap when the music begins.', audioText: 'Spell clap. Clap when the music begins.', errorPatternTag: 'blend-cl', confusions: ['cap', 'clip'] },
      { word: 'drum', sentence: 'The drum beat echoed in the hall.', audioText: 'Spell drum. The drum beat echoed in the hall.', errorPatternTag: 'blend-dr', confusions: ['dum', 'dram'] },
      { word: 'snow', sentence: 'Fresh snow covered the playground.', audioText: 'Spell snow. Fresh snow covered the playground.', errorPatternTag: 'blend-sn', confusions: ['sow', 'slow'] },
      { word: 'trip', sentence: 'We took a trip to the library.', audioText: 'Spell trip. We took a trip to the library.', errorPatternTag: 'blend-tr', confusions: ['tip', 'trap'] }
    ]
  },
  {
    id: 'first-cvcc-ccvc',
    title: 'Cluster Coast Run',
    shortTitle: 'CVCC and CCVC',
    stageBand: 'First',
    skillFocus: 'CVCC and CCVC patterns',
    cfeOutcomeLabels: ['LIT 1-21a', 'ENG 1-12a'],
    accent: '#0984e3',
    words: [
      { word: 'milk', sentence: 'Pour the milk into the mug.', audioText: 'Spell milk. Pour the milk into the mug.', errorPatternTag: 'cvcc-ccvc', confusions: ['milt', 'mulk'] },
      { word: 'tent', sentence: 'The tent stayed dry in the rain.', audioText: 'Spell tent. The tent stayed dry in the rain.', errorPatternTag: 'cvcc-ccvc', confusions: ['tant', 'tint'] },
      { word: 'drift', sentence: 'Watch the snow drift past the gate.', audioText: 'Spell drift. Watch the snow drift past the gate.', errorPatternTag: 'cvcc-ccvc', confusions: ['draft', 'drif'] },
      { word: 'stamp', sentence: 'Stick the stamp in the top corner.', audioText: 'Spell stamp. Stick the stamp in the top corner.', errorPatternTag: 'cvcc-ccvc', confusions: ['stampe', 'stomp'] },
      { word: 'crisp', sentence: 'The apple tasted fresh and crisp.', audioText: 'Spell crisp. The apple tasted fresh and crisp.', errorPatternTag: 'cvcc-ccvc', confusions: ['crips', 'crasp'] },
      { word: 'glint', sentence: 'A glint of light flashed on the loch.', audioText: 'Spell glint. A glint of light flashed on the loch.', errorPatternTag: 'cvcc-ccvc', confusions: ['glent', 'glit'] }
    ]
  },
  {
    id: 'first-silent-e',
    title: 'Silent E Circuit',
    shortTitle: 'silent e',
    stageBand: 'First',
    skillFocus: 'silent e',
    cfeOutcomeLabels: ['LIT 1-21a', 'ENG 1-12a'],
    accent: '#00a8ff',
    words: [
      { word: 'cake', sentence: 'We baked a cake for the fair.', audioText: 'Spell cake. We baked a cake for the fair.', errorPatternTag: 'silent-e', confusions: ['cak', 'cack'] },
      { word: 'home', sentence: 'Walk home safely after club.', audioText: 'Spell home. Walk home safely after club.', errorPatternTag: 'silent-e', confusions: ['hom', 'hume'] },
      { word: 'bike', sentence: 'Lock your bike by the gate.', audioText: 'Spell bike. Lock your bike by the gate.', errorPatternTag: 'silent-e', confusions: ['bik', 'bake'] },
      { word: 'cube', sentence: 'The ice cube melted quickly.', audioText: 'Spell cube. The ice cube melted quickly.', errorPatternTag: 'silent-e', confusions: ['cub', 'cobe'] },
      { word: 'smile', sentence: 'A smile spread across her face.', audioText: 'Spell smile. A smile spread across her face.', errorPatternTag: 'silent-e', confusions: ['smil', 'smale'] },
      { word: 'tune', sentence: 'We sang the tune in assembly.', audioText: 'Spell tune. We sang the tune in assembly.', errorPatternTag: 'silent-e', confusions: ['tun', 'tone'] }
    ]
  },
  {
    id: 'first-vowel-teams',
    title: 'Vowel Team Valley',
    shortTitle: 'vowel teams',
    stageBand: 'First',
    skillFocus: 'vowel teams',
    cfeOutcomeLabels: ['LIT 1-21a', 'ENG 1-12a'],
    accent: '#00cec9',
    words: [
      { word: 'rain', sentence: 'The rain fell on the playground.', audioText: 'Spell rain. The rain fell on the playground.', errorPatternTag: 'vowel-team-ai', confusions: ['ran', 'rein'] },
      { word: 'seed', sentence: 'Plant the seed in the pot.', audioText: 'Spell seed. Plant the seed in the pot.', errorPatternTag: 'vowel-team-ee', confusions: ['sed', 'sead'] },
      { word: 'boat', sentence: 'The boat rocked on the loch.', audioText: 'Spell boat. The boat rocked on the loch.', errorPatternTag: 'vowel-team-oa', confusions: ['bot', 'bote'] },
      { word: 'beach', sentence: 'We found shells on the beach.', audioText: 'Spell beach. We found shells on the beach.', errorPatternTag: 'vowel-team-ea', confusions: ['bech', 'beech'] },
      { word: 'coat', sentence: 'Hang your coat on the peg.', audioText: 'Spell coat. Hang your coat on the peg.', errorPatternTag: 'vowel-team-oa', confusions: ['cot', 'coet'] },
      { word: 'team', sentence: 'Our team worked together well.', audioText: 'Spell team. Our team worked together well.', errorPatternTag: 'vowel-team-ea', confusions: ['tem', 'teem'] }
    ]
  },
  {
    id: 'second-prefixes-suffixes',
    title: 'Word Builder Ridge',
    shortTitle: 'prefixes and suffixes',
    stageBand: 'Second',
    skillFocus: 'prefixes and suffixes',
    cfeOutcomeLabels: ['LIT 2-21a', 'ENG 2-12a'],
    accent: '#6c5ce7',
    words: [
      { word: 'unhappy', sentence: 'The puppy looked unhappy in the rain.', audioText: 'Spell unhappy. The puppy looked unhappy in the rain.', errorPatternTag: 'prefixes', confusions: ['unhapy', 'inhappy'] },
      { word: 'replay', sentence: 'We watched the replay after lunch.', audioText: 'Spell replay. We watched the replay after lunch.', errorPatternTag: 'prefixes', confusions: ['repaly', 'reply'] },
      { word: 'helpful', sentence: 'A helpful note was left by the board.', audioText: 'Spell helpful. A helpful note was left by the board.', errorPatternTag: 'suffixes', confusions: ['helpfull', 'helpfl'] },
      { word: 'careless', sentence: 'A careless mistake changed the answer.', audioText: 'Spell careless. A careless mistake changed the answer.', errorPatternTag: 'suffixes', confusions: ['careles', 'caerless'] },
      { word: 'preview', sentence: 'We read a preview of the story.', audioText: 'Spell preview. We read a preview of the story.', errorPatternTag: 'prefixes', confusions: ['preveiw', 'priew'] },
      { word: 'jumping', sentence: 'The jumping deer cleared the fence.', audioText: 'Spell jumping. The jumping deer cleared the fence.', errorPatternTag: 'suffixes', confusions: ['jumpin', 'jumpingg'] }
    ]
  },
  {
    id: 'second-homophones',
    title: 'Homophone Harbour',
    shortTitle: 'homophones',
    stageBand: 'Second',
    skillFocus: 'homophones',
    cfeOutcomeLabels: ['LIT 2-14a', 'LIT 2-21a'],
    accent: '#8e44ad',
    words: [
      { word: 'pair', sentence: 'A pair of gloves sat on the bench.', audioText: 'Spell pair. A pair of gloves sat on the bench.', errorPatternTag: 'homophones', confusions: ['pear', 'pare'] },
      { word: 'sea', sentence: 'The sea looked calm at sunset.', audioText: 'Spell sea. The sea looked calm at sunset.', errorPatternTag: 'homophones', confusions: ['see', 'cee'] },
      { word: 'flour', sentence: 'Add flour to the mixing bowl.', audioText: 'Spell flour. Add flour to the mixing bowl.', errorPatternTag: 'homophones', confusions: ['flower', 'flor'] },
      { word: 'knight', sentence: 'The knight protected the castle gate.', audioText: 'Spell knight. The knight protected the castle gate.', errorPatternTag: 'homophones', confusions: ['night', 'nite'] },
      { word: 'right', sentence: 'Turn right at the school sign.', audioText: 'Spell right. Turn right at the school sign.', errorPatternTag: 'homophones', confusions: ['write', 'rite'] },
      { word: 'brake', sentence: 'Press the brake before the corner.', audioText: 'Spell brake. Press the brake before the corner.', errorPatternTag: 'homophones', confusions: ['break', 'braik'] }
    ]
  },
  {
    id: 'second-curriculum-vocab',
    title: 'Curriculum Crown Route',
    shortTitle: 'curriculum vocabulary',
    stageBand: 'Second',
    skillFocus: 'curriculum vocabulary',
    cfeOutcomeLabels: ['LIT 2-21a', 'LIT 2-24a'],
    accent: '#9b59b6',
    words: [
      { word: 'habitat', sentence: 'A pond is the frog\'s habitat.', audioText: 'Spell habitat. A pond is the frog\'s habitat.', errorPatternTag: 'curriculum-vocab', confusions: ['habbitat', 'habtat'] },
      { word: 'climate', sentence: 'Scotland has a cool climate.', audioText: 'Spell climate. Scotland has a cool climate.', errorPatternTag: 'curriculum-vocab', confusions: ['climet', 'climite'] },
      { word: 'fraction', sentence: 'One half is a simple fraction.', audioText: 'Spell fraction. One half is a simple fraction.', errorPatternTag: 'curriculum-vocab', confusions: ['fration', 'fracton'] },
      { word: 'energy', sentence: 'Food gives our bodies energy.', audioText: 'Spell energy. Food gives our bodies energy.', errorPatternTag: 'curriculum-vocab', confusions: ['enrgy', 'enerji'] },
      { word: 'volume', sentence: 'Turn the volume down during reading.', audioText: 'Spell volume. Turn the volume down during reading.', errorPatternTag: 'curriculum-vocab', confusions: ['volum', 'valume'] },
      { word: 'research', sentence: 'Research helps us check our facts.', audioText: 'Spell research. Research helps us check our facts.', errorPatternTag: 'curriculum-vocab', confusions: ['reserch', 'reasearch'] }
    ]
  }
];

/* ── Helpers ─────────────────────────────────────────────────── */

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

/* ── Public API ──────────────────────────────────────────────── */

export function listStageBands(): StageBand[] {
  return clone(STAGE_BANDS);
}

export function listPacks(stageBandId?: string): Pack[] {
  const packs = stageBandId
    ? PACKS.filter((pack) => pack.stageBand === stageBandId)
    : PACKS.slice();
  return clone(packs);
}

export function getPack(packId: string): Pack | null {
  const pack = PACKS.find((candidate) => candidate.id === packId);
  return pack ? clone(pack) : null;
}

export function getDefaultPack(stageBandId?: string): Pack {
  const pack = PACKS.find((candidate) => candidate.stageBand === stageBandId) || PACKS[3];
  return clone(pack);
}

export function getErrorLabel(tag: string | undefined | null): string {
  if (tag && ERROR_PATTERN_LABELS[tag]) return ERROR_PATTERN_LABELS[tag];
  return String(tag || 'pattern').replace(/-/g, ' ');
}

export function buildMissionWords(
  packId: string,
  missionLength?: number
): MissionWord[] {
  const pack = getPack(packId) || getDefaultPack('First');
  const targetLength = missionLength ?? 7;
  const source = shuffle(pack.words.slice());
  const missionWords: MissionWord[] = [];
  while (missionWords.length < targetLength) {
    const item = clone(source[missionWords.length % source.length]);
    const mission: MissionWord = {
      ...item,
      id: pack.id + '_' + item.word + '_' + missionWords.length
    };
    if (!mission.audioText) mission.audioText = 'Spell ' + mission.word + '. ' + mission.sentence;
    missionWords.push(mission);
  }
  return missionWords;
}

export function validatePack(pack: Pack): ValidationResult {
  const errors: string[] = [];
  if (!pack.id) errors.push('Missing pack id');
  if (!pack.title) errors.push('Missing pack title');
  if (!pack.stageBand) errors.push('Missing stage band');
  if (!STAGE_BANDS.find((b) => b.id === pack.stageBand)) errors.push('Invalid stage band: ' + pack.stageBand);
  if (!Array.isArray(pack.words) || pack.words.length === 0) {
    errors.push('Pack must have at least one word');
  } else {
    pack.words.forEach((item, index) => {
      if (!item.word) errors.push(`Word at index ${index} missing text`);
      if (!item.sentence) errors.push(`Word "${item.word || index}" missing sentence`);
      if (item.errorPatternTag && !ERROR_PATTERN_LABELS[item.errorPatternTag]) {
        console.warn(`Unrecognized error pattern tag: ${item.errorPatternTag} in pack ${pack.id}`);
      }
    });
  }
  return {
    valid: errors.length === 0,
    errors
  };
}
