# Scottish Curriculum for Excellence (CfE) Reference

## CfE Levels (map to primary stages)

| Level | Stages | Ages |
|-------|--------|------|
| Early | P1 | 4-5 |
| First | P2-P4 | 5-8 |
| Second | P5-P7 | 8-12 |

## Key Curriculum Areas

### Literacy & English (LIT/ENG)
- LIT 1-02a: Listening and talking
- LIT 1-07a: Finding and using information
- LIT 1-11a: Creating texts
- LIT 1-13a: Spelling (knowledge of spelling patterns)
- LIT 1-21a: Reading (word recognition, phonics)
- ENG 1-12a: Grammar and punctuation
- ENG 1-17a: Vocabulary

### Numeracy & Mathematics (MNU/MTH)
- MNU 1-01a: Number and number processes (counting, ordering)
- MNU 1-02a: Addition and subtraction
- MNU 1-03a: Multiplication and division
- MNU 1-07a: Fractions, decimals, percentages
- MNU 1-09a: Money
- MNU 1-10a: Time
- MTH 1-06a: Number patterns and sequences
- MTH 1-13a: Measurement
- MTH 1-16a: 2D shapes and 3D objects

### Social Studies (SOC)
- SOC 1-12a: People, place, environment (geography)
- SOC 1-14a: People, past events, societies (history)

### Health & Wellbeing (HWB)
- HWB 1-01a: Mental and emotional wellbeing
- HWB 1-02a: Social wellbeing
- HWB 1-03a: Physical wellbeing

## Tagging Games

Every game should have CfE metadata:

```tsx
// In the game component or a separate mapping file
const CfE = {
  gameId: 'spelling',
  level: 'first',
  area: 'literacy',
  outcomes: ['LIT 1-13a', 'LIT 1-21a'],
  description: 'Spelling common words using phonics knowledge'
};
```

## Current Game Mappings (to be implemented)

| Game | CfE Outcomes |
|------|-------------|
| Spelling | LIT 1-13a, LIT 1-21a |
| Phonics | LIT 1-21a |
| Grammar | ENG 1-12a |
| Vocabulary | ENG 1-17a |
| Maths | MNU 1-02a, MNU 1-03a |
| Number Bonds | MNU 1-02a |
| Times Tables | MNU 1-03a |
| Fractions | MNU 1-07a |
| Money | MNU 1-09a |
| Telling Time | MNU 1-10a |
| Shapes | MTH 1-16a |
| Measurement | MTH 1-13a |
| Geography | SOC 1-12a |
| Reading | LIT 1-07a, LIT 1-21a |
