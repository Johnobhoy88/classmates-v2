// Ported from classmates/src/scripts/games/grammar.js
// All content exactly preserved.

export interface GrammarEntry {
  w: string;
  a: string;
  opts: string[];
}

export type GrammarLevel = 1 | 2 | 3;

export const GRAMMAR_DATA: Record<GrammarLevel, GrammarEntry[]> = {
  1:[
    {w:'dog',a:'Noun',opts:['Noun','Verb','Adjective']},
    {w:'run',a:'Verb',opts:['Noun','Verb','Adjective']},
    {w:'cat',a:'Noun',opts:['Noun','Verb','Adjective']},
    {w:'jump',a:'Verb',opts:['Noun','Verb','Adjective']},
    {w:'book',a:'Noun',opts:['Noun','Verb','Adjective']},
    {w:'eat',a:'Verb',opts:['Noun','Verb','Adjective']},
    {w:'tree',a:'Noun',opts:['Noun','Verb','Adjective']},
    {w:'swim',a:'Verb',opts:['Noun','Verb','Adjective']},
    {w:'ball',a:'Noun',opts:['Noun','Verb','Adjective']},
    {w:'sing',a:'Verb',opts:['Noun','Verb','Adjective']}
  ],
  2:[
    {w:'happy',a:'Adjective',opts:['Noun','Verb','Adjective']},
    {w:'quickly',a:'Adverb',opts:['Adjective','Adverb','Noun']},
    {w:'beautiful',a:'Adjective',opts:['Noun','Verb','Adjective']},
    {w:'slowly',a:'Adverb',opts:['Adjective','Adverb','Verb']},
    {w:'enormous',a:'Adjective',opts:['Noun','Adjective','Verb']},
    {w:'carefully',a:'Adverb',opts:['Adjective','Adverb','Noun']},
    {w:'brave',a:'Adjective',opts:['Noun','Verb','Adjective']},
    {w:'loudly',a:'Adverb',opts:['Adjective','Adverb','Verb']},
    {w:'gentle',a:'Adjective',opts:['Noun','Adjective','Adverb']},
    {w:'silently',a:'Adverb',opts:['Adjective','Adverb','Noun']}
  ],
  3:[
    {w:'under',a:'Preposition',opts:['Preposition','Conjunction','Adjective']},
    {w:'because',a:'Conjunction',opts:['Preposition','Conjunction','Adverb']},
    {w:'although',a:'Conjunction',opts:['Preposition','Conjunction','Adjective']},
    {w:'between',a:'Preposition',opts:['Preposition','Conjunction','Noun']},
    {w:'however',a:'Conjunction',opts:['Preposition','Conjunction','Adverb']},
    {w:'behind',a:'Preposition',opts:['Preposition','Verb','Adjective']},
    {w:'therefore',a:'Conjunction',opts:['Preposition','Conjunction','Adverb']},
    {w:'through',a:'Preposition',opts:['Preposition','Conjunction','Verb']},
    {w:'meanwhile',a:'Conjunction',opts:['Preposition','Conjunction','Adjective']},
    {w:'beside',a:'Preposition',opts:['Preposition','Conjunction','Noun']}
  ]
};
