import sys

import run_ui_tests
import run_daily_user_flow
import run_admin_flow
import run_coach_flow

SUITES = [
    ("Smoke Tests",        run_ui_tests.main),
    ("Daily Client Flow",  run_daily_user_flow.main),
    ("Admin Flow",         run_admin_flow.main),
    ("Coach Flow",         run_coach_flow.main),
]


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
    results = [(name, run_suite(name, fn)) for name, fn in SUITES]

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
