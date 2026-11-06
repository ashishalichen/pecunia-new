# PECUNIA — production deployment folder

Mobile-first personal finance PWA with local-first storage, optional Google Drive backup, and the existing accounts / purchases / credit cards / debts / reports / CSV+JSON backup data model.

## Deploy to Vercel

1. Upload this folder to a private Git repository or import it into Vercel.
2. In Google Cloud Console, enable **Google Drive API** and configure an OAuth consent screen.
3. Create an OAuth client of type **Web application**. Add your production domain to Authorized JavaScript origins if required by your Google configuration. Add this exact redirect URI: `https://YOUR-DOMAIN/api/google-callback`.
4. In Vercel → Project → Settings → Environment Variables, set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `COOKIE_SECRET` for Production (and Preview only if you intend to test OAuth there). Use a long random value for `COOKIE_SECRET`.
5. Deploy, then sign in with Google. The app stores its Drive refresh token only in an encrypted, HttpOnly, Secure cookie. Finance records remain in the browser and the app's Drive backup file.

For local development, install Node.js 24 and run `npm install`, then `npx vercel dev`. Set the same environment variables in Vercel's local environment or `.env.local` (never commit `.env.local`). Google OAuth callback must use the exact origin/redirect URI of the local Vercel dev URL.

## Important notes

- Serve over HTTPS in production; the OAuth cookie is Secure.
- This is a static PWA with serverless OAuth endpoints, not a compiled Android APK.
- Google Drive sync is optional; local browser storage is used offline. Browser storage can be cleared by the user/device, so export a JSON backup periodically.
- The UI preserves the existing `midnightWealthData` localStorage key and Drive filename/schema. Category budgets are stored locally per month and category; they do not overwrite the finance backup.
- Due dates are optional metadata on credit cards. Existing backups without `dueDate` continue to load.
- Review Google OAuth consent-screen publishing and scope requirements before public release.


## Inter-account transfers

Open **Accounts & debt → Transfer money** to move funds between two asset accounts. The app validates that the source and destination differ and that the source has enough funds. It deducts the amount from the source, credits the destination, and records paired history entries. Incoming and outgoing transfer totals appear on account cards, and Reports → Monthly activity labels incoming transfers explicitly. Transfers are not counted as purchases/spending and do not change net worth. Transfer records are included in JSON backups and restored with existing backup data.


## Credit card payments and income

Credit card payments now use an in-app form with a **Paying from account** dropdown and options for **Pay full amount** or **Custom amount**. Payments validate the selected account balance and the card's outstanding amount, then reduce both balances and record a card-payment activity entry.

Use **Accounts & debt → Add income** to record salary, pocket money, freelance income, gifts, refunds, or other money received. Choose the amount, date, income type, and receiving account. This credits the account balance and records income separately from transfers and purchases. Income records and history are included in JSON exports and Drive backups.


## UI polish

The credit-card payment selector now uses accessible, theme-matched selectable cards with a custom amber radio indicator, clear titles, helper text, keyboard focus treatment, and responsive stacking on narrow screens. Removed the incoming/outgoing transfer totals from account cards; account balances and transfer history remain available.


Radio selection polish: the selected Full amount / Custom amount radio now uses a filled amber control with a dark center and a subtle amber halo, alongside the highlighted selected card.


Radio color refinement: the selected radio uses the same amber-tinted fill as the selected card, with a muted warm border instead of a solid orange fill.


## Monthly activity account details

Monthly activity now shows the destination account for income entries (e.g. “Received into: Main bank”). Both sides of an inter-account transfer show the source and destination account names (e.g. “From: Main bank → To: Savings”), so the report makes the movement traceable.


## Mobile layout refinements

On narrow screens, the redundant inline **Add purchase** button is hidden while the floating Add button remains available. The Local copy / Drive sync chip is positioned at the far right of the page-heading area, leaving the month selector more width on every page. Account and card action menus use viewport-aware fixed positioning on mobile so they do not render outside the screen.


## Final menu and purchase-button fixes

Action menus now enforce a single-open state across account and credit-card cards. On mobile, each menu is anchored beside its own three-dot trigger and clamped to the viewport so it remains visible without obscuring which card was tapped. The redundant Purchases-section “Add purchase” button is hidden on desktop as well as mobile; the single header action remains on desktop and the floating Add button remains on mobile.


## Duplicate Add Purchase correction

The Purchases-section button (`#addExpenseBtn`) is now hidden by a global CSS rule, rather than only within the mobile breakpoint. The desktop header action (`#quickAdd`) remains visible on desktop, and the floating action button remains the mobile entry point.


## Money lent (receivables)

Added a dedicated **Money lent** page in the main navigation. Record the recipient, amount, date, source account, and optional note. Each recipient has an individual card showing total lent, repaid, and outstanding amounts, with per-loan history and a **Clear debt** action for custom partial or full repayments. Repayments select the account receiving the money and record the date. Outstanding receivables are included in total assets and net worth; when lending, cash decreases as the receivable increases, and repayments move the receivable back into the selected account. Loan records are retained in local data and included in JSON/Drive backup restoration.


## Lending accounting behavior (updated)

Money lent is tracked as an outstanding amount but is not added to total assets. When a loan is recorded, the selected bank/account balance decreases, reducing net worth by the amount lent. Each repayment increases the receiving account balance, restoring net worth by the amount repaid. The outstanding total is principal lent minus repayments, across all people.


## Money lent and money owed improvements

- Money lent person cards have a **Delete person** action. Deleting removes all loan and repayment records for that person; account balances are intentionally left unchanged, as historical cash movements already occurred.
- Repayment history is collapsed inside an accordion and shown only when expanded.
- Added a **Money owed** page to track lenders, borrowed amounts, repayments, and remaining liabilities by person. Borrowing credits the selected account and adds an equal liability; repayments debit the selected account and reduce the liability. Outstanding borrowed amounts are included in total debt and net worth.
- Money owed records are included in local data and backup restore.


## Lending/borrowing card and mobile navigation polish

- Redesigned Money lent and Money owed person cards with a clear person header, three compact totals, progress bar, and vertically stacked loan/borrowing records to avoid crowded inline rows.
- Repayment history remains collapsed by default and is displayed in a tidy accordion.
- Delete on Money lent explains the outstanding amount is written off from tracking; bank balances are not changed because the money already left the account and repayments have already been credited.
- Delete on Money owed removes that person's outstanding liability, which updates total debt and net worth; account balances are not changed. This represents the remaining debt being forgiven.
- The Add purchase action is visible only on Overview and Purchases.
- Mobile bottom navigation now uses a stable four-column, two-row grid, with the floating Add button positioned above it rather than overlapping navigation.


## Reports and single-row mobile navigation

- Monthly activity now includes Money lent, lending repayments received, Money borrowed, and repayments paid toward borrowed money. Entries show the person, amount, date, receiving/paying account, and remaining balance.
- Added detailed lending/borrowing activity from the loan records themselves and excluded their corresponding balance-history rows from generic activity to avoid duplicate report entries.
- Mobile bottom navigation is now a single horizontal row with all seven destinations. Users can swipe horizontally to reach destinations that do not fit on narrow screens. The floating Add button remains above the bar and only appears on Overview and Purchases.


## Spending category moved to Purchases

- Moved the Spending by category donut/card from Reports to Purchases, above the purchase filters and transaction details.
- Removed the optional category budget editor and all budget inputs/storage behavior from the spending category component.
- Reports retains its other metrics, activity, report notes, and export functionality; only the spending category card was relocated.


## Floating Add button visibility

The floating Add Purchase button is now hidden on desktop/web layouts and displayed only at the mobile breakpoint (680px and below). Desktop users continue to use the existing header Add Purchase action on Overview and Purchases.


## Spending by Category redesign

The Purchases-page category card now uses a segmented, rounded-corner donut with a fixed colour per category (Food & Dining blue, Shopping purple, Transport yellow, Bills & Utilities red, Entertainment fuchsia, Health teal, Travel indigo, Others pink; no orange or green), a centred "Total Spent" figure, and a ranked legend showing amount and percentage. A period dropdown switches between This Month (the selected month), Last 3 Months, and This Year. The service-worker cache version was bumped to `pecunia-shell-v5` so installed PWAs pick up the change.


## Floating Add and header cleanup

The floating Add purchase button is now controlled by a `fab-on` class on `<body>`, set only while Overview or Purchases is open (mobile only). It previously stayed visible on every page on mobile because a CSS `!important` rule overrode the page-switch logic. The "YOUR FINANCIAL SPACE" label above the page title was removed.


## Donut colour palettes

The Spending by Category card has a palette button beside the period dropdown. It opens eight palettes (Vivid, Classic, Ocean, Sunset, Neon, Pastel, Berry, Forest). The choice applies instantly to the donut and legend and is remembered per device in `localStorage` (`pecuniaDonutPalette`). It is not part of the finance backup or Drive sync. Vivid is the default.


## Chart sizing and Purchases header

The donut is slightly smaller with a thicker ring. The "Purchases / Every purchase, in one place." heading was removed from the Purchases page (the page title already shows Purchases). The palette panel now closes automatically after a palette is chosen.


## Palettes without yellow/orange

All eight donut palettes (Vivid, Classic, Ocean, Rose, Neon, Pastel, Berry, Forest) no longer contain yellow, amber or orange. The former Sunset palette is now Rose (reds, pinks and magentas; its stored id is unchanged).
