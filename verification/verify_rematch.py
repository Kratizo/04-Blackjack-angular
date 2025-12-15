
import time
from playwright.sync_api import sync_playwright

def verify_rematch():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # Player 1
        c1 = browser.new_context()
        p1 = c1.new_page()
        user1 = '{"id":"p1","alias":"Player1","frameIcon":"f1","userIcon":"u1","slogan":"S1"}'
        p1.goto("http://localhost:4200/")
        p1.evaluate(f"localStorage.setItem('blackjack_session', '{user1}');")
        p1.goto("http://localhost:4200/PlayerVsPlayer")

        # Player 2
        c2 = browser.new_context()
        p2 = c2.new_page()
        user2 = '{"id":"p2","alias":"Player2","frameIcon":"f2","userIcon":"u2","slogan":"S2"}'
        p2.goto("http://localhost:4200/")
        p2.evaluate(f"localStorage.setItem('blackjack_session', '{user2}');")
        p2.goto("http://localhost:4200/PlayerVsPlayer")

        print("Waiting for game start...")
        # Wait for "PEDIR CARTA" button
        p1.wait_for_selector("button:has-text('PEDIR CARTA')", timeout=10000)
        p2.wait_for_selector("button:has-text('PEDIR CARTA')", timeout=10000)
        print("Game started.")

        # Play until game over.
        # Strategy: Both Stand immediately.
        # Current logic: P1 Stand -> P2 Turn -> P2 Stand -> End.

        # P1 Stands
        # Check whose turn it is. The UI highlights turn.
        # But server says P1 starts usually (or random).
        # We can just try to click Stand on both. If disabled, it does nothing.

        print("Attempting to end game (Both Stand)...")

        # Helper to click stand
        def try_stand(page, name):
            try:
                btn = page.locator("button:has-text('PLANTARSE')")
                if btn.is_enabled():
                    btn.click()
                    print(f"{name} Stood.")
                    return True
            except:
                pass
            return False

        # Try loop for a few seconds
        for _ in range(10):
            try_stand(p1, "P1")
            try_stand(p2, "P2")

            # Check for Game Over text
            if p1.locator("text=GANASTE").count() > 0 or p1.locator("text=PERDISTE").count() > 0 or p1.locator("text=EMPATE").count() > 0:
                print("Game Over detected.")
                break
            time.sleep(0.5)

        # Check for Rematch button
        try:
            p1.wait_for_selector("button:has-text('Jugar de nuevo')", timeout=5000)
            print("Rematch button found on P1.")
            p1.screenshot(path="verification/rematch_ui.png")
        except:
            print("Rematch button NOT found on P1.")
            p1.screenshot(path="verification/p1_fail.png")
            return

        # Click Rematch on P1
        p1.locator("button:has-text('Jugar de nuevo')").click()
        print("P1 clicked Rematch.")

        # Verify P1 shows "Esperando..."
        time.sleep(1)
        if "Esperando..." in p1.content():
            print("P1 shows waiting status.")
        else:
            print("P1 does NOT show waiting status.")

        # Click Rematch on P2
        p2.locator("button:has-text('Jugar de nuevo')").click()
        print("P2 clicked Rematch.")

        # Expect restart
        print("Waiting for restart...")
        try:
            # "Jugar de nuevo" should disappear, "PEDIR CARTA" appear
            p1.wait_for_selector("button:has-text('PEDIR CARTA')", timeout=10000)
            print("Game Restarted successfully!")
        except:
             print("Game did not restart.")
             p1.screenshot(path="verification/restart_fail.png")

        browser.close()

if __name__ == "__main__":
    verify_rematch()
