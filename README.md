# NEXUS

A private pixel-art budgeting adventure built from the supplied design. The original PNG is reused as an art atlas; all financial text, navigation, buttons, bars, and dialogs are live interface elements. A completed bedroom image fills the space behind the live menu. The original art is layered over the right side to preserve the character, dog, and existing room exactly. The image and dog hit area use a shared scene offset; the hit area is positioned at the original dog coordinates, not percentages of the room. Small screens use a compact menu above the room.

## Features

- Income and expense ledger with edits, deletion, category budgets, and monthly reports.
- Savings allocations with balance checks, contributions, and releases.
- Daily quests, experience, levels, optional reward sounds, and a clickable companion.
- Vehicles, mileage, running costs, maintenance, and upcoming bills/events.
- Account-scoped D1 saves with optimistic concurrency checks and server-side validation.
- Demo data, JSON export, and an explicitly confirmed fresh start.

Money is stored as integer euro cents. Wallet is total income minus total expenses. Savings are allocations within the wallet. Spending can put existing allocations over the wallet balance; the Goals view calls this out and offers releases. Transactions are manually entered; there is no bank integration. Daily quests use UTC dates. Initial demo goals use modest illustrative targets rather than vehicle purchase prices.

## Development

```sh
npm install
npm run db:generate
npm run build
npx wrangler d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_lumpy_talon.sql
npm run dev
```

Apply the initial migration only once per local database. Visit the printed local URL; the Sites local sign-in supplies a development identity. Production sign-in and private access are handled by Sites. Production migrations are included in the deployment archive.

## Validation

```sh
node --test tests/game.test.mjs
npx tsc --noEmit
npm run build
```

The model tests cover reconciliation, transaction edits/deletion, cent arithmetic, duplicate XP prevention, savings allocation limits, validation without mutation, bill completion, and reset confirmation. HTTP checks cover authenticated save loading, unauthenticated access, cross-origin rejection, invalid input, and stale revisions. Browser visual and interaction tests have not been run. The provided browser screenshot was used to correct the duplicated reference menu.

Optional WebMCP tools `read_budget` and `add_transaction` share the live state and save action. They are registered only after the save loads. Their browser contract has not been verified because no supported WebMCP validation context was established.

The character does not have a walk-cycle sprite sheet. Game behavior is driven by quests, XP, levels, sound, companion dialogue, and savings progress.

## Room artwork

`public/art/room-completed.png` was produced with the built-in imagegen tool at 1536 × 1024. Only its completed left room region is exposed; original right-side artwork remains on top.

Final generation prompt:

> Use case: precise-object-edit. Input image 1 is the EDIT TARGET, a 1536x1024 pixel-art budgeting app screenshot. Remove ONLY the left navigation menu panel, including its border, occupying approximately x20 through x290, y54 through y573 (coordinates from top-left). Inpaint ONLY this rectangular menu region with a seamless continuation of the cozy bedroom already visible immediately to its right. Continue the muted green bedroom wall in the upper portion; logically complete the bed whose exposed right side currently appears around x290..398, y235..475, extending its mattress, dark bedding and bed frame leftward behind the removed panel; continue the warm horizontal wood floor toward the bottom. Match the existing pixel-art style 1:1, including pixel scale, crisp stair-step edges, muted palette, texture, perspective, lighting, and shading. Treat all pixels outside this navigation panel rectangle as protected: preserve the entire canvas exactly at 1536x1024, preserve all other UI text, panels, icons, borders and art in their current locations, and preserve the visible bedroom to the right x292..780 y43..590, especially the existing dark-haired character and German shepherd, without redrawing, moving, changing or duplicating them. No new characters or animals. No replacement UI or menu. No extra text. The sole change is revealing the room behind the removed left navigation panel. Output the full original screenshot with that one area completed.
