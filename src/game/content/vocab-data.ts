// Ported from classmates/src/scripts/games/vocab.js
// All content exactly preserved.

export interface VocabEntry {
  w: string;
  d: string;
  wrong: string[];
}

export type VocabLevel = 1 | 2 | 3;

export const VOCAB_DATA: Record<VocabLevel, VocabEntry[]> = {
  1: [
    {w:'happy',d:'Feeling good and cheerful',wrong:['Feeling sad','Feeling tired','Feeling angry']},
    {w:'huge',d:'Very, very big',wrong:['Very small','Very fast','Very loud']},
    {w:'tiny',d:'Very, very small',wrong:['Very big','Very tall','Very wide']},
    {w:'brave',d:'Not afraid of scary things',wrong:['Very fast','Very quiet','Very tall']},
    {w:'gentle',d:'Soft and careful, not rough',wrong:['Loud and noisy','Quick and fast','Hard and strong']},
    {w:'delicious',d:'Tastes really, really good',wrong:['Looks pretty','Sounds nice','Feels soft']},
    {w:'ancient',d:'Very, very old',wrong:['Very new','Very big','Very cold']},
    {w:'furious',d:'Extremely angry',wrong:['Very happy','Very sleepy','Very hungry']},
    {w:'shiver',d:'To shake because you are cold or scared',wrong:['To jump very high','To run very fast','To shout very loud']},
    {w:'whisper',d:'To speak very quietly',wrong:['To speak very loudly','To run quickly','To eat slowly']},
    {w:'enormous',d:'Extremely big and large',wrong:['Extremely small','Extremely fast','Extremely quiet']},
    {w:'search',d:'To look carefully for something',wrong:['To eat quickly','To sleep deeply','To run far']},
    {w:'frosty',d:'Covered in ice crystals',wrong:['Very hot','Very loud','Very dark']},
    {w:'greedy',d:'Wanting more than you need',wrong:['Very kind','Very brave','Very quiet']},
    {w:'hollow',d:'Empty inside',wrong:['Very full','Very heavy','Very tall']},
    {w:'patient',d:'Able to wait calmly',wrong:['Very fast','Very angry','Very hungry']}
  ],
  2: [
    {w:'courageous',d:'Very brave, willing to face danger',wrong:['Very careful','Very clever','Very quiet']},
    {w:'abundant',d:'Having a very large amount of something',wrong:['Having very little','Being very slow','Feeling very tired']},
    {w:'peculiar',d:'Strange or unusual',wrong:['Normal and ordinary','Fast and quick','Kind and gentle']},
    {w:'exhausted',d:'Extremely tired with no energy left',wrong:['Full of energy','Very hungry','Very confused']},
    {w:'generous',d:'Willing to give and share with others',wrong:['Wanting to keep everything','Being very quiet','Running very fast']},
    {w:'fragile',d:'Easily broken or damaged',wrong:['Very strong','Very heavy','Very loud']},
    {w:'absurd',d:'Completely silly or ridiculous',wrong:['Very serious','Very clever','Very calm']},
    {w:'magnificent',d:'Extremely beautiful or impressive',wrong:['Very ugly','Very boring','Very common']},
    {w:'trembling',d:'Shaking slightly because of fear or cold',wrong:['Standing completely still','Running very fast','Sleeping deeply']},
    {w:'cunning',d:'Clever at tricking people',wrong:['Very kind','Very strong','Very lazy']},
    {w:'dreadful',d:'Very bad or unpleasant',wrong:['Very good','Very pretty','Very exciting']},
    {w:'hesitate',d:'To pause before doing something because you are unsure',wrong:['To rush ahead quickly','To sleep for a long time','To eat a big meal']}
  ],
  3: [
    {w:'benevolent',d:'Kind-hearted and wanting to help others',wrong:['Mean and cruel','Lazy and bored','Loud and angry']},
    {w:'resilient',d:'Able to recover quickly from difficulties',wrong:['Easily giving up','Always confused','Never happy']},
    {w:'ambiguous',d:'Having more than one possible meaning, unclear',wrong:['Completely clear','Very simple','Extremely loud']},
    {w:'meticulous',d:'Very careful and paying attention to every detail',wrong:['Very careless','Very loud','Very fast']},
    {w:'ominous',d:'Giving the feeling that something bad is about to happen',wrong:['Making you feel happy','Making you feel hungry','Making you feel sleepy']},
    {w:'compassion',d:'A feeling of deep sympathy and wanting to help someone suffering',wrong:['A feeling of anger','A type of food','A kind of weather']},
    {w:'eloquent',d:'Fluent and persuasive in speaking or writing',wrong:['Unable to speak clearly','Very shy and quiet','Always disagreeing']},
    {w:'inevitable',d:'Certain to happen, cannot be avoided',wrong:['Very unlikely to happen','Easy to prevent','Completely impossible']},
    {w:'diligent',d:'Working hard with care and effort',wrong:['Very lazy','Always sleeping','Never trying']},
    {w:'formidable',d:'Inspiring fear or respect through being powerful',wrong:['Weak and small','Funny and silly','Quiet and shy']},
    {w:'melancholy',d:'A deep sadness or gloominess',wrong:['Extreme happiness','Great excitement','Pure anger']},
    {w:'perplexed',d:'Completely puzzled and confused',wrong:['Completely sure','Very happy','Extremely angry']}
  ]
};
