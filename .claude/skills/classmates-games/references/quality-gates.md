# Quality Gates Checklist

Every game must pass ALL of these before shipping.

## Functional
- [ ] Game loads without console errors
- [ ] All questions display correctly
- [ ] Correct/wrong answer detection works
- [ ] Score tallies correctly
- [ ] Stars calculated: >=30%=1, >=60%=2, >=90%=3
- [ ] recordGameResult() called on completion
- [ ] Results appear in Dexie (check IndexedDB)

## Visual
- [ ] Premium aesthetic (not plain HTML buttons)
- [ ] Consistent with Classmates design language
- [ ] Animations are smooth (Motion for React, tweens for Phaser)
- [ ] No placeholder text or lorem ipsum
- [ ] Copyright header on every file

## Audio
- [ ] AudioEngine imported and initialised
- [ ] SFX plays on correct answer
- [ ] SFX plays on wrong answer
- [ ] Streak SFX at milestones (3, 5, 10)
- [ ] Completion fanfare
- [ ] Audio respects mute toggle

## Mobile
- [ ] Touch controls work (tap, swipe as needed)
- [ ] Layout fits 375px width minimum
- [ ] Buttons/targets are at least 44px tap area
- [ ] No mouse-only interactions
- [ ] No hover-dependent UI

## Performance
- [ ] 60fps during gameplay
- [ ] Initial load <3 seconds (excluding WASM)
- [ ] No memory leaks (timers cleaned up in useEffect returns)
- [ ] Code-split (lazy loaded, not in initial bundle)

## Curriculum
- [ ] CfE level tagged (early/first/second)
- [ ] CfE outcomes identified
- [ ] Content appropriate for target age group
- [ ] Scottish context where relevant

## Integration
- [ ] Added to Home.tsx QUIZ_GAMES or loaded via iframe
- [ ] Lazy import in Home.tsx
- [ ] Icon assigned in GAME_ICONS (Lucide)
- [ ] Added to correct category (Literacy/Numeracy/Geography/Challenge)
- [ ] Build passes: npm run build
