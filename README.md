# Tabskie's Homestay and Travel — booking site

The full booking system from the design canvas, built as a real Next.js
site: a guest-facing flow (browse the three units, pick dates and guests,
enter details, choose a payment method, submit proof of payment) and an
internal `/admin` dashboard (calendar, reservation list, Confirm/Mark
Paid/Cancel actions) matching the two halves of the original design.

## Running it locally

```bash
npm install
cp .env.example .env.local   # fill in ADMIN_PASSWORD at minimum
npm run dev
```

Open http://localhost:3000 for the guest site, and http://localhost:3000/admin/calendar
for the internal dashboard (it will prompt for the `ADMIN_USERNAME` /
`ADMIN_PASSWORD` you set).

If `N8N_BOOKING_WEBHOOK_URL` is left unset, the booking form still works
end-to-end in **demo mode**: submitting returns a mocked booking reference
and the confirmation page shows a small banner saying nothing was actually
saved. Likewise, if `N8N_RESERVATIONS_WEBHOOK_URL` /
`N8N_RESERVATION_ACTION_WEBHOOK_URL` are unset, `/admin` runs on three
seeded demo reservations (dated relative to today, so it always looks
current) kept in memory on the server. This is useful for previewing both
flows before your n8n workflows are ready — just don't send real guests to
it, or rely on the admin dashboard for real reservations, while unset.

**A note on that in-memory demo store:** it lives in the Node process, so
edits made in `/admin` (confirming a draft, marking paid, etc.) persist for
as long as that server instance stays warm, but are not durable — a Vercel
cold start or a second instance won't see them. That's expected for a demo;
once `N8N_RESERVATIONS_WEBHOOK_URL` / `N8N_RESERVATION_ACTION_WEBHOOK_URL`
are set, all reads and writes go to your real sheet instead and this
limitation goes away entirely.

## Wiring it to your n8n workflow

Per the Tabskies OS decisions already locked in (Module 1/2), reservation
records, sequential IDs, and Draft/Confirmed status live in n8n + Google
Sheets, not in this website. The site's `/api/bookings` route is a thin
proxy: it validates the submission, then forwards it as
`multipart/form-data` to whatever URL you put in `N8N_BOOKING_WEBHOOK_URL`.

**1. Create a Webhook node in n8n**, method `POST`, and set its "Respond"
mode to "Using 'Respond to Webhook' Node" (so you control the response
after the sheet write happens). This matches the architecture note already
recorded for this project: *"Uses an n8n Form Trigger for V1, extensible to
a Webhook for future Messenger AI integration"* — this site's submissions
are that webhook trigger.

**2. Fields the webhook receives** (as multipart form fields — read them
with n8n's Webhook node, they'll appear under `$json.body` for text fields
and `$binary.proofOfPayment` for the file):

| Field | Type | Notes |
|---|---|---|
| `unitSlug` | text | `bamboo-unit`, `lower-unit`, or `whole-house` |
| `unitName` | text | e.g. `Bamboo Unit` |
| `checkIn` | text | ISO date, e.g. `2026-11-14` |
| `checkOut` | text | ISO date |
| `guests` | text | integer as string |
| `fullName` | text | |
| `email` | text | |
| `phone` | text | |
| `trustedGuest` | text | always `"false"` from the online form — Trusted Guest is now an admin-only flag staff set later in `/admin`, it no longer waives the online deposit or appears as a guest-facing choice |
| `paymentMethod` | text | `gcash`, `bank`, or `wise` (all three are QR-based on the guest form; `cash` is only ever set by staff directly in `/admin`, never submitted here) |
| `gcashReference` | text | present only when `paymentMethod` is `gcash` |
| `ratePerNight` | text | numeric, PHP |
| `subtotal` | text | numeric, PHP |
| `deposit` | text | numeric, PHP (50% — always required online now) |
| `balance` | text | numeric, PHP |
| `proofOfPayment` | file | present only when `paymentMethod` is `bank` or `wise` |

In n8n, this is exactly the shape your existing Reservation Management
workflow needs to: generate the next `TBK-YYYY-NNNN` booking reference and
`G-NNNN` guest ID (with concurrency set to 1, as already decided), write a
new row with status `Draft`, enforce the Whole House ↔ Bamboo/Lower
bidirectional block check, and file the uploaded receipt (e.g. to a Drive
folder or as a Sheets attachment link).

**3. The webhook must respond with JSON** shaped like this:

```json
{
  "bookingRef": "TBK-2026-0143",
  "guestId": "G-0402",
  "status": "Draft",
  "paymentStatus": "Partial (Deposit Paid)",
  "createdAt": "2026-11-10T08:15:00Z"
}
```

`status` is `"Draft"` or `"Confirmed"`; `paymentStatus` is one of `"Unpaid"`,
`"Partial (Deposit Paid)"`, `"Paid in Full"`, `"Refunded"` — the same
enums already locked in for Tabskies OS. The site shows whatever you send
back on the confirmation and invoice pages, so this is where you decide,
for example, whether a submitted GCash reference is trusted immediately or
left `"Unpaid"` until staff verifies it manually.

**4. Set the env var** in `.env.local` (dev) and in Vercel's Project
Settings → Environment Variables (production) to your n8n webhook's public
URL, then redeploy.

## The internal dashboard (`/admin`)

`/admin/calendar` shows the three units as rows over a rolling 14-day
window (color-coded Confirmed/Draft, plus a derived "Blocked" bar wherever
a Whole House reservation bidirectionally blocks Bamboo Unit and Lower
Unit), with a List view toggle and quick stats. `/admin/reservations` is a
searchable, filterable list with a detail pane: Trusted Guest toggle,
Confirm reservation, Mark paid in full, Cancel & refund, and a link to that
reservation's invoice (the same `/invoice` page the guest flow uses, now
reading `?id=` instead of the browser's session storage).

**Access control:** every `/admin/*` page and `/api/admin/*` route is
gated by HTTP Basic Auth (see `middleware.ts`), using `ADMIN_USERNAME` /
`ADMIN_PASSWORD`. The dashboard refuses to serve anything if
`ADMIN_PASSWORD` isn't set — there's no accidental "open" state. This is a
lightweight first pass suited to one or two people sharing a login; if you
later want per-staff accounts or an audit trail, swap the middleware for
real auth (e.g. NextAuth) without touching the pages.

**Connecting it to your real sheet** works the same way as the booking
webhook, via two more optional env vars:

- `N8N_RESERVATIONS_WEBHOOK_URL` — a `GET` endpoint n8n should expose that
  returns `{ "reservations": [ ... ] }`, where each item has the same
  shape `/api/bookings` produces (`unitSlug`, `checkIn`, `checkOut`,
  `guests`, `fullName`, `email`, `phone`, `trustedGuest`, `paymentMethod`,
  `bookingRef`, `guestId`, `status`, `paymentStatus`, `createdAt`) plus a
  stable `id` field.
- `N8N_RESERVATION_ACTION_WEBHOOK_URL` — a `POST` endpoint that receives
  `{ "id": "...", "action": { "type": "confirm" | "markPaid" | "cancelRefund" | "toggleTrusted" } }`
  and should apply that change to the matching row, then respond with the
  updated reservation object (same shape as above).

Until those are set, `/admin` reads and writes the seeded in-memory demo
data described above.

## Adding real photos

Right now every photo spot is just a labeled gray box — drop real image files
into the `public/` folder (create the folders if they don't exist yet) using
these exact names, and they'll show up automatically on the next deploy:

| File | Shows up |
|---|---|
| `public/hero.png` | Home page banner |
| `public/units/bamboo-unit.jpg` | Bamboo Unit — home page card + detail page |
| `public/units/lower-unit.png` | Lower Unit — home page card + detail page |
| `public/units/whole-house.png` | Whole House — home page card + detail page |
| `public/payment/gcash-qr.jpg` | GCash QR code on the payment step |
| `public/payment/bank-qr.jpg` | Bank transfer QR code on the payment step |
| `public/payment/wise-qr.jpg` | Wise transfer QR code on the payment step (international guests) |

No code changes needed — just add the files, `git add`, commit, and push;
Vercel redeploys automatically. Landscape photos around 1600×1000px work
best. If a file is missing, that spot just shows its plain background with
no broken-image icon, so it's safe to add them one at a time.

## Deploying to Vercel with your own domain

1. Push this project to a GitHub repo (same flow as Natalie's site).
2. In Vercel, "Add New Project" → import that repo. Framework preset
   `Next.js` is auto-detected.
3. Add the environment variables from `.env.example` under Project
   Settings → Environment Variables before the first deploy (or redeploy
   after adding them). At minimum, set `ADMIN_USERNAME` / `ADMIN_PASSWORD`
   to something real before this goes live — everything else
   (`N8N_BOOKING_WEBHOOK_URL`, `N8N_RESERVATIONS_WEBHOOK_URL`,
   `N8N_RESERVATION_ACTION_WEBHOOK_URL`) can stay unset for now and be
   added later; the site runs fully in demo mode without them, so you can
   deploy and share the link before your n8n workflows are ready.
4. Once deployed, go to Project Settings → Domains → add your domain
   (e.g. `book.tabskiestravel.com` or your root domain) and follow Vercel's
   DNS instructions — either a CNAME record if you're using a subdomain, or
   the A/ALIAS record Vercel gives you for an apex domain. Propagation is
   usually minutes, occasionally a few hours depending on your registrar.

## What's next / not included here

- **Payment collection stays manual for now** — guests submit a GCash
  reference number or upload a bank transfer receipt, and someone on your
  end verifies it and flips the status in n8n/Sheets. If you later want
  automated GCash collection, PayMongo (pay-as-you-go, no subscription —
  about 2.23% per GCash transaction) can be dropped in behind the same
  `/api/bookings` route without changing the front end.
- **Real availability checking** (blocking a Bamboo Unit booking during a
  confirmed Whole House stay, etc.) has to happen in n8n against your
  sheet — this site doesn't know your current reservations, so double
  bookings are only prevented once your workflow enforces it there.
