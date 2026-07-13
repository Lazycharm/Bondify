# Bondify — Business Logic

## Core Loop

1. User has a wallet with a balance in UGX
2. User goes to Task Center and sees 10 bonds available at their VIP level
3. User selects a bond and pays a small **trust fee** — this assigns the bond to them
4. **Constraint**: wallet balance must remain ≥ 5,000 UGX after paying trust fee
5. User is shown 3 buyers with different offer prices for the bond
6. User must identify and select the **highest buyer** (correct answer = rank 3)
7. If wrong: user gets feedback and retries until they pick correctly
8. User signs a digital sales contract (name, phone, signature animation)
9. User claims the profit — net profit = buyer price - trust fee
10. Profit enters "Pending Payment" status → credited to wallet

## VIP System

- 10 VIP levels: Starter → Bronze → Silver → Gold → Platinum → Diamond → Emerald → Sapphire → Ruby → Crown
- Each VIP level has a `bonds_to_complete` target (must be divisible by 7)
- `bonds_per_day = bonds_to_complete / 7` (e.g., VIP 1 = 21 total / 7 days = 3/day)
- User completes their daily quota → 24-hour cooldown → next day's tasks unlock
- After completing all 7 days (bonds_to_complete bonds total) → advance to next VIP level
- Minimum wallet balance of 5,000 UGX must be maintained at all times

## Upgrade Teaser

- Starting from **Day 4** of the 7-day cycle, one bond from the NEXT VIP level is shown
- It's locked (cannot be purchased at current VIP) with an amber "Upgrade" button
- Clicking navigates to VIP Levels page

## Bond Economics (per VIP level)

| VIP | Name | Trust Fee Range | Max Profit | Bonds/Day |
|-----|------|-----------------|------------|-----------|
| 1 | Starter | 1,800–3,000 | up to 9,000 | 3 |
| 2 | Bronze | 7,500–12,000 | up to 36,000 | 4 |
| 3 | Silver | 20,000–30,000 | up to 90,000 | 5 |
| 4 | Gold | 55,000–88,000 | up to 264,000 | 6 |
| 5 | Platinum | 130,000–210,000 | up to 630,000 | 7 |
| 6 | Diamond | 320,000–540,000 | up to 1,620,000 | 8 |
| 7 | Emerald | 780,000–1,300,000 | up to 3,900,000 | 9 |
| 8 | Sapphire | 1,850,000–3,200,000 | up to 9,600,000 | 10 |
| 9 | Ruby | 4,700,000–8,400,000 | up to 25,200,000 | 11 |
| 10 | Crown | 13,000,000–26,000,000 | up to 78,000,000 | 12 |

## Buyer Ranking

Each bond has exactly 3 buyers (from `BUYERS_BY_VIP` in `src/lib/bondData.js`):
- **Rank 3** = highest price = correct answer (profit_high)
- **Rank 2** = middle price (profit_mid)
- **Rank 1** = lowest price (profit_low)

Buyers are displayed in random shuffled order so the user must compare prices.

## Demo Data

- 10 bonds per VIP level × 10 levels = 100 demo bonds in `src/lib/bondData.js`
- 3 named buyers per VIP level (30 total buyer personas)
- 9 upgrade teasers (VIP 1→9 each show next level teaser)

## Wallet Rules

- `min_balance` = 5,000 UGX (hardcoded constant `MIN_BALANCE`)
- Trust fee deducted immediately when task starts
- Profit credited after claim
- Withdrawable balance is separate from main balance (admin controls)

## Admin Config (future)

Table `admin_vip_config` (in `002_game_tables.sql` — not yet run):
- Admin can change bonds_per_day, trust_fee ranges, profit ranges per VIP level
- Changes apply to new sessions only (active sessions use cached values)
