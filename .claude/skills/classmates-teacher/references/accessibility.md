# Accessibility Requirements

## WCAG AA Minimum

All teacher features must meet WCAG 2.1 AA:

### Colour Contrast
- Normal text: 4.5:1 ratio minimum
- Large text (18px+ bold, 24px+ regular): 3:1 ratio
- UI components and borders: 3:1 ratio
- Don't rely on colour alone to convey information

### Keyboard Navigation
- All interactive elements focusable with Tab
- Logical tab order (follows visual layout)
- Enter/Space activates buttons
- Escape closes modals/dropdowns
- Arrow keys navigate within components (menus, tabs)
- No keyboard traps

### Screen Readers
- All images have alt text (or aria-hidden if decorative)
- Form inputs have associated labels
- Buttons have descriptive text (not just icons)
- Dynamic content changes announced via aria-live
- Tables have proper headers (th elements)
- Radix UI components handle ARIA automatically

### Focus Management
- Visible focus indicators on all interactive elements
- Focus moves to modal when opened
- Focus returns to trigger when modal closes
- Skip to main content link (if needed)

### Forms
- All inputs labelled
- Error messages associated with inputs (aria-describedby)
- Required fields indicated
- Validation errors announced

## Practical Checklist

- [ ] Tab through entire page — can you reach everything?
- [ ] Use with VoiceOver/NVDA — is all content announced?
- [ ] Increase text to 200% — does layout still work?
- [ ] Turn off CSS — is content still readable?
- [ ] Use only keyboard — can you complete all tasks?
- [ ] Check contrast with browser dev tools

## Radix UI Helps

Radix primitives are accessible by default:
- Dialog: focus trap, Escape to close, aria attributes
- AlertDialog: same + prevents accidental dismiss
- Tooltip: keyboard accessible, proper ARIA
- DropdownMenu: arrow key navigation, type-ahead

Always use Radix for these patterns instead of building custom.
