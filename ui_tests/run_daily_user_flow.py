from pathlib import Path
import sys
import time
from datetime import datetime, timezone
from selenium.webdriver import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select

from run_ui_tests import (
    BASE_URL,
    create_driver,
    login_as_client,
    pause,
    take_screenshot,
    wait_for,
)


def log(message):
    print(message, flush=True)


def click(driver, element):
    pause()
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", element)
    pause()
    try:
        element.click()
    except Exception:
        driver.execute_script("arguments[0].click();", element)
    pause()


def visible_text(driver):
    return driver.page_source.lower()


def get_feedback_errors(driver):
    return [
        element.text.strip()
        for element in driver.find_elements(By.CSS_SELECTOR, ".feedback-msg.error")
        if element.text.strip()
    ]


def current_page_state(driver):
    errors = get_feedback_errors(driver)
    error_text = f" Errors: {' | '.join(errors)}." if errors else ""
    return f"URL: {driver.current_url}.{error_text}"


def backend_today():
    return datetime.now(timezone.utc).date().isoformat()


def wait_for_clickable(driver, by, value, timeout=20):
    return wait_for(driver, EC.element_to_be_clickable((by, value)), timeout)


def wait_for_visible(driver, by, value, timeout=20):
    return wait_for(driver, EC.visibility_of_element_located((by, value)), timeout)


def wait_for_present(driver, by, value, timeout=20):
    return wait_for(driver, EC.presence_of_element_located((by, value)), timeout)


def set_react_input_value(driver, element, value):
    driver.execute_script(
        """
        const element = arguments[0];
        const value = arguments[1];
        const prototype = Object.getPrototypeOf(element);
        const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
        descriptor.set.call(element, value);
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        """,
        element,
        value,
    )


def hover(driver, element):
    ActionChains(driver).move_to_element(element).perform()


def type_into_input(driver, element, value):
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", element)
    click(driver, element)
    element.send_keys(Keys.CONTROL + "a")
    element.send_keys(str(value))
    element.send_keys(Keys.TAB)


def edit_goal_weight(driver):
    driver.get(f"{BASE_URL}/profile")
    wait_for(driver, lambda d: "user profile" in visible_text(d), 20)
    wait_for(driver, lambda d: "goal weight" in visible_text(d), 20)

    # Check if goal weight section exists
    goal_weight_rows = driver.find_elements(By.XPATH, "//*[contains(normalize-space(), 'Goal Weight')]/ancestor::*[contains(@class, 'dashboard-list-contents')]")
    if not goal_weight_rows:
        raise RuntimeError("Goal weight section not found. This test requires a client user with goal weight configured.")

    goal_weight_row = goal_weight_rows[0]
    hover(driver, goal_weight_row)

    goal_value_xpath = "//*[contains(normalize-space(), 'Goal Weight')]/ancestor::*[contains(@class, 'dashboard-list-contents')]//*[contains(@class, 'dashboard-list')]"
    previous_goal_text = wait_for_present(driver, By.XPATH, goal_value_xpath).text.strip()
    previous_goal_number = float(previous_goal_text.lower().replace("lb", "").strip())

    edit_goal_button = wait_for_present(driver, By.CSS_SELECTOR, "button[aria-label='Edit goal weight']")
    click(driver, edit_goal_button)

    goal_input = wait_for_visible(driver, By.XPATH, "//input[@placeholder='Goal weight (lb)']")
    current_raw = (goal_input.get_attribute("value") or "").strip()
    try:
        current_value = float(current_raw)
    except ValueError:
        current_value = 150.0

    next_value = max(1.0, round(current_value - 1.0, 1))
    goal_input.click()
    goal_input.send_keys(Keys.CONTROL + "a")
    goal_input.send_keys(str(next_value))

    save_button = wait_for_clickable(
        driver,
        By.XPATH,
        "//input[@placeholder='Goal weight (lb)']/following::button[normalize-space()='Save'][1]",
    )
    click(driver, save_button)
    wait_for(driver, EC.invisibility_of_element_located((By.XPATH, "//input[@placeholder='Goal weight (lb)']")), 20)
    driver.get(f"{BASE_URL}/profile")
    try:
        def goal_updated(d):
            goal_text = wait_for_present(d, By.XPATH, goal_value_xpath).text.strip()
            goal_number = float(goal_text.lower().replace("lb", "").strip())
            return abs(goal_number - next_value) < 0.1  # Allow small rounding difference

        wait_for(driver, goal_updated, 20)
    except Exception as exc:
        errors = get_feedback_errors(driver)
        if errors:
            raise RuntimeError(" | ".join(errors)) from exc
        raise RuntimeError(
            f"Goal weight did not update to expected value {next_value}. Check conversion or save failed."
        ) from exc
    return next_value


def fill_activity_log(driver):
    activity_date = backend_today()
    driver.get(f"{BASE_URL}/activity-logger?date={activity_date}")
    wait_for(driver, lambda d: "activity logger" in visible_text(d), 20)

    fields = {
        "9000": "8750",
        "2100": "2050",
        "450": "500",
        "8": "7",
        "178.4": "191.5",
    }

    for placeholder, value in fields.items():
        input_el = wait_for_visible(driver, By.XPATH, f"//input[@placeholder='{placeholder}']")
        type_into_input(driver, input_el, value)

    mood_select = wait_for_visible(driver, By.TAG_NAME, "select")
    Select(mood_select).select_by_visible_text("Good")

    notes = wait_for_visible(driver, By.XPATH, "//textarea[@placeholder='How did training feel today?']")
    type_into_input(driver, notes, "Automated daily UI flow test entry.")

    save_button = wait_for_clickable(driver, By.XPATH, "//button[contains(normalize-space(), 'Save Activity Log')]")
    click(driver, save_button)

    try:
        wait_for(driver, lambda d: "/view-progress" in d.current_url, 20)
    except Exception as exc:
        errors = get_feedback_errors(driver)
        if errors:
            raise RuntimeError(" | ".join(errors)) from exc
        raise RuntimeError(f"Activity log save did not redirect to View Progress. {current_page_state(driver)}") from exc

    try:
        wait_for(driver, lambda d: "progress insights" in visible_text(d), 20)
        wait_for(driver, lambda d: "loading progress charts" not in visible_text(d), 20)
    except Exception as exc:
        raise RuntimeError(f"Activity log save redirected, but View Progress did not finish loading. {current_page_state(driver)}") from exc

    return activity_date


def delete_today_log(driver, activity_date=None):
    activity_date = activity_date or backend_today()
    driver.get(f"{BASE_URL}/activity-logger?date={activity_date}")
    wait_for(driver, lambda d: "activity logger" in visible_text(d), 20)

    try:
        delete_button = wait_for_clickable(driver, By.XPATH, "//button[contains(normalize-space(), \"Delete Today's Log\")]", 20)
    except Exception as exc:
        raise RuntimeError(
            "Delete Today's Log button was not available after saving. "
            f"Cleanup date: {activity_date}. {current_page_state(driver)}"
        ) from exc
    click(driver, delete_button)

    try:
        wait_for(driver, lambda d: "today's activity log was deleted." in visible_text(d), 20)
        wait_for(
            driver,
            lambda d: "delete today's log" not in visible_text(d),
            20,
        )
    except Exception as exc:
        raise RuntimeError(f"Activity log delete did not complete. {current_page_state(driver)}") from exc


def main():
    driver = create_driver()
    try:
        log("STEP 1: Log in as client")
        login_as_client(driver)
        log("PASS: Login")

        log("STEP 2: Lower goal weight")
        updated_goal_weight = edit_goal_weight(driver)
        log(f"PASS: Goal weight updated to {updated_goal_weight}")

        log("STEP 3: Go to Activity Logger")
        driver.get(f"{BASE_URL}/activity-logger")
        wait_for(driver, lambda d: "activity logger" in visible_text(d), 20)
        log("PASS: Activity Logger opened")

        log("STEP 4: Fill and save today's activity log")
        activity_date = fill_activity_log(driver)
        log("PASS: Activity log saved and redirected to progress")

        log("STEP 5: Clean up — delete today's log")
        delete_today_log(driver, activity_date)
        log("PASS: Log deleted")

        print("\nDaily user flow completed successfully.")
    except Exception as exc:
        take_screenshot(driver, "daily_user_flow_failure")
        print(f"\nDaily user flow failed: {exc}")
        sys.exit(1)
    finally:
        driver.quit()


if __name__ == "__main__":
    main()
