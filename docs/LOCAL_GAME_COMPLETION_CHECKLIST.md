# Local Game Completion Checklist

Use this checklist before beginning online multiplayer work.

## Core Modes

- [ ] Start Screen buttons route correctly: Tutorial / Local Duel / Rules / Player vs AI (Easy/Normal)
- [ ] Online Duel remains disabled/Coming Soon
- [ ] Rules screen content is readable and return navigation works

## Tutorial

- [ ] All lessons load and can be completed in order
- [ ] Failure blocks progression until Retry
- [ ] Retry and Next Lesson behave correctly
- [ ] Back to Start and Skip to Local Duel work
- [ ] No audio spam during repeated resolve/retry loops

## Local Duel (Pass-and-Play)

- [ ] Pass-device overlay appears at the correct phase
- [ ] P1 action remains hidden before P2 confirm
- [ ] Resolve output, summary, and battle log align with game state
- [ ] Reset match and rematch flow both return to clean round one

## Player vs AI

- [ ] Easy starts and resolves correctly
- [ ] Normal starts and resolves correctly
- [ ] AI thinking delay appears before resolve
- [ ] AI action is revealed only after resolve
- [ ] Rematch and Back to Start both work from game over

## Audio

- [ ] Master Audio toggle controls all audio
- [ ] Music toggle controls only BGM
- [ ] SFX toggle controls UI/combat/end sounds
- [ ] End stinger plays once and stops on rematch/back/start/mute
- [ ] BGM resumes correctly when enabled and interaction has occurred

## Animation and Feedback

- [ ] CombatReveal plays once per resolved round
- [ ] Damage float and stagger feedback remain readable
- [ ] HP updates and game-over transition feel consistent

## Mobile and Layout

- [ ] Start/Tutorial/Battle screens remain usable on narrow viewport
- [ ] Key buttons remain visible and tappable (resolve/rematch/back)
- [ ] Audio settings controls remain readable in compact header areas

## Build and Quality

- [ ] `npm test` passes
- [ ] `npm run build` passes
- [ ] No accidental generated files staged
- [ ] Asset credits doc updated: `docs/ASSET_CREDITS.md`

## Known Limitations

- [ ] AI uses simple weighted heuristics (not adaptive learning)
- [ ] No online multiplayer
- [ ] No persistence backend / account system
