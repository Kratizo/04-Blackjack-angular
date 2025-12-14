
import time
from playwright.sync_api import sync_playwright

def verify_connection_state():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        user_data = '{"id":"test-user","alias":"Tester","frameIcon":"frame1","userIcon":"icon1","slogan":"Ready"}'

        # 1. Navigate to root to initialize origin
        page.goto("http://localhost:4200/")

        # 2. Inject session
        print("Injecting session...")
        page.evaluate(f"""
            localStorage.setItem('blackjack_session', '{user_data}');
            localStorage.setItem('blackjack_last_activity', '{int(time.time() * 1000)}');
        """)

        # Check if injected
        val = page.evaluate("localStorage.getItem('blackjack_session')")
        print(f"Value after injection: {val}")

        # 3. Navigate to PvP
        print("Navigating to PvP page...")
        page.goto("http://localhost:4200/PlayerVsPlayer")

        time.sleep(5)

        print(f"Current URL: {page.url}")

        # Check storage again
        val_after = page.evaluate("localStorage.getItem('blackjack_session')")
        print(f"Value after navigation: {val_after}")

        print("Taking screenshot...")
        page.screenshot(path="/home/jules/verification/pvp_state.png")

        content = page.content()
        if "Esperando oponente" in content:
            print("State: Waiting for opponent (Success)")
        elif "Conectando con el servidor" in content:
            print("State: Connecting (Success)")
        else:
            print("State: Unknown")
            print("Body text snippet:")
            # Print visible text only to be cleaner
            print(page.evaluate("document.body.innerText")[:500])

        browser.close()

if __name__ == "__main__":
    verify_connection_state()
