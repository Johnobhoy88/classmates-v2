/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

// Ported from classmates/src/scripts/games/punctuation.js
// All content exactly preserved — every sentence pair and ordering sentence.

export interface PunctEntry {
  wrong: string;
  right: string;
}

export type PunctLevel = 1 | 2 | 3;

export const PUNCT_DATA: Record<PunctLevel, PunctEntry[]> = {
  1: [
    {wrong:'the cat sat on the mat',right:'The cat sat on the mat.'},
    {wrong:'i like to play outside',right:'I like to play outside.'},
    {wrong:'mum went to the shop',right:'Mum went to the shop.'},
    {wrong:'the dog ran very fast',right:'The dog ran very fast.'},
    {wrong:'we had lunch at school',right:'We had lunch at school.'},
    {wrong:'dad made a cup of tea',right:'Dad made a cup of tea.'},
    {wrong:'the bird flew over the tree',right:'The bird flew over the tree.'},
    {wrong:'she likes red and blue',right:'She likes red and blue.'},
    {wrong:'the sun is shining today',right:'The sun is shining today.'},
    {wrong:'my name is isla',right:'My name is Isla.'},
    {wrong:'he went to edinburgh',right:'He went to Edinburgh.'},
    {wrong:'i can see the big hill',right:'I can see the big hill.'},
    {wrong:'the fish swam in the loch',right:'The fish swam in the loch.'},
    {wrong:'we played in the park',right:'We played in the park.'},
    {wrong:'sam and ben are friends',right:'Sam and Ben are friends.'},
    {wrong:'the cat is on the mat',right:'The cat is on the mat.'},
    {wrong:'we went to edinburgh zoo',right:'We went to Edinburgh Zoo.'},
    {wrong:'isla likes to read books',right:'Isla likes to read books.'},
    {wrong:'they live in scotland',right:'They live in Scotland.'}
  ],
  2: [
    {wrong:'where is my hat',right:'Where is my hat?'},
    {wrong:'can you help me please',right:'Can you help me, please?'},
    {wrong:'wow that is amazing',right:'Wow, that is amazing!'},
    {wrong:'stop dont touch that',right:'Stop! Don\'t touch that!'},
    {wrong:'we need milk bread and eggs',right:'We need milk, bread and eggs.'},
    {wrong:'is it time to go home',right:'Is it time to go home?'},
    {wrong:'hooray we won the game',right:'Hooray! We won the game!'},
    {wrong:'i like apples oranges and bananas',right:'I like apples, oranges and bananas.'},
    {wrong:'what time does school start',right:'What time does school start?'},
    {wrong:'oh no i forgot my bag',right:'Oh no! I forgot my bag!'},
    {wrong:'after lunch we went swimming',right:'After lunch, we went swimming.'},
    {wrong:'how old are you',right:'How old are you?'},
    {wrong:'yes i would like some please',right:'Yes, I would like some, please.'},
    {wrong:'quick run to the door',right:'Quick! Run to the door!'},
    {wrong:'in the morning we had porridge',right:'In the morning, we had porridge.'}
  ],
  3: [
    {wrong:'the boys ball rolled away',right:'The boy\'s ball rolled away.'},
    {wrong:'its a beautiful day said mum',right:'"It\'s a beautiful day," said Mum.'},
    {wrong:'the childrens coats were wet',right:'The children\'s coats were wet.'},
    {wrong:'where are you going asked dad',right:'"Where are you going?" asked Dad.'},
    {wrong:'she brought three things a book a pen and a ruler',right:'She brought three things: a book, a pen and a ruler.'},
    {wrong:'im not sure said isla however ill try my best',right:'"I\'m not sure," said Isla; "however, I\'ll try my best."'},
    {wrong:'the dogs tail wagged happily',right:'The dog\'s tail wagged happily.'},
    {wrong:'dont forget your homework said the teacher',right:'"Don\'t forget your homework," said the teacher.'},
    {wrong:'scots language has many words haggis ceilidh loch',right:'Scots language has many words: haggis, ceilidh, loch.'},
    {wrong:'can i come too asked ewan',right:'"Can I come too?" asked Ewan.'},
    {wrong:'the ladys hat blew away in the wind',right:'The lady\'s hat blew away in the wind.'},
    {wrong:'although it rained we still had fun',right:'Although it rained, we still had fun.'},
    {wrong:'thats not fair shouted the boy',right:'"That\'s not fair!" shouted the boy.'},
    {wrong:'the schools playground was covered in snow',right:'The school\'s playground was covered in snow.'},
    {wrong:'they needed supplies food water and blankets',right:'They needed supplies: food, water and blankets.'}
  ]
};

export const SENTENCES: Record<PunctLevel, string[]> = {
  1: ['The cat sat on the mat.','I can see a big dog.','Mum and dad went to the shop.','The sun is hot today.','I like to play in the park.','The fish swam in the pond.','We had fun at the beach.','The bus was red and big.','My hat is on my head.','She ran to the top of the hill.','The bird sat in the tree.','I can read my new book.','Dad got a cup of tea.','The frog can hop and jump.','We went to see the ducks.'],
  2: ['The children played in the school playground after lunch.','Isla found a beautiful shell on the sandy beach.','The old castle stood on top of the green hill.','We took the train from Glasgow to Edinburgh.','The farmer fed the sheep on the hillside.','My gran makes the best soup in the whole village.','The lighthouse keeper watched the stormy sea all night.','A red deer ran across the field near our house.','The bagpipes could be heard from across the loch.','We had fish and chips by the harbour wall.','The snow covered the mountains like a white blanket.','Ewan and Isla walked along the shore of the loch.','The Highland Games are the best day of the year.','She wore a kilt with a velvet jacket.','The boat sailed across the calm blue water.'],
  3: ['Although it was raining heavily, the children still enjoyed their walk through the forest.','The ancient castle, which had stood for eight hundred years, attracted visitors from around the world.','Edinburgh is the capital of Scotland and is famous for its beautiful architecture.','The fisherman carefully steered his boat through the dangerous rocks near the shore.','After climbing for four hours through thick cloud, they finally reached the summit of Ben Nevis.','The Highland dancers performed brilliantly at the competition, despite the strong wind.','Many different species of wildlife can be found on the remote islands of Scotland.','The teacher explained that Robert Burns is considered the national poet of Scotland.','Celebrations took place across the country when the new bridge was finally completed.','The mysterious sound echoed through the valley, and nobody could explain where it came from.','Scientists discovered that the ancient stone circle was over five thousand years old.','The community worked together to rebuild the village hall after the terrible storm.','Although he was nervous about performing, Finn played his fiddle beautifully at the ceilidh.','The expedition set off early in the morning before the weather conditions deteriorated.','Queen Margaret built a tiny chapel on the castle rock, which still stands today.']
};
