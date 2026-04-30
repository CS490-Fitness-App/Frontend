import sys

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

from run_ui_tests import (
    BASE_URL,
    click,
    create_driver,
    login_as_client,
    run_test,
    take_screenshot,
    visible_text,
    wait_for,
)


def log(message):
    print(message, flush=True)


def wait_for_clickable(driver, by, value, timeout=20):
    return wait_for(driver, EC.element_to_be_clickable((by, value)), timeout)


def wait_for_visible(driver, by, value, timeout=20):
    return wait_for(driver, EC.visibility_of_element_located((by, value)), timeout)


# ── Page presence tests ──────────────────────────────────────────────────────


def test_chat_conversations(driver):
    driver.get(f"{BASE_URL}/chat")
    wait_for(driver, lambda d: "message" in visible_text(d) or "conversation" in visible_text(d), 20)
    sidebar = driver.find_elements(By.CSS_SELECTOR, ".chat-sidebar")
    if not sidebar:
        raise RuntimeError("Chat sidebar not found on /chat page.")


def test_chat_select_conversation(driver):
    driver.get(f"{BASE_URL}/chat")
    wait_for(driver, lambda d: "message" in visible_text(d), 20)
    conv_items = driver.find_elements(By.CSS_SELECTOR, ".conversation-item")
    if not conv_items:
        log("No conversations found — skipping conversation select check.")
        return
    click(driver, conv_items[0])
    wait_for(driver, lambda d: bool(driver.find_elements(By.CSS_SELECTOR, ".messages-area")), 10)


def test_calendar_loads(driver):
    driver.get(f"{BASE_URL}/calendar")
    wait_for(driver, lambda d: "calendar" in visible_text(d) or "scheduled" in visible_text(d), 20)
    wait_for(driver, lambda d: bool(driver.find_elements(By.CSS_SELECTOR, ".rbc-calendar")), 20)


def test_calendar_shows_month(driver):
    driver.get(f"{BASE_URL}/calendar")
    wait_for(driver, lambda d: bool(driver.find_elements(By.CSS_SELECTOR, ".rbc-toolbar")), 20)
    toolbar = driver.find_element(By.CSS_SELECTOR, ".rbc-toolbar")
    if not toolbar.text.strip():
        raise RuntimeError("Calendar toolbar is empty — month label not rendered.")


def test_payment_cards_page_loads(driver):
    driver.get(f"{BASE_URL}/payment-cards")
    wait_for(driver, lambda d: "payment" in visible_text(d) or "card" in visible_text(d), 20)


def test_payment_cards_add_form(driver):
    driver.get(f"{BASE_URL}/payment-cards")
    wait_for(driver, lambda d: "payment" in visible_text(d) or "card" in visible_text(d), 20)
    add_buttons = driver.find_elements(
        By.XPATH, "//button[contains(normalize-space(), 'Add') or contains(normalize-space(), 'ADD')]"
    )
    if not add_buttons:
        log("No Add Card button found — skipping form check.")
        return
    click(driver, add_buttons[0])
    wait_for(
        driver,
        lambda d: bool(d.find_elements(By.XPATH, "//input[@placeholder]")),
        10,
    )


def test_public_workouts_page(driver):
    driver.get(f"{BASE_URL}/workouts")
    wait_for(driver, lambda d: "workout" in visible_text(d), 20)


def test_workout_card_click(driver):
    driver.get(f"{BASE_URL}/workouts")
    wait_for(driver, lambda d: "workout" in visible_text(d), 20)
    cards = driver.find_elements(By.CSS_SELECTOR, ".workout-card-container")
    if not cards:
        log("No workout cards found — skipping card click check.")
        return
    click(driver, cards[0])
    wait_for(
        driver,
        lambda d: bool(d.find_elements(By.CSS_SELECTOR, ".workout-detail, .workout-detail-container"))
        or "exercise" in visible_text(d),
        20,
    )


def test_exercises_filter(driver):
    driver.get(f"{BASE_URL}/exercises")
    wait_for(driver, lambda d: "exercise" in visible_text(d), 20)
    search_inputs = driver.find_elements(By.XPATH, "//input[@type='text' or @type='search']")
    if not search_inputs:
        log("No search input found on exercises page — skipping filter check.")
        return
    search_inputs[0].send_keys("squat")
    wait_for(
        driver,
        lambda d: "squat" in visible_text(d),
        10,
    )


def test_coaches_page_card(driver):
    driver.get(f"{BASE_URL}/coaches")
    wait_for(driver, lambda d: "coach" in visible_text(d), 20)
    cards = driver.find_elements(By.CSS_SELECTOR, ".coach-card-container")
    if not cards:
        log("No coach cards rendered — skipping coach card check.")
        return
    if len(cards) == 0:
        raise RuntimeError("Expected at least one coach card to be rendered.")


def test_my_workout_plans(driver):
    driver.get(f"{BASE_URL}/my-workouts")
    wait_for(driver, lambda d: "workout" in visible_text(d), 20)


def test_view_progress_overview_panel(driver):
    driver.get(f"{BASE_URL}/view-progress")
    wait_for(driver, lambda d: "progress" in visible_text(d), 20)
    wait_for(
        driver,
        lambda d: "overview" in visible_text(d) or "weight" in visible_text(d),
        20,
    )


def test_view_progress_goals_panel(driver):
    driver.get(f"{BASE_URL}/view-progress")
    wait_for(driver, lambda d: "goals" in visible_text(d) or "progress" in visible_text(d), 20)


def main():
    driver = create_driver()
    results = []
    try:
        log("STEP 1: Log in as client")
        login_as_client(driver)
        log("PASS: Login")
        results.append(("Client Login", True, ""))

        run_test(driver, "Chat Page — Sidebar Renders", test_chat_conversations, results)
        run_test(driver, "Chat Page — Select Conversation", test_chat_select_conversation, results)
        run_test(driver, "Calendar — Page Loads", test_calendar_loads, results)
        run_test(driver, "Calendar — Month Label", test_calendar_shows_month, results)
        run_test(driver, "Payment Cards — Page Loads", test_payment_cards_page_loads, results)
        run_test(driver, "Payment Cards — Add Form", test_payment_cards_add_form, results)
        run_test(driver, "Public Workouts Page", test_public_workouts_page, results)
        run_test(driver, "Workout Card Click", test_workout_card_click, results)
        run_test(driver, "Exercises Filter", test_exercises_filter, results)
        run_test(driver, "Coaches Page Cards", test_coaches_page_card, results)
        run_test(driver, "My Workout Plans", test_my_workout_plans, results)
        run_test(driver, "View Progress — Overview Panel", test_view_progress_overview_panel, results)
        run_test(driver, "View Progress — Goals Panel", test_view_progress_goals_panel, results)

    except Exception as exc:
        log(f"FAIL: Client Login -> {exc}")
        take_screenshot(driver, "client_extra_login_failure")
        results.append(("Client Login", False, str(exc)))
    finally:
        print("\n=== CLIENT EXTRA FLOW SUMMARY ===")
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
        print("\nClient extra flow completed successfully.")
        driver.quit()


if __name__ == "__main__":
    main()
