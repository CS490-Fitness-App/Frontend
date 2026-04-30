from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from pages.login_page import LoginPage

class HomePage:
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)
        self.url = "http://localhost:5173"
        
        self.HERO_START_BTN = (By.CSS_SELECTOR, ".hero-card .btn")
        self.EXERCISE_LINK = (By.LINK_TEXT, "Browse All Exercises")
        self.WORKOUT_LINK = (By.LINK_TEXT, "Browse Workout Plans")
        self.COACHES_LINK = (By.LINK_TEXT, "Browse Coaches")
        self.LOGIN_MODAL = (By.CLASS_NAME, "modal-container") 

    def load(self):
        self.driver.get(self.url)

    def click_start_now(self):
        button = self.wait.until(EC.element_to_be_clickable(self.HERO_START_BTN))
        button.click()
        return LoginPage(self.driver)

    def navigate_to_exercises(self):
        self.driver.find_element(*self.EXERCISE_LINK).click()

    def navigate_to_workouts(self):
        self.driver.find_element(*self.WORKOUT_LINK).click()

    def navigate_to_coaches(self):
        self.driver.find_element(*self.COACHES_LINK).click()