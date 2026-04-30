from pathlib import Path
import os
import sys
import time

from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.common.by import By
from selenium.webdriver.edge.options import Options as EdgeOptions
from selenium.webdriver.edge.service import Service as EdgeService
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


BASE_URL = os.environ.get("UI_BASE_URL", "http://localhost:5173")
UI_TEST_EMAIL = os.environ.get("UI_TEST_EMAIL", "")
UI_TEST_PASSWORD = os.environ.get("UI_TEST_PASSWORD", "")
SCREENSHOTS_DIR = Path(__file__).resolve().parent / "screenshots"
SCREENSHOTS_DIR.mkdir(exist_ok=True)


def wait_for(driver, condition, timeout=20):
    return WebDriverWait(driver, timeout).until(condition)


def take_screenshot(driver, name):
    path = SCREENSHOTS_DIR / f"{name}.png"
    driver.save_screenshot(str(path))
    return path


def create_driver():
    try:
        chrome_options = ChromeOptions()
        chrome_options.add_argument("--start-maximized")
        chrome_options.add_experimental_option("excludeSwitches", ["enable-logging"])
        driver = webdriver.Chrome(service=ChromeService(), options=chrome_options)
        driver.implicitly_wait(2)
        return driver
    except Exception:
        edge_options = EdgeOptions()
        edge_options.add_argument("--start-maximized")
        driver = webdriver.Edge(service=EdgeService(), options=edge_options)
        driver.implicitly_wait(2)
        return driver


def click(driver, element):
    try:
        element.click()
    except Exception:
        driver.execute_script("arguments[0].click();", element)


def visible_text(driver):
    return driver.page_source.lower()


def find_visible_input_by_placeholder(driver, placeholder, timeout=20):
    xpath = f"//input[translate(@placeholder,'abcdefghijklmnopqrstuvwxyz','ABCDEFGHIJKLMNOPQRSTUVWXYZ')='{placeholder.upper()}']"
    return wait_for(driver, EC.visibility_of_element_located((By.XPATH, xpath)), timeout)


def login_as_client(driver):
    if not UI_TEST_EMAIL or not UI_TEST_PASSWORD:
        raise RuntimeError("UI_TEST_EMAIL and UI_TEST_PASSWORD must be set before running UI tests.")

    driver.get(BASE_URL)
    login_link = wait_for(driver, EC.element_to_be_clickable((By.XPATH, "//a[normalize-space()='Log In'] | //button[normalize-space()='Log In']")), 20)
    click(driver, login_link)

    email_input = find_visible_input_by_placeholder(driver, "EMAIL")
    password_input = find_visible_input_by_placeholder(driver, "PASSWORD")
    email_input.clear()
    email_input.send_keys(UI_TEST_EMAIL)
    password_input.clear()
    password_input.send_keys(UI_TEST_PASSWORD)

    submit_button = wait_for(
        driver,
        EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='LOG IN' or normalize-space()='Log In']")),
        20,
    )
    click(driver, submit_button)

    try:
        wait_for(
            driver,
            lambda d: "/client-dashboard" in d.current_url or "welcome back" in visible_text(d),
            25,
        )
    except Exception as exc:
        errors = [el.text.strip() for el in driver.find_elements(By.CSS_SELECTOR, ".feedback-msg.error") if el.text.strip()]
        if errors:
            raise RuntimeError(" | ".join(errors)) from exc
        raise


def run_test(driver, name, fn, results):
    print(f"RUNNING: {name}")
    try:
        fn(driver)
        print(f"PASS: {name}")
        results.append((name, True, ""))
    except Exception as exc:
        print(f"FAIL: {name} -> {exc}")
        take_screenshot(driver, name.lower().replace(" ", "_"))
        results.append((name, False, str(exc)))


def test_home_page(driver):
    driver.get(BASE_URL)
    wait_for(driver, lambda d: "primal" in visible_text(d) or "fitness" in visible_text(d), 20)


def test_exercises_page(driver):
    driver.get(f"{BASE_URL}/exercises")
    wait_for(driver, lambda d: "exercise" in visible_text(d), 20)


def test_coaches_page(driver):
    driver.get(f"{BASE_URL}/coaches")
    wait_for(driver, lambda d: "coach" in visible_text(d), 20)


def test_client_dashboard(driver):
    driver.get(f"{BASE_URL}/client-dashboard")
    wait_for(driver, lambda d: "welcome back" in visible_text(d) and "my coach" in visible_text(d), 20)


def test_activity_logger_page(driver):
    driver.get(f"{BASE_URL}/activity-logger")
    wait_for(driver, lambda d: "activity logger" in visible_text(d), 20)


def test_view_progress_page(driver):
    driver.get(f"{BASE_URL}/view-progress")
    wait_for(driver, lambda d: "progress" in visible_text(d), 20)


def test_profile_page(driver):
    driver.get(f"{BASE_URL}/profile")
    wait_for(driver, lambda d: "user profile" in visible_text(d), 20)


def main():
    driver = create_driver()
    results = []
    try:
        run_test(driver, "Home Page", test_home_page, results)
        run_test(driver, "Exercises Page", test_exercises_page, results)
        run_test(driver, "Coaches Page", test_coaches_page, results)

        print("RUNNING: Client Login")
        login_as_client(driver)
        print("PASS: Client Login")
        results.append(("Client Login", True, ""))

        run_test(driver, "Client Dashboard", test_client_dashboard, results)
        run_test(driver, "Activity Logger Page", test_activity_logger_page, results)
        run_test(driver, "View Progress Page", test_view_progress_page, results)
        run_test(driver, "Profile Page", test_profile_page, results)
    except Exception as exc:
        print(f"FAIL: Client Login -> {exc}")
        take_screenshot(driver, "client_login")
        results.append(("Client Login", False, str(exc)))
    finally:
        print("\n=== UI TEST SUMMARY ===")
        failures = 0
        for name, passed, message in results:
            status = "PASS" if passed else "FAIL"
            print(f"{status} | {name}")
            if not passed and message:
                print(f"      Message: {message}")
                failures += 1
        if failures:
            print(f"\nCompleted with {failures} failing test(s).")
            driver.quit()
            sys.exit(1)
        print("\nAll UI smoke tests passed.")
        driver.quit()


if __name__ == "__main__":
    main()
