import time
from playwright.sync_api import sync_playwright, expect

def verify_app():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # 1. Go to the app
            import os
            base_url = os.environ.get("BASE_URL", "http://localhost:8501")
            page.goto(base_url, timeout=60000)

            # Wait for the app to load
            expect(page.get_by_text("Interactive String Art Generator")).to_be_visible(timeout=30000)

            # 2. Take a screenshot of the initial state (Greedy algorithm)
            page.screenshot(path="jules-scratch/verification/01_initial_state.png")

            # 3. Select the "Continuous Relaxation + Eulerization" algorithm
            page.get_by_text("Greedy Residual").click()
            page.get_by_text("Continuous Relaxation + Eulerization").click()
            expect(page.get_by_text("This algorithm is computationally intensive and may be slow.")).to_be_visible()
            page.screenshot(path="jules-scratch/verification/02_continuous_relaxation_selected.png")

            # 4. Select the "Simulated Annealing" algorithm
            page.get_by_text("Continuous Relaxation + Eulerization").click()
            page.get_by_text("Simulated Annealing").click()
            expect(page.get_by_text("Number of Lines (Sequence Length)")).to_be_visible()
            page.screenshot(path="jules-scratch/verification/03_simulated_annealing_selected.png")

            # 5. Generate string art with Simulated Annealing
            # Click the generate button
            generate_button = page.get_by_role("button", name="Generate String Art")
            generate_button.click()

            # 6. Wait for generation to complete and take a final screenshot
            # We'll wait for the "Done!" status text to appear
            expect(page.get_by_text("Done!")).to_be_visible(timeout=120000) # Long timeout for generation
            page.screenshot(path="jules-scratch/verification/04_final_art_generated.png")

            print("Verification script completed successfully.")

        except Exception as e:
            print(f"An error occurred: {e}")
            page.screenshot(path="jules-scratch/verification/error.png")

        finally:
            browser.close()

if __name__ == "__main__":
    verify_app()
