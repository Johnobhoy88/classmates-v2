# QuizEngine Reference

Located: `src/components/shared/QuizEngine.tsx` (291 lines)

## Usage

```tsx
import { QuizEngine } from '../shared/QuizEngine';

const questions = data.map(item => ({
  prompt: 'What is 3 + 5?',      // Question text
  display: '3 + 5 = ?',           // Large display (optional)
  displayHtml: '<svg>...</svg>',   // HTML display (shapes, flags)
  answer: '8',                     // Correct answer
  options: ['6', '7', '8', '9'],   // 4 shuffled options
}));

<QuizEngine
  gameId="maths"
  title="Maths"
  subtitle="Number crunching"
  color="#10b981"
  icon="1+2"
  questions={questions}
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| gameId | string | Yes | Unique ID for progress tracking |
| title | string | Yes | Results screen title |
| subtitle | string | No | Results screen subtitle |
| color | string | Yes | Hex colour for themed UI |
| icon | string | Yes | Emoji/text for results |
| questions | QuizQuestion[] | Yes | Array of questions |
| adaptiveTopic | string | No | Skill tracking |
| correctDelay | number | No | ms delay on correct (default 500) |
| wrongDelay | number | No | ms delay on wrong (default 1000) |

## Scoring

- Stars: >=30% = 1, >=60% = 2, >=90% = 3
- Streak tracked per session
- Results saved via recordGameResult() to Dexie -> Supabase

## Content Data Files

Located in `src/game/content/`:
- spelling-data.ts (124 words, 3 levels)
- maths-data.ts (procedural generation)
- grammar-data.ts, vocab-data.ts, phonics-data.ts, etc.
- geography-data.ts (200+ questions)
- reading-data.ts (18 stories with comprehension)
- Total: 15 files, ~1,700 lines of curriculum content
