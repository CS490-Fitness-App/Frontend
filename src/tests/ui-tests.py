from selenium import webdriver
from pages.home_page import HomePage
import pytest

def test_client_login(driver):
    home = HomePage(driver)
    home.load()

    # Flow: homepage -> open login form -> fill it in -> submit
    login_modal = home.click_start_now()
    login_modal.login("bob.smith@gmail.com", "ABcd1234!")

    assert "/survey" in driver.current_url