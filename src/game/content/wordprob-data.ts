/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

// Ported from classmates/src/scripts/games/word-problems.js
// All content exactly preserved.

export interface WordProblem {
  q: string;
  a: number;
}

export type WordProbLevel = 1 | 2 | 3;

export const WORD_PROBLEMS: Record<WordProbLevel, WordProblem[]> = {
  1:[
    {q:'Isla has 8 apples. She gives 3 to her friend. How many does she have left?',a:5},
    {q:'Ewan has 4 toy cars. He gets 5 more for his birthday. How many does he have now?',a:9},
    {q:'There are 7 ducks on the pond. 2 fly away. How many are left?',a:5},
    {q:'Mum bakes 6 scones. Dad eats 2. How many scones are left?',a:4},
    {q:'Finn has 3 red crayons and 4 blue crayons. How many crayons does he have altogether?',a:7},
    {q:'There are 10 children in the playground. 6 go inside. How many are still outside?',a:4},
    {q:'Gran gives Isla 5p and Grandad gives her 3p. How much does she have?',a:8},
    {q:'A hen lays 2 eggs on Monday and 3 eggs on Tuesday. How many eggs altogether?',a:5},
    {q:'Ben has 9 stickers. He loses 4. How many does he have now?',a:5},
    {q:'There are 6 fish in the tank. 3 more are added. How many fish are there now?',a:9},
    {q:'Sam picks 5 flowers. Mia picks 4 flowers. How many flowers altogether?',a:9},
    {q:'A bus has 8 people. 3 get off at the next stop. How many are on the bus now?',a:5}
  ],
  2:[
    {q:'A bus has 24 passengers. At the next stop, 7 get off and 12 get on. How many passengers now?',a:29},
    {q:'Isla has 15 sweets. She gives 4 to Ewan and 3 to Finn. How many does she have left?',a:8},
    {q:'There are 18 books on the shelf. The teacher adds 7 more. How many books altogether?',a:25},
    {q:'A farmer has 12 sheep. He buys 8 more then sells 5. How many does he have?',a:15},
    {q:'Mum spends 35p on milk and 20p on bread. How much change from \u00A31?',a:45},
    {q:'There are 3 rows of chairs with 6 chairs in each row. How many chairs altogether?',a:18},
    {q:'A train has 45 passengers. 12 get off and 8 get on. How many passengers now?',a:41},
    {q:'Ewan reads 14 pages on Monday and 19 pages on Tuesday. How many pages altogether?',a:33},
    {q:'A box holds 20 eggs. 7 are brown and the rest are white. How many white eggs?',a:13},
    {q:'Isla has 50p. She buys a pencil for 15p and a rubber for 10p. How much money does she have left?',a:25},
    {q:'There are 16 children in the class. Half of them are boys. How many girls are there?',a:8},
    {q:'Dad drives 25 miles to work and 25 miles home. How many miles does he drive in 3 days?',a:150}
  ],
  3:[
    {q:'A school has 3 classes. Each class has 28 pupils. How many pupils altogether?',a:84},
    {q:'Isla saves \u00A32.50 each week. How much will she have after 4 weeks?',a:10},
    {q:'A rectangle is 12cm long and 5cm wide. What is its perimeter?',a:34},
    {q:'A baker makes 144 rolls and packs them into bags of 6. How many bags does he fill?',a:24},
    {q:'There are 365 days in a year. How many days in 2 years?',a:730},
    {q:'A bus journey takes 45 minutes. If the bus leaves at 2:15, what time does it arrive? Give the minutes past 3.',a:0},
    {q:'Ewan buys 3 books at \u00A34.50 each. How much change from \u00A320? Answer in whole pounds.',a:6},
    {q:'A swimming pool is 25 metres long. Isla swims 8 lengths. How many metres does she swim?',a:200},
    {q:'A recipe needs 250g of flour to make 10 biscuits. How many grams for 30 biscuits?',a:750},
    {q:'The temperature at midnight was -3\u00B0C. By noon it had risen by 11 degrees. What was the temperature at noon?',a:8},
    {q:'A square field has sides of 15 metres. What is its area in square metres?',a:225},
    {q:'Finn has \u00A35. He buys 3 pens at 85p each. How much change in pence?',a:245}
  ]
};
