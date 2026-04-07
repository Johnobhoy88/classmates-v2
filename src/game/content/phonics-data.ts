/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

// Ported from classmates/src/scripts/domain/phonics.js
// All content exactly preserved.

export interface PhonicsEntry {
  sound: string;
  words: string[];
  wrong: string[];
}

export type PhonicsLevel = 1 | 2 | 3;

export const PHONICS_DATA: Record<PhonicsLevel, PhonicsEntry[]> = {
  1: [
    {sound:'sh',words:['ship','shop','fish','shell','shed'],wrong:['slip','stop','thin','bell']},
    {sound:'ch',words:['chip','chat','much','rich','chin'],wrong:['ship','cat','mug','ring']},
    {sound:'th',words:['this','that','them','with','bath'],wrong:['tin','sat','hem','wish']},
    {sound:'ck',words:['duck','kick','back','sock','neck'],wrong:['dug','kid','bag','song']},
    {sound:'ng',words:['ring','king','song','long','bang'],wrong:['rig','kid','sob','log']},
    {sound:'ee',words:['tree','feet','see','bee','green'],wrong:['trip','fit','set','big']},
    {sound:'oo',words:['moon','food','cool','room','zoo'],wrong:['mop','fog','coat','run']},
    {sound:'ar',words:['car','star','farm','park','dark'],wrong:['cat','stop','fan','pack']}
  ],
  2: [
    {sound:'ai',words:['rain','tail','wait','paint','train'],wrong:['run','tell','wet','pint']},
    {sound:'ay',words:['play','stay','day','say','away'],wrong:['ply','step','dig','sit']},
    {sound:'oa',words:['boat','coat','road','goat','soap'],wrong:['boot','cat','red','got']},
    {sound:'igh',words:['night','light','right','fight','sight'],wrong:['neat','lit','ring','fit']},
    {sound:'ow',words:['cow','now','town','down','brown'],wrong:['coat','not','tone','done']},
    {sound:'oi',words:['coin','join','oil','boil','point'],wrong:['cone','jam','owl','ball']},
    {sound:'ea',words:['read','team','bean','clean','dream'],wrong:['red','time','bone','clam']},
    {sound:'ou',words:['cloud','house','loud','mouse','round'],wrong:['clod','hose','lad','moose']}
  ],
  3: [
    {sound:'tion',words:['station','nation','action','fiction','section'],wrong:['stain','name','acting','fixing']},
    {sound:'ous',words:['famous','dangerous','enormous','nervous','curious'],wrong:['famine','danger','energy','never']},
    {sound:'ight',words:['midnight','delight','frighten','sunlight','twilight'],wrong:['midday','delay','frozen','Sunday']},
    {sound:'ure',words:['picture','nature','future','adventure','creature'],wrong:['pitcher','nasty','funny','advert']},
    {sound:'er',words:['water','under','never','better','winter'],wrong:['waist','until','nerve','butter']},
    {sound:'air',words:['chair','fair','pair','stair','repair'],wrong:['chain','far','pan','star']},
    {sound:'ear',words:['hear','near','dear','clear','appear'],wrong:['here','neat','deer','clean']},
    {sound:'ough',words:['though','through','thought','bought','enough'],wrong:['throw','three','thin','bout']},
    {sound:'ful',words:['beautiful','wonderful','careful','hopeful','grateful'],wrong:['beauty','wonder','caring','hoping']},
    {sound:'less',words:['careless','homeless','endless','hopeless','fearless'],wrong:['caring','home','ending','fearing']}
  ]
};
