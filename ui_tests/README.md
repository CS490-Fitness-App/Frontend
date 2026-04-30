# PrimalFitness — UI Tests

Selenium-based end-to-end tests for the frontend. Three test suites, one combined runner.

---

## Setup

### Prerequisites

Both servers must be running before executing any test:

```bash
# Terminal 1 — backend
cd Backend
.\venv\Scripts\activate
uvicorn main:app --reload

# Terminal 2 — frontend
cd Frontend
npm run dev
```

### Install Selenium

```bash
pip install selenium
```

Chrome or Edge must be installed. The scripts auto-detect Chrome first, then fall back to Edge.

---

## Credentials

Set these environment variables in the same PowerShell window you run the tests from:

```powershell
# Client account (used by smoke tests + daily flow)
$env:UI_TEST_EMAIL="your-client@example.com"
$env:UI_TEST_PASSWORD="yourpassword"

# Admin account (used by admin flow)
$env:UI_TEST_ADMIN_EMAIL="your-admin@example.com"
$env:UI_TEST_ADMIN_PASSWORD="yourpassword"
```

These must be real Auth0 accounts that exist in the database. The login uses Auth0's password grant directly — no OAuth popup.

---

## Running Tests

All commands run from the `Frontend/` directory.

### Run all suites

```powershell
python .\ui_tests\run_all_tests.py
```

Runs smoke tests → daily client flow → admin flow in order. A failing suite does not stop the next one. Exits with code 1 if any suite fails.

### Run a single suite

```powershell
python .\ui_tests\run_ui_tests.py       # Smoke tests
python .\ui_tests\run_daily_user_flow.py  # Daily client flow
python .\ui_tests\run_admin_flow.py       # Admin flow
```

---

## What Each Suite Tests

### Smoke Tests (`run_ui_tests.py`)

Verifies that key pages load and the client can log in.

| Test | What it checks |
|------|----------------|
| Home Page | Page loads, "primal" or "fitness" text present |
| Exercises Page | Page loads, "exercise" text present |
| Coaches Page | Page loads, "coach" text present |
| Client Login | Email/password login succeeds, redirects to client dashboard |
| Client Dashboard | Dashboard loads with expected content |
| Activity Logger Page | Page loads |
| View Progress Page | Page loads |
| Profile Page | Page loads |

### Daily Client Flow (`run_daily_user_flow.py`)

Full client workflow from login to cleanup.

1. Log in as client
2. Navigate to Profile → lower goal weight by 1 lb → verify update saved
3. Navigate to Activity Logger → fill all fields (steps, calories, water, weight, mood, notes)
4. Save the log → verify redirect to View Progress
5. Return to Activity Logger → delete today's log (cleanup)

### Admin Flow (`run_admin_flow.py`)

Admin coach management workflow.

1. Log in as admin
2. Wait for Coach Management table to load with real data
3. Find Arvid Lindblad in the table
4. Click REACTIVATE → verify row updates to show SUSPEND (confirming status changed to Active)

---

## Files

| File | Purpose |
|------|---------|
| `run_all_tests.py` | Combined runner — runs all three suites |
| `run_ui_tests.py` | Smoke tests + shared helpers (login, driver setup, screenshots) |
| `run_daily_user_flow.py` | Daily client flow; imports helpers from run_ui_tests |
| `run_admin_flow.py` | Admin flow; imports helpers from run_ui_tests |
| `screenshots/` | Failure screenshots saved here automatically |

---

## Failure Screenshots

On any test failure, a screenshot is saved to `ui_tests/screenshots/` named after the failing test or suite. Check here first when debugging.

---

## Known Limitations

- Activity Logger planned-workout row inputs are not automated — those specific inputs were not reliably interactable under Selenium
- The admin flow targets Arvid Lindblad specifically; it will fail if that account does not exist or is not in Suspended status
- Tests make real Auth0 network calls on login (~1–2s per login)
- Tests are not isolated from each other's database state — run them against a consistent test dataset
