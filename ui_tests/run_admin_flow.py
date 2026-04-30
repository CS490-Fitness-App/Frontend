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
UI_TEST_ADMIN_PASSWORD = os.environ.get("UI_TEST_ADMIN_PASSWORD", "")


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
    if not UI_TEST_ADMIN_EMAIL or not UI_TEST_ADMIN_PASSWORD:
        raise RuntimeError("Set UI_TEST_ADMIN_EMAIL and UI_TEST_ADMIN_PASSWORD before running the admin flow.")

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
    password_input.send_keys(UI_TEST_ADMIN_PASSWORD)

    submit_button = wait_for_clickable(
        driver,
        By.XPATH,
        "//button[normalize-space()='LOG IN' or normalize-space()='Log In']",
        20,
    )
    click(driver, submit_button)

    wait_for(driver, lambda d: "admin panel" in visible_text(d) or "/dashboard/admin" in d.current_url, 25)


def wait_for_coach_management(driver):
    wait_for(driver, lambda d: "/dashboard/admin" in d.current_url, 20)
    wait_for_visible(driver, By.XPATH, "//table[contains(@class, 'admin-table')]", 20)
    # Wait for rows with actual action buttons — rules out the loading/empty-state rows
    wait_for(
        driver,
        lambda d: bool(
            d.find_elements(By.XPATH, "//table[contains(@class,'admin-table')]//tbody/tr[.//button]")
        ),
        20,
    )


def reactivate_arvid_lindblad(driver):
    table = wait_for_visible(driver, By.XPATH, "//table[contains(@class, 'admin-table')]", 20)
    rows = table.find_elements(By.XPATH, ".//tbody/tr")
    if not rows:
        raise RuntimeError("No coach rows were found in Coach Management.")

    arvid_row_index = None
    for i, row in enumerate(rows):
        coach_name = row.find_element(By.XPATH, ".//td[1]").text.strip().lower()
        if coach_name == "arvid lindblad":
            arvid_row_index = i
            break

    if arvid_row_index is None:
        raise RuntimeError("Could not find Arvid Lindblad in the Coach Management table.")

    row = rows[arvid_row_index]
    reactivate_buttons = row.find_elements(By.XPATH, ".//button[normalize-space()='REACTIVATE']")
    if not reactivate_buttons:
        raise RuntimeError("Arvid Lindblad was found, but no REACTIVATE button is available on that row.")

    click(driver, reactivate_buttons[0])

    # Wait for the row to update — re-fetch by index to avoid stale element after React re-render
    def arvid_row_shows_active(d):
        try:
            refreshed_rows = d.find_elements(By.XPATH, "//table[contains(@class, 'admin-table')]//tbody/tr")
            if arvid_row_index >= len(refreshed_rows):
                return False
            row_text = refreshed_rows[arvid_row_index].text.lower()
            return "suspend" in row_text
        except Exception:
            return False

    wait_for(driver, arvid_row_shows_active, 20)
    return "Reactivated coach: Arvid Lindblad"


def main():
    driver = create_driver()
    try:
        log("STEP 1: Log in as admin")
        login_as_admin(driver)
        log("PASS: Admin login")

        log("STEP 2: Wait for Coach Management")
        wait_for_coach_management(driver)
        log("PASS: Coach Management is ready")

        log("STEP 3: Reactivate Arvid Lindblad")
        result = reactivate_arvid_lindblad(driver)
        log(f"PASS: {result}")

        print("\nAdmin flow completed successfully.")
    except Exception as exc:
        take_screenshot(driver, "admin_flow_failure")
        print(f"\nAdmin flow failed: {exc}")
        sys.exit(1)
    finally:
        driver.quit()


if __name__ == "__main__":
    main()
