// Ported from classmates/src/scripts/domain/word-families.js
// All content exactly preserved.

export interface WordFamilyEntry {
  ending: string;
  words: string[];
  wrong: string[];
}

export type WordFamLevel = 1 | 2 | 3;

export const WORDFAM_DATA: Record<WordFamLevel, WordFamilyEntry[]> = {
  1: [
    {ending:'-at',words:['cat','hat','bat','mat','sat','rat','fat','pat'],wrong:['can','him','bit','mop']},
    {ending:'-an',words:['man','can','van','pan','ran','fan','ban','tan'],wrong:['mat','cup','vet','pin']},
    {ending:'-ig',words:['big','pig','dig','fig','wig','jig'],wrong:['bag','peg','dog','bug']},
    {ending:'-og',words:['dog','log','fog','hog','jog','bog'],wrong:['dig','lag','fig','bug']},
    {ending:'-op',words:['hop','top','mop','pop','stop','shop','drop'],wrong:['hip','tap','map','pup']},
    {ending:'-ug',words:['bug','hug','mug','rug','tug','jug','dug','pug'],wrong:['bag','hog','mig','rig']},
    {ending:'-et',words:['net','wet','pet','get','set','let','met','bet'],wrong:['not','wit','pot','gut']},
    {ending:'-in',words:['bin','fin','pin','tin','win','grin','thin','skin'],wrong:['ban','fun','pan','ten']},
    {ending:'-un',words:['bun','fun','gun','run','sun','spun','stun'],wrong:['bin','fan','gin','ran']}
  ],
  2: [
    {ending:'-ight',words:['light','night','fight','right','sight','might','bright','flight'],wrong:['lit','nit','fit','ring']},
    {ending:'-tion',words:['station','nation','action','fiction','section','mention'],wrong:['stain','nasty','acting','fixing']},
    {ending:'-ake',words:['cake','lake','make','take','wake','shake','bake','snake'],wrong:['cook','lock','mock','tuck']},
    {ending:'-ine',words:['mine','fine','line','vine','pine','nine','shine','wine'],wrong:['man','fun','lane','van']},
    {ending:'-eat',words:['heat','meat','beat','seat','neat','treat','wheat','cheat'],wrong:['hit','mat','bit','set']},
    {ending:'-ound',words:['round','found','sound','ground','pound','hound','bound','mound'],wrong:['rind','fund','sand','grind']}
  ],
  3: [
    {ending:'-ing',words:['running','playing','singing','reading','jumping','swimming','writing','thinking'],wrong:['runner','player','singer','reader']},
    {ending:'-ed',words:['played','jumped','walked','talked','cooked','cleaned','looked','opened'],wrong:['playing','jumping','walking','talking']},
    {ending:'-er',words:['bigger','faster','taller','smaller','louder','harder','softer','brighter'],wrong:['biggest','fastest','tallest','smallest']},
    {ending:'-est',words:['biggest','fastest','tallest','smallest','loudest','hardest','softest','brightest'],wrong:['bigger','faster','taller','smaller']},
    {ending:'-ous',words:['famous','dangerous','enormous','nervous','curious','serious','generous','precious'],wrong:['famine','danger','energy','nerve']},
    {ending:'-ation',words:['celebration','imagination','education','information','decoration','exploration'],wrong:['celebrate','imagine','educate','inform']}
  ]
};
