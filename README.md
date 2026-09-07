# NEXUS

A private pixel-art budgeting adventure built from the supplied design. The original PNG is reused as an art atlas; all financial text, navigation, buttons, bars, and dialogs are live interface elements. The room artwork is clipped so its original navigation is not visible behind the real menu.

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

The supplied art remains a single static image atlas; the character does not have a walk-cycle sprite sheet. Game behavior is driven by quests, XP, levels, sound, companion dialogue, and savings progress.
