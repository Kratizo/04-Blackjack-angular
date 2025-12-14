from playwright.sync_api import sync_playwright

def verify_auth_modals():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # 1. Navigate to the main page
            page.goto("http://localhost:4200/")
            page.wait_for_load_state("networkidle")

            # 2. Click the Auth Trigger icon (user icon)
            # Use aria-label to be specific
            page.locator("button[aria-label='User Menu']").click()

            # 3. Take screenshot of the dropdown menu
            page.screenshot(path="verification/1_menu_open.png")
            print("Screenshot 1: Menu open")

            # 4. Click "Iniciar sesión"
            page.get_by_text("Iniciar sesión").click()

            # 5. Take screenshot of Login Modal
            page.screenshot(path="verification/2_login_modal.png")
            print("Screenshot 2: Login Modal")

            # 6. Close Login Modal
            # Find the close button inside the modal specifically
            page.locator("login-form button").first.click()

            # 7. Open Menu again
            page.locator("button[aria-label='User Menu']").click()

            # 8. Click "Crear cuenta"
            page.get_by_text("Crear cuenta").click()

            # 9. Take screenshot of Register Modal
            page.screenshot(path="verification/3_register_modal.png")
            print("Screenshot 3: Register Modal")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_auth_modals()
