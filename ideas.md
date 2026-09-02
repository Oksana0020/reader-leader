# Reader Leader — Reference-Led Design Specification

## Ground-Truth Reference

The five supplied PNG screens are the binding visual specification for this implementation. The student journey must preserve their warm cream background, oversized teal reading typography, mustard-gold emphasis, soft white cards, large rounded controls, and playful illustration-led hierarchy. The educator journey must preserve its off-white analytical canvas, near-navy typography, teal controls, mint/aqua/amber status surfaces, compact metrics, rounded white panels, and responsive mobile or desktop navigation. Fidelity to the supplied composition overrides generic design-system conventions.

The source PNGs will not be reopened for additional inspection. Implementation decisions will be based on the references already present in the task context and the explicit product requirements.

## Reference-Led Design Movement

**Design movement:** Contemporary British primary-learning interface design, combining friendly storybook tactility with calm clinical assessment tooling.

## Core Principles

1. Student screens are emotionally warm, visually simple, and dominated by one clear reading action at a time.
2. Educator screens are information-dense without feeling institutional, using colour and spacing to reveal intervention priorities quickly.
3. Rounded geometry, low-contrast depth, and bold readable type are functional accessibility decisions rather than decoration.
4. Feedback remains supportive and restrained: amber offers help, teal confirms progress, and red is reserved for educator review rather than child-facing judgement.

## Colour Philosophy

The ownable brand colour is **Reader Teal** (`#278B8F`), used for primary student guidance, educator actions, and active navigation. Warm cream (`#FBF8EE`) reduces visual glare during read-aloud work, while mustard gold (`#D9AB36`) communicates progress and celebration. Near navy (`#071536`) anchors educator data. Mint, aqua, amber, coral, pink, green, and yellow are used as semantic accents that mirror the reference book bands and insight cards.

## Layout Paradigm

Student pages use a vertically staged portrait composition: orientation/navigation at the top, a dominant focal card or celebration object in the centre, and oversized controls near the thumb zone. The library uses horizontally clipped card rails to suggest more stories without crowding the viewport. Educator pages use compact metric clusters, wide running-record text, side-by-side evidence panels on desktop, and bottom navigation on mobile.

## Signature Elements

The recurring motifs are outlined star progress indicators, pill-shaped phonics labels, low soft card shadows, amber current-word emphasis, and rounded teal/gold action buttons with subtle lower-edge depth.

## Interaction Philosophy

Interactions should feel immediate, reassuring, and deliberate. Student controls provide generous touch targets and avoid punitive error animation. The microphone communicates listening through restrained concentric movement. Educator overrides require a confirmatory second click, making professional judgement explicit and auditable.

## Animation

Use 100–180 ms press feedback on controls, 160–220 ms tooltip and state transitions, and a gentle microphone glow during active listening. Celebration elements may enter with a short staggered rise and fade. Animate only `transform` and `opacity`; all non-essential motion must respect `prefers-reduced-motion`.

## Typography System

Use a rounded, highly legible student display family paired with a readable sentence face, and a compact modern sans family for educator data. Student headings and story names use heavy weights; reading text uses an oversized scale with generous line height. Educator headings use bold near-navy type, while table data and helper text remain compact but never fall below accessible reading sizes.

## Brand Essence

**Reader Leader is a calm, evidence-aware fluency companion for early readers and the educators who support them.** Personality: encouraging, observant, trustworthy.

## Brand Voice

Student headlines are short, celebratory, and concrete; calls to action use direct verbs. Educator microcopy is factual and non-judgemental. Example student line: **“Brilliant reading!”** Example educator line: **“Review the attempt, then confirm your judgement.”**

## Wordmark and Mark

The wordmark uses a bespoke-feeling rounded treatment with a star/soundwave mark that connects reading progress with spoken fluency. The symbol must remain clearly visible in headers and favicon contexts rather than appearing as a tiny decorative detail.

## Phonics Restraint Decision

For **“knight,”** `/n-aɪ-t/` is correct reading behaviour because the initial `k` is silent. It must trigger no cue, no flag, and a 0% penalty. The educator-review demonstration flags only an attempt in which the child **sounds out the silent `k`**, shown as `/k-n-aɪ-t/`, with the explanation: **“Child sounded out the silent ‘k’ (pronounced as /k-n-aɪ-t/).”**

## File-Level Reminder

Every page, component, and stylesheet added for this project must begin with a brief comment naming the relevant reference-led rule: student warmth and single-action clarity, educator evidence hierarchy, or the shared teal/cream/gold visual language. Any styling choice that weakens fidelity to the five references should be rejected.
