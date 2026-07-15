# COC7 Forbidden Manuscript Layout — Design QA

## Comparison target

- Source visual truth: `/var/folders/h6/d_tp0hcj19985v2b3lhxdvzh0000gn/T/codex-clipboard-a3db4bab-06a9-46ae-bede-ad7f48eaee02.png`
- Supplied texture source: `/Users/user/.codex/generated_images/019ebfe0-eb68-7b33-a21a-77f0a43c636f/exec-f87d07e9-056f-40da-8d2a-69b3acc208c7.png`
- Desktop edit implementation: `/tmp/coc7-edit-rounded-desktop-top.png`
- Desktop detail implementation: `/tmp/coc7-detail-rounded-desktop.png`
- Mobile edit implementation: `/tmp/coc7-edit-rounded-mobile.png`
- Mobile skills implementation: `/tmp/coc7-edit-rounded-mobile-skills.png`
- Mobile detail implementation: `/tmp/coc7-detail-rounded-mobile.png`
- Focused reference crop: `/tmp/coc7-reference-attribute-focus.png`
- Focused implementation crop: `/tmp/coc7-implementation-attribute-focus.png`
- Desktop viewport: 1487 × 1058
- Mobile viewport: 390 × 844
- State: authenticated COC7 edit/detail views with persisted character data loaded and no form submission

## Full-view comparison evidence

The source and the final desktop edit screenshot were opened together at original resolution with `view_image`. The opening composition now follows the selected layout: investigator archive and identity fields on the left, a vertical attribute ledger and status values on the right, and later skill/equipment/background sections spanning the full work surface. The detail view reuses the same left-identity/right-attributes hierarchy.

The source's near-black manuscript field, bottle-green surfaces, thin copper rules, serif section hierarchy, warm ivory text, real edge astronomy texture, and restrained lack of elevation are preserved. All formerly square information boxes now use a consistent 6px control/cell radius or 8px panel/table radius.

Intentional deviations:

- The global navbar remains the application's existing light navbar because it is explicitly outside scope.
- The mockup's six-item internal navigation, custom brand mark, and save icon were not introduced because they would add navigation/copy and alter the existing flow.
- Existing COC7 fields, live data, and field order are preserved. The retained random-attribute control and the additional existing status fields make the right column slightly denser than the static mockup.

Above-the-fold copy diff: no business-field copy was invented or renamed. The four attribute column headings match the selected reference; existing explanatory copy remains available in the DOM and on mobile, while the desktop table uses the reference's compact presentation.

## Focused comparison evidence

The reference and implementation attribute regions were cropped to equal 650 × 670 views and opened together with `view_image`.

- Fonts and typography: section headings use the Chinese Song type stack; controls and body copy use the existing Chinese sans-serif stack. Sizes are fixed, tracking remains zero, and the dense attribute labels stay legible.
- Spacing and layout rhythm: desktop uses a 0.94fr/1.06fr opening grid, a thin central copper divider, compact four-column attribute rows, and full-width downstream sections. Rounded rows intentionally replace the source's flat separators per the user's follow-up.
- Colors and tokens: near-black, deep green, oxidized green, copper/gold, wine, ivory, and warm-gray states match the selected direction. No gradients, purple, glow, or decorative CSS imagery are present.
- Image quality and asset fidelity: the supplied bitmap texture is used as the real page background and remains at the outer edges; no CSS/SVG substitute was introduced.
- Copy and content: current application labels and persisted character data remain unchanged; only presentation wrappers and the reference-matching attribute header were added.
- Controls and accessibility: editable, readonly, disabled, focus, checkbox, dropdown, warning, error, table, and mobile-card states keep clear contrast. Readonly inputs remain `readOnly`, use a distinct dashed border, and retain ivory text.
- Responsive behavior: at 390px the desktop attribute header is hidden, attributes return to rounded mobile cards, skill tables use their existing mobile card UI, and edit/detail document widths remain exactly 390px without page-level horizontal scrolling.
- Theme isolation: the COC7 texture is absent from `/characters` and `/characters/new/dnd5e`; the shared navbar and non-COC routes retain their original styling.

## Interaction and console evidence

- Occupation combobox expanded and closed successfully; the dark listbox stayed inside the 390px viewport.
- Skill category changed from `调查与感知` to `社交与语言` and reported `aria-selected="true"`.
- `取悦本职技能` changed from unchecked to checked.
- Random attributes changed all nine displayed attribute values.
- Name-input focus computed to the oxidized-green border/outline; 11 readonly fields remained non-editable with distinct high-contrast surfaces.
- Reload restored persisted `STR 80` and the default skill category without saving.
- Final fresh desktop edit, desktop detail, mobile edit, and mobile detail sessions had no Next.js overlay and no console warnings/errors.

## Comparison history

1. P2: attributes were a three-column card grid rather than the reference's ledger. Fix: added a desktop four-column header and nine vertical attribute rows while preserving the mobile card layout. Post-fix evidence: `/tmp/coc7-edit-rounded-desktop-top.png` and the focused crops above.
2. P2: several panels, attribute rows, occupation summaries, detail fields, and table wrappers were explicitly square. Fix: introduced scoped 6px/8px radius tokens, restored full copper borders, and applied them across edit/detail controls and mobile skill cards. Post-fix evidence: all final screenshots above.
3. P2: the initial right column was too tall to reveal the status region in the reference-sized viewport. Fix: compacted only the desktop attribute presentation, kept explanatory text accessible, and arranged existing status fields into a dense six-column grid. Post-fix evidence: `/tmp/coc7-edit-rounded-desktop-top.png`.
4. P2: the desktop attribute header could have forced mobile overflow. Fix: limited ledger behavior to `min-width: 1200px`, hid the header below that breakpoint, and verified 390px `scrollWidth === clientWidth`. Post-fix evidence: `/tmp/coc7-edit-rounded-mobile.png` and `/tmp/coc7-edit-rounded-mobile-skills.png`.

No actionable P0, P1, or P2 findings remain. The unchanged global navigation and retained live form controls are expected scope constraints, not fidelity defects.

final result: passed
