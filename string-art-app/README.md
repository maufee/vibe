# 🎨 String Art Simulator

This is an interactive web application for visualizing string art algorithms. It allows users to upload an image and see how different algorithms can approximate that image using a single continuous thread.

## How to Run the Application

1.  **No build step is required.** This is a static web application built with HTML, CSS, and vanilla JavaScript.
2.  You can serve the files with a simple local web server. For example, using Python's built-in server:
    ```bash
    python -m http.server
    ```
3.  Open your web browser and navigate to `http://localhost:8000/string-art-app/`.

## How to Run the Tests

The project uses Mocha and Chai for unit testing the algorithm logic. The tests can be run in a browser.

1.  Serve the files with a local web server as described above.
2.  Open your web browser and navigate to `http://localhost:8000/string-art-app/tests/test.html`.
3.  The test results will be displayed on the page.

## Features

*   **Image Upload:** You can upload any image to be used as the target for the string art.
*   **Algorithm Selection:** A dropdown menu allows you to choose from different string art algorithms.
    *   **Greedy Residual:** This algorithm is currently implemented. It iteratively chooses the next string that best reduces the difference between the string art and the target image.
    *   Other algorithms are planned for future development.
*   **Real-time Visualization:** The application visualizes the string art being created in real-time on one canvas, and shows the residual image (the difference between the target and the current string art) on another canvas.

---
**End of Document**
