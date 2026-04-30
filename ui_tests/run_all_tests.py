import os
import sys

import run_ui_tests
import run_daily_user_flow
import run_admin_flow
import run_client_extra_flow
import run_coach_flow

SUITES = [
    ("Smoke Tests",              run_ui_tests.main),
    ("Daily Client Flow",        run_daily_user_flow.main),
    ("Client Extra Pages Flow",  run_client_extra_flow.main),
    ("Admin Flow",               run_admin_flow.main),
    ("Coach Flow",               run_coach_flow.main),
]

# Coach flow requires credentials — skip gracefully if not provided.
_COACH_CREDS_SET = bool(
    os.environ.get("UI_TEST_COACH_EMAIL") and os.environ.get("UI_TEST_COACH_PASSWORD")
)


def run_suite(name, fn):
    print(f"\n{'=' * 60}")
    print(f"SUITE: {name}")
    print('=' * 60)
    try:
        fn()
        return True
    except SystemExit as exc:
        if exc.code and int(exc.code) != 0:
            print(f"\nSUITE FAILED: {name}")
            return False
        return True
    except Exception as exc:
        print(f"\nSUITE CRASHED: {name} -> {exc}")
        return False


def main():
    suites_to_run = []
    for name, fn in SUITES:
        if name == "Coach Flow" and not _COACH_CREDS_SET:
            print(f"\nSKIPPED: {name} (UI_TEST_COACH_EMAIL / UI_TEST_COACH_PASSWORD not set)")
            continue
        suites_to_run.append((name, fn))

    results = [(name, run_suite(name, fn)) for name, fn in suites_to_run]

    print(f"\n{'=' * 60}")
    print("OVERALL SUMMARY")
    print('=' * 60)
    for name, passed in results:
        print(f"{'PASS' if passed else 'FAIL'} | {name}")

    failures = sum(1 for _, passed in results if not passed)
    if failures:
        print(f"\n{failures} suite(s) failed.")
        sys.exit(1)
    print("\nAll suites passed.")


if __name__ == "__main__":
    main()
