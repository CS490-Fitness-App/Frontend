# UI Tests Handoff

This folder contains the Selenium UI testing work done on branch `feature/ui-testing`.

The goal of this branch was to get quick, class-appropriate UI automation in place for:
- general frontend smoke coverage
- one stronger client daily flow
- one admin flow starter

This is not a production test framework. It is a practical Selenium setup for class testing and demo coverage.

## Files in this folder

- `run_ui_tests.py`
  - smoke test script
- `run_daily_user_flow.py`
  - richer client flow
- `run_admin_flow.py`
  - admin flow starter
- `screenshots/`
  - failure screenshots are saved here automatically

## Required setup

1. Start the backend
2. Start the frontend on `http://localhost:5173`
3. Install Selenium in the same Python environment you will use to run the scripts

Example:

```powershell
pip install selenium
```

## Test credentials

These scripts currently expect environment variables instead of hardcoded credentials.

### Client flow

```powershell
$env:UI_TEST_EMAIL="bob.smith@gmail.com"
$env:UI_TEST_PASSWORD="YOUR_CLIENT_PASSWORD"
```

### Admin flow

```powershell
$env:UI_TEST_ADMIN_EMAIL="YOUR_ADMIN_EMAIL"
$env:UI_TEST_ADMIN_PASSWORD="YOUR_ADMIN_PASSWORD"
```

### Optional base URL override

```powershell
$env:UI_BASE_URL="http://localhost:5173"
```

## Smoke test

Run:

```powershell
python .\ui_tests\run_ui_tests.py
```

What it covers:
- home page
- exercises page
- coaches page
- client login
- client dashboard
- activity logger page
- view progress page
- profile page

## Daily client flow

Run:

```powershell
python .\ui_tests\run_daily_user_flow.py
```

What it currently does:
- log in as client
- lower goal weight
- open Activity Logger
- fill the daily survey/log fields
- save the activity log
- verify redirect to View Progress

Important note:
- this flow currently skips the planned workout row inputs in Activity Logger
- we tried several approaches, but those specific inputs were not behaving reliably under Selenium in the available time
- the rest of the flow is working and was left stable instead of forcing fake coverage

## Admin flow

Run:

```powershell
python .\ui_tests\run_admin_flow.py
```

Current intent:
- log in as admin
- land on Admin Panel
- use Coach Management
- specifically target **Arvid Lindblad**
- click `REACTIVATE`

Current status:
- this script is a starter/handoff script
- admin login works
- page screenshot showed the correct Admin Panel and Coach Management table
- the script still needs final tightening around the coach row/action interaction

If continuing this script, start by checking:
- the row lookup for `Arvid Lindblad`
- the `REACTIVATE` button click
- the post-click state change in that row

## Important project-specific note

We found and fixed a frontend dev-server route issue in:

- `Frontend/vite.config.js`

Problem:
- `/dashboard/admin` refresh was going to the backend and returning 404

Cause:
- the Vite proxy config had:

```js
'/dashboard': proxyTarget
```

This conflicted with the frontend React route.

Fix already applied on this branch:
- removed the `'/dashboard'` proxy entry from `vite.config.js`

If `/dashboard/admin` still 404s:
- restart the frontend dev server after pulling this branch

## Known limitations / honest status

- Activity Logger planned-workout row inputs are still not reliably automated
- Admin coach action flow is partially implemented but not fully validated end to end
- These scripts are meant for class UI testing coverage, not for CI or long-term regression infrastructure

## Recommended next steps for teammate

1. Pull this branch and restart the frontend dev server
2. Run the smoke test first:

```powershell
python .\ui_tests\run_ui_tests.py
```

3. Run the client daily flow:

```powershell
python .\ui_tests\run_daily_user_flow.py
```

4. Then continue debugging the admin flow:

```powershell
python .\ui_tests\run_admin_flow.py
```

5. If admin flow fails again, check the latest image in:

```text
ui_tests/screenshots/
```

## Branch status summary

This branch includes:
- Selenium smoke test setup
- client daily flow automation
- admin flow starter
- screenshot capture on failures
- Vite `/dashboard/admin` refresh fix

That should be enough for someone else to pick up without having to rediscover everything from scratch.
