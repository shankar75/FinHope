# FinHope — V1 Prototype

A clickable, fully-calculating personal finance prototype: Dashboard → Add
Income → Add Expense → Loans → Goals → Action Tracker → Ask FinHope.

Balance, expense/income totals, loan outstanding, budget remaining,
need/want split, and the financial health score are all computed live from
what you enter. Data is saved in your browser (localStorage), so it
persists between visits on the same device/browser.

**Note on Ask FinHope:** this version answers using a local rule-based
engine (loan prioritization, score breakdown, spending analysis, action
plans) — it doesn't call an external AI API, since GitHub Pages has no
backend to hold an API key safely. Everything else works identically to
before.

## Deploy on GitHub Pages (free, ~5 minutes)

1. Create a new repository on GitHub (e.g. `finhope` or `moneytrack`).
   Public repos work fine for a free Pages site.
2. Upload all files in this folder to the repo root, keeping the names
   exactly as they are:
   - `index.html`
   - `manifest.json`
   - `icon.svg`
   You can drag-and-drop these on the GitHub web UI ("Add file" →
   "Upload files") — no command line needed.
3. Go to the repo's **Settings → Pages**.
4. Under "Build and deployment", set **Source** to "Deploy from a branch",
   branch `main`, folder `/ (root)`. Save.
5. GitHub will give you a live URL within a minute or two, typically:
   `https://<your-username>.github.io/<repo-name>/`

## Install it on your phone

- **iPhone (Safari):** open the URL → tap Share → **Add to Home Screen**.
- **Android (Chrome):** open the URL → menu (⋮) → **Add to Home screen** /
  **Install app**.

Once it's on a real hosted domain, install behavior is fully reliable on
both platforms, and you can send the link to anyone else who wants to
test it.

## Wiring up real AI later (optional)

If you want Ask FinHope to use a real AI model again once this is
deployed, the safe way is a small serverless proxy (e.g. a free
Cloudflare Worker or Vercel serverless function) that holds your API key
server-side and forwards chat requests — never put an API key directly in
this front-end code, since anything in a public repo is visible to
anyone.
