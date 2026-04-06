export interface VocabEntry {
  word: string;
  definition: string;
  options: string[];
}

export const VOCAB: VocabEntry[][] = [
  // Level 1
  [
    { word: 'happy', definition: 'Feeling glad and joyful', options: ['happy', 'angry', 'tired', 'hungry'] },
    { word: 'brave', definition: 'Not afraid of danger', options: ['brave', 'lazy', 'quiet', 'small'] },
    { word: 'tiny', definition: 'Very very small', options: ['tiny', 'huge', 'fast', 'loud'] },
    { word: 'shiny', definition: 'Bright and sparkling', options: ['shiny', 'dull', 'rough', 'soft'] },
    { word: 'kind', definition: 'Being nice and helpful to others', options: ['kind', 'mean', 'slow', 'tall'] },
    { word: 'scared', definition: 'Feeling afraid or frightened', options: ['scared', 'happy', 'calm', 'sleepy'] },
    { word: 'fast', definition: 'Moving with great speed', options: ['fast', 'slow', 'warm', 'wet'] },
    { word: 'loud', definition: 'Making a lot of noise', options: ['loud', 'quiet', 'soft', 'small'] },
    { word: 'cold', definition: 'Having a low temperature', options: ['cold', 'hot', 'dry', 'dark'] },
    { word: 'empty', definition: 'Having nothing inside', options: ['empty', 'full', 'heavy', 'round'] },
  ],
  // Level 2
  [
    { word: 'enormous', definition: 'Extremely large in size', options: ['enormous', 'miniature', 'average', 'narrow'] },
    { word: 'ancient', definition: 'Very old, from long ago', options: ['ancient', 'modern', 'recent', 'young'] },
    { word: 'curious', definition: 'Wanting to know or learn about something', options: ['curious', 'bored', 'afraid', 'angry'] },
    { word: 'fragile', definition: 'Easily broken or damaged', options: ['fragile', 'strong', 'heavy', 'rough'] },
    { word: 'generous', definition: 'Willing to give and share with others', options: ['generous', 'selfish', 'careful', 'quiet'] },
    { word: 'habitat', definition: 'The natural home of an animal or plant', options: ['habitat', 'weather', 'season', 'ocean'] },
    { word: 'nocturnal', definition: 'Active at night', options: ['nocturnal', 'diurnal', 'aquatic', 'tropical'] },
    { word: 'predator', definition: 'An animal that hunts other animals for food', options: ['predator', 'herbivore', 'insect', 'fossil'] },
    { word: 'camouflage', definition: 'Colours or patterns that help animals hide', options: ['camouflage', 'migration', 'hibernation', 'pollution'] },
    { word: 'transparent', definition: 'See-through, you can look through it', options: ['transparent', 'opaque', 'colourful', 'magnetic'] },
  ],
  // Level 3
  [
    { word: 'ambitious', definition: 'Having a strong desire to succeed', options: ['ambitious', 'reluctant', 'cautious', 'humble'] },
    { word: 'consequence', definition: 'A result or effect of an action', options: ['consequence', 'coincidence', 'beginning', 'attempt'] },
    { word: 'democracy', definition: 'A system where people vote to choose their leaders', options: ['democracy', 'monarchy', 'dictatorship', 'anarchy'] },
    { word: 'empathy', definition: 'Understanding and sharing someone else\'s feelings', options: ['empathy', 'sympathy', 'apathy', 'jealousy'] },
    { word: 'hypothesis', definition: 'An educated guess that can be tested', options: ['hypothesis', 'conclusion', 'observation', 'experiment'] },
    { word: 'indigenous', definition: 'Originating naturally in a particular place', options: ['indigenous', 'imported', 'artificial', 'temporary'] },
    { word: 'sustainable', definition: 'Able to continue without causing damage', options: ['sustainable', 'destructive', 'temporary', 'expensive'] },
    { word: 'perseverance', definition: 'Continuing to try even when things are difficult', options: ['perseverance', 'surrender', 'patience', 'intelligence'] },
    { word: 'biodiversity', definition: 'The variety of living things in an area', options: ['biodiversity', 'ecosystem', 'atmosphere', 'geography'] },
    { word: 'resilient', definition: 'Able to recover quickly from difficulties', options: ['resilient', 'fragile', 'permanent', 'visible'] },
  ],
];
