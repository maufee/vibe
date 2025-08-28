from playwright.sync_api import sync_playwright, expect
import pathlib
import base64

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        file_path = pathlib.Path(__file__).parent.parent.parent.resolve() / "string-art-app/index.html"
        page.goto(f"file://{file_path}")

        expect(page.get_by_role("heading", name="String Art Simulator")).to_be_visible()

        data_url = page.evaluate("""() => {
            const canvas = document.createElement('canvas');
            canvas.width = 100;
            canvas.height = 100;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, 100, 100);
            ctx.fillStyle = 'black';
            ctx.fillRect(25, 25, 50, 50);
            return canvas.toDataURL('image/png');
        }""")

        header, encoded = data_url.split(",", 1)
        image_data = base64.b64decode(encoded)

        image_loaded_promise = page.evaluate("() => new Promise(resolve => document.getElementById('image-upload').addEventListener('image-loaded', resolve))")

        file_input = page.locator("#image-upload")
        file_input.set_input_files(
            files=[
                {"name": "test.png", "mimeType": "image/png", "buffer": image_data}
            ]
        )

        image_loaded_promise

        page.get_by_label("Choose Algorithm:").select_option("annealing")

        start_button = page.get_by_role("button", name="Start")
        start_button.click()

        expect(start_button).to_be_enabled(timeout=60000)

        screenshot_path = "jules-scratch/verification/verification_sa.png"
        page.screenshot(path=screenshot_path)

        browser.close()
        print(f"Screenshot saved to {screenshot_path}")

if __name__ == "__main__":
    run_verification()
