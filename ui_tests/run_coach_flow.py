import os
import sys

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

from run_ui_tests import (
    BASE_URL,
    click,
    create_driver,
    find_visible_input_by_placeholder,
    run_test,
    take_screenshot,
    visible_text,
    wait_for,
)

UI_TEST_COACH_EMAIL = os.environ.get("UI_TEST_COACH_EMAIL", "")
UI_TEST_COACH_PASSWORD = os.environ.get("UI_TEST_COACH_PASSWORD", "")


def log(message):
    print(message, flush=True)


def wait_for_clickable(driver, by, value, timeout=20):
    return wait_for(driver, EC.element_to_be_clickable((by, value)), timeout)


def wait_for_visible(driver, by, value, timeout=20):
    return wait_for(driver, EC.visibility_of_element_located((by, value)), timeout)


def login_as_coach(driver):
    if not UI_TEST_COACH_EMAIL or not UI_TEST_COACH_PASSWORD:
        raise RuntimeError("Set UI_TEST_COACH_EMAIL and UI_TEST_COACH_PASSWORD before running the coach flow.")

    driver.get(BASE_URL)
    login_link = wait_for_clickable(
        driver,
        By.XPATH,
        "//a[normalize-space()='Log In'] | //button[normalize-space()='Log In']",
        20,
    )
    click(driver, login_link)

    email_input = find_visible_input_by_placeholder(driver, "EMAIL")
    password_input = find_visible_input_by_placeholder(driver, "PASSWORD")
    email_input.clear()
    email_input.send_keys(UI_TEST_COACH_EMAIL)
    password_input.clear()
    password_input.send_keys(UI_TEST_COACH_PASSWORD)

    submit_button = wait_for_clickable(
        driver,
        By.XPATH,
        "//button[normalize-space()='LOG IN' or normalize-space()='Log In']",
        20,
    )
    click(driver, submit_button)

    wait_for(
        driver,
        lambda d: "/coach-dashboard" in d.current_url or "coach dashboard" in visible_text(d),
        25,
    )


def test_coach_dashboard(driver):
    driver.get(f"{BASE_URL}/coach-dashboard")
    wait_for(driver, lambda d: "coach" in visible_text(d), 20)
    wait_for(driver, lambda d: "client" in visible_text(d) or "earnings" in visible_text(d), 20)


def test_coach_chat_page(driver):
    driver.get(f"{BASE_URL}/chat")
    wait_for(driver, lambda d: "message" in visible_text(d) or "conversation" in visible_text(d), 20)


def test_coach_view_progress_page(driver):
    driver.get(f"{BASE_URL}/view-progress")
    wait_for(driver, lambda d: "progress" in visible_text(d), 20)


def test_coach_profile_page(driver):
    driver.get(f"{BASE_URL}/profile")
    wait_for(driver, lambda d: "profile" in visible_text(d), 20)


def test_coach_calendar_page(driver):
    driver.get(f"{BASE_URL}/calendar")
    wait_for(driver, lambda d: "calendar" in visible_text(d) or "scheduled" in visible_text(d), 20)


def test_coach_view_client_progress(driver):
    driver.get(f"{BASE_URL}/coach-dashboard")
    wait_for(driver, lambda d: "coach" in visible_text(d), 20)

    view_buttons = driver.find_elements(By.XPATH, "//button[normalize-space()='VIEW']")
    if not view_buttons:
        log("No active clients found — skipping client progress check.")
        return

    click(driver, view_buttons[0])
    wait_for(
        driver,
        lambda d: "/view-progress" in d.current_url,
        20,
    )
    wait_for(driver, lambda d: "progress" in visible_text(d), 20)


def test_coach_message_client(driver):
    driver.get(f"{BASE_URL}/coach-dashboard")
    wait_for(driver, lambda d: "coach" in visible_text(d), 20)

    message_buttons = driver.find_elements(By.XPATH, "//button[normalize-space()='MESSAGE']")
    if not message_buttons:
        log("No active clients found — skipping message client check.")
        return

    click(driver, message_buttons[0])
    wait_for(
        driver,
        lambda d: "/chat" in d.current_url,
        20,
    )
    wait_for(driver, lambda d: "message" in visible_text(d) or "conversation" in visible_text(d), 20)

    view_progress_buttons = driver.find_elements(
        By.XPATH, "//button[normalize-space()='VIEW PROGRESS']"
    )
    if not view_progress_buttons:
        raise RuntimeError("VIEW PROGRESS button not found in chat header for coach.")

    click(driver, view_progress_buttons[0])
    wait_for(driver, lambda d: "/view-progress" in d.current_url, 20)
    wait_for(driver, lambda d: "progress" in visible_text(d), 20)


def test_coach_workout_plans(driver):
    driver.get(f"{BASE_URL}/my-workouts")
    wait_for(driver, lambda d: "workout" in visible_text(d), 20)


def main():
    driver = create_driver()
    results = []
    try:
        log("STEP 1: Log in as coach")
        login_as_coach(driver)
        log("PASS: Coach login")
        results.append(("Coach Login", True, ""))

        run_test(driver, "Coach Dashboard", test_coach_dashboard, results)
        run_test(driver, "Coach Chat Page", test_coach_chat_page, results)
        run_test(driver, "Coach View Progress Page", test_coach_view_progress_page, results)
        run_test(driver, "Coach Profile Page", test_coach_profile_page, results)
        run_test(driver, "Coach Calendar Page", test_coach_calendar_page, results)
        run_test(driver, "Coach Workout Plans", test_coach_workout_plans, results)
        run_test(driver, "Coach View Client Progress", test_coach_view_client_progress, results)
        run_test(driver, "Coach Message Client → Chat → View Progress", test_coach_message_client, results)

    except Exception as exc:
        log(f"FAIL: Coach Login -> {exc}")
        take_screenshot(driver, "coach_login_failure")
        results.append(("Coach Login", False, str(exc)))
    finally:
        print("\n=== COACH FLOW SUMMARY ===")
        failures = 0
        for name, passed, message in results:
            status = "PASS" if passed else "FAIL"
            print(f"{status} | {name}")
            if not passed and message:
                print(f"      Message: {message}")
            if not passed:
                failures += 1
        if failures:
            print(f"\nCompleted with {failures} failing test(s).")
            driver.quit()
            sys.exit(1)
        print("\nCoach flow completed successfully.")
        driver.quit()


if __name__ == "__main__":
    main()
