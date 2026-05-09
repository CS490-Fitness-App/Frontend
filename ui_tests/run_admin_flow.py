import os
import sys

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

from run_ui_tests import (
    BASE_URL,
    click,
    create_driver,
    take_screenshot,
    visible_text,
    wait_for,
)


UI_TEST_ADMIN_EMAIL = os.environ.get("UI_TEST_ADMIN_EMAIL", "")
UI_TEST_PASSWORD = os.environ.get("UI_TEST_PASSWORD", "")


def log(message):
    print(message, flush=True)


def wait_for_clickable(driver, by, value, timeout=20):
    return wait_for(driver, EC.element_to_be_clickable((by, value)), timeout)


def wait_for_visible(driver, by, value, timeout=20):
    return wait_for(driver, EC.visibility_of_element_located((by, value)), timeout)


def find_visible_input_by_placeholder(driver, placeholder, timeout=20):
    xpath = f"//input[translate(@placeholder,'abcdefghijklmnopqrstuvwxyz','ABCDEFGHIJKLMNOPQRSTUVWXYZ')='{placeholder.upper()}']"
    return wait_for_visible(driver, By.XPATH, xpath, timeout)


def login_as_admin(driver):
    if not UI_TEST_ADMIN_EMAIL or not UI_TEST_PASSWORD:
        raise RuntimeError("Set UI_TEST_ADMIN_EMAIL and UI_TEST_PASSWORD before running the admin flow.")

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
    email_input.send_keys(UI_TEST_ADMIN_EMAIL)
    password_input.clear()
    password_input.send_keys(UI_TEST_PASSWORD)

    submit_button = wait_for_clickable(
        driver,
        By.XPATH,
        "//button[normalize-space()='LOG IN' or normalize-space()='Log In']",
        20,
    )
    click(driver, submit_button)

    wait_for(driver, lambda d: "admin panel" in visible_text(d) or "/dashboard/admin" in d.current_url, 25)


def navigate_to_tab(driver, tab_text, timeout=20):
    """Click a named tab in the admin dashboard tab bar."""
    tab = wait_for_clickable(
        driver,
        By.XPATH,
        f"//div[contains(@class,'tab') and normalize-space()='{tab_text}']",
        timeout,
    )
    click(driver, tab)


def wait_for_admin_table(driver, timeout=20):
    """Wait for an admin-table with at least one data row to be visible."""
    wait_for_visible(driver, By.XPATH, "//table[contains(@class,'admin-table')]", timeout)


def test_client_management_tab(driver):
    """Verify the CLIENT MANAGEMENT tab loads its table."""
    navigate_to_tab(driver, "CLIENT MANAGEMENT")
    wait_for_admin_table(driver)
    wait_for(driver, lambda d: "all clients" in visible_text(d), 20)


def test_reports_tab(driver):
    """Verify the REPORTS tab loads its table."""
    navigate_to_tab(driver, "REPORTS")
    wait_for_admin_table(driver)
    wait_for(driver, lambda d: "reports" in visible_text(d), 20)


def wait_for_coach_management(driver):
    """Navigate to the COACH MANAGEMENT tab and wait for coach rows to appear.

    The admin dashboard now opens on CLIENT MANAGEMENT (tab 0) by default.
    Explicitly clicking COACH MANAGEMENT (tab 1) before inspecting rows prevents
    the test from operating on the client table instead of the coach table.
    """
    wait_for(driver, lambda d: "/dashboard/admin" in d.current_url, 20)
    navigate_to_tab(driver, "COACH MANAGEMENT")
    wait_for_admin_table(driver)
    wait_for(
        driver,
        lambda d: bool(
            d.find_elements(By.XPATH, "//table[contains(@class,'admin-table')]//tbody/tr[.//button]")
        ),
        20,
    )


def find_coach_row(driver):
    table = wait_for_visible(driver, By.XPATH, "//table[contains(@class, 'admin-table')]", 20)
    rows = table.find_elements(By.XPATH, ".//tbody/tr")
    if not rows:
        raise RuntimeError("No coach rows were found in Coach Management.")

    for i, row in enumerate(rows):
        coach_name = row.find_element(By.XPATH, ".//td[1]").text.strip().lower()
        if coach_name == "liam anderson":
            return i, row

    raise RuntimeError("Could not find Liam Anderson in the Coach Management table.")


def wait_for_coach_action(driver, action_text, timeout=20):
    action_text = action_text.upper()

    def arvid_row_has_action(d):
        try:
            _, row = find_coach_row(d)
            buttons = row.find_elements(By.XPATH, f".//button[normalize-space()='{action_text}']")
            return buttons[0] if buttons else False
        except Exception:
            return False

    return wait_for(driver, arvid_row_has_action, timeout)


def suspend_target_coach(driver):
    _, row = find_coach_row(driver)
    suspend_buttons = row.find_elements(By.XPATH, ".//button[normalize-space()='SUSPEND']")
    if suspend_buttons:
        click(driver, suspend_buttons[0])
        wait_for_coach_action(driver, "REACTIVATE", 20)
        return "Suspended coach: Liam Anderson"

    reactivate_buttons = row.find_elements(By.XPATH, ".//button[normalize-space()='REACTIVATE']")
    if reactivate_buttons:
        return "Liam Anderson was already suspended — skipping suspend step"

    raise RuntimeError("Liam Anderson was found, but no SUSPEND or REACTIVATE button is available on that row.")


def reactivate_target_coach(driver):
    reactivate_button = wait_for_coach_action(driver, "REACTIVATE", 20)
    click(driver, reactivate_button)
    wait_for_coach_action(driver, "SUSPEND", 20)
    return "Reactivated coach: Liam Anderson"


def main():
    driver = create_driver()
    try:
        log("STEP 1: Log in as admin")
        login_as_admin(driver)
        log("PASS: Admin login")

        log("STEP 2: Verify Client Management tab loads")
        test_client_management_tab(driver)
        log("PASS: Client Management tab")

        log("STEP 3: Navigate to Coach Management and wait for table")
        wait_for_coach_management(driver)
        log("PASS: Coach Management is ready")

        log("STEP 4: Suspend Liam Anderson")
        result = suspend_target_coach(driver)
        log(f"PASS: {result}")

        log("STEP 5: Reactivate Liam Anderson")
        result = reactivate_target_coach(driver)
        log(f"PASS: {result}")

        log("STEP 6: Verify Reports tab loads")
        test_reports_tab(driver)
        log("PASS: Reports tab")

        print("\nAdmin flow completed successfully.")
    except Exception as exc:
        take_screenshot(driver, "admin_flow_failure")
        print(f"\nAdmin flow failed: {exc}")
        sys.exit(1)
    finally:
        driver.quit()


if __name__ == "__main__":
    main()
