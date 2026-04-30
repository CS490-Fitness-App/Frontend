from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class LoginPage:
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)
        
        # Shared Locators
        self.EMAIL_FIELD = (By.CSS_SELECTOR, ".login input[type='email']")
        self.PASSWORD_FIELD = (By.CSS_SELECTOR, "input[placeholder='PASSWORD']")
        self.SUBMIT_BTN1 = (By.ID, "login-button")
        self.SUBMIT_BTN2 = (By.ID, "signup-button")
        self.SWITCH_TO_SIGNUP = (By.LINK_TEXT, "Sign up now")
        
        # Signup Specific Locators
        self.FIRST_NAME = (By.CSS_SELECTOR, "input[placeholder='FIRST NAME']")
        self.LAST_NAME = (By.CSS_SELECTOR, "input[placeholder='LAST NAME']")
        self.CONFIRM_PASSWORD = (By.CSS_SELECTOR, "input[placeholder='CONFIRM PASSWORD']")
        self.COACH_ROLE_BTN = (By.XPATH, "//div[text()='COACH']")

    def login(self, email, password):
        # 1. Wait for the LOGIN container specifically to be visible
        # This ensures we aren't looking at the background signup form
        login_container = self.wait.until(EC.visibility_of_element_located((By.CLASS_NAME, "login")))
    
        # 2. Find the email field WITHIN the login container
        # This prevents Selenium from finding the wrong 'email' input
        email_input = login_container.find_element(By.CSS_SELECTOR, "input[type='email']")
    
        # 3. Use ActionChains to ensure the cursor actually clicks and focuses
        from selenium.webdriver.common.action_chains import ActionChains
        actions = ActionChains(self.driver)
        actions.move_to_element(email_input).click().send_keys(email).perform()
    
        # 4. Finish the rest of the form
        self.driver.find_element(*self.PASSWORD_FIELD).send_keys(password)
    
        # 5. Use a JavaScript click for the final button to bypass any modal overlays
        submit_btn = self.driver.find_element(*self.SUBMIT_BTN1)
        self.driver.execute_script("arguments.click();", submit_btn)


    def signup(self, first, last, email, password):
        signup_link = self.wait.until(EC.element_to_be_clickable(self.SWITCH_TO_SIGNUP))
        signup_link.click()

        first_name_el = self.wait.until(EC.element_to_be_clickable(self.FIRST_NAME))
        
        first_name_el.send_keys(first)
        self.driver.find_element(*self.LAST_NAME).send_keys(last)
        self.driver.find_element(*self.EMAIL_FIELD).send_keys(email)
        self.driver.find_element(*self.PASSWORD_FIELD).send_keys(password)
        self.driver.find_element(*self.SUBMIT_BTN2).click()