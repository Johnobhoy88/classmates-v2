// Ported from classmates/src/scripts/games/rhyme.js
// All content exactly preserved.

export interface RhymeEntry {
  w: string;
  r: string[];
  wrong: string[];
}

export type RhymeLevel = 1 | 2 | 3;

export const RHYME_DATA: Record<RhymeLevel, RhymeEntry[]> = {
  1:[
    {w:'cat',r:['hat','bat','mat'],wrong:['dog','cup','run']},
    {w:'dog',r:['log','fog','bog'],wrong:['cat','hat','sun']},
    {w:'sun',r:['fun','run','bun'],wrong:['dog','hat','bed']},
    {w:'bed',r:['red','fed','led'],wrong:['sun','cat','big']},
    {w:'pig',r:['big','dig','fig'],wrong:['dog','hat','sun']},
    {w:'pot',r:['hot','got','dot'],wrong:['pig','cat','bed']},
    {w:'hen',r:['ten','pen','men'],wrong:['pig','dog','sun']},
    {w:'bus',r:['fuss','plus','us'],wrong:['cat','dog','hat']},
    {w:'ring',r:['sing','king','thing'],wrong:['cat','dog','sun']},
    {w:'cake',r:['lake','make','shake'],wrong:['dog','sun','bed']}
  ],
  2:[
    {w:'light',r:['night','right','flight'],wrong:['rain','cloud','dream']},
    {w:'rain',r:['train','brain','pain'],wrong:['light','night','cake']},
    {w:'dream',r:['team','cream','stream'],wrong:['light','rain','cake']},
    {w:'moon',r:['soon','spoon','tune'],wrong:['rain','light','dream']},
    {w:'tree',r:['free','three','see'],wrong:['moon','rain','light']},
    {w:'play',r:['day','stay','way'],wrong:['tree','moon','rain']},
    {w:'book',r:['cook','look','hook'],wrong:['play','tree','moon']},
    {w:'sleep',r:['deep','keep','sheep'],wrong:['book','play','tree']},
    {w:'stone',r:['bone','phone','zone'],wrong:['sleep','book','play']},
    {w:'cloud',r:['loud','crowd','proud'],wrong:['stone','sleep','book']}
  ],
  3:[
    {w:'thought',r:['bought','caught','taught'],wrong:['light','sound','round']},
    {w:'through',r:['blue','flew','new'],wrong:['thought','bought','sound']},
    {w:'measure',r:['treasure','pleasure','leisure'],wrong:['thought','through','blue']},
    {w:'ocean',r:['motion','potion','notion'],wrong:['measure','thought','through']},
    {w:'station',r:['nation','relation','creation'],wrong:['ocean','measure','through']},
    {w:'creature',r:['feature','teacher','preacher'],wrong:['station','ocean','measure']},
    {w:'ancient',r:['patient','efficient','sufficient'],wrong:['creature','station','ocean']},
    {w:'machine',r:['routine','marine','magazine'],wrong:['ancient','creature','station']},
    {w:'adventure',r:['venture','denture','furniture'],wrong:['machine','ancient','creature']},
    {w:'imagine',r:['cabin','famine','examine'],wrong:['adventure','machine','ancient']}
  ]
};
