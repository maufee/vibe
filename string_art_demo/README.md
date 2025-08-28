# 🎨 Interactive String Art Demo

This project is a Python-based interactive application that generates string art from images. It provides a visual and hands-on way to explore how different computer science algorithms can be applied to create complex and beautiful artistic patterns.

The application is built using [Streamlit](https://streamlit.io/), a fast and easy way to create data apps in Python.

## ✨ Features

*   **Custom Image Upload**: Upload your own images to turn them into string art, or use the provided default image.
*   **Multiple Algorithms**: Choose from several distinct algorithms to generate the art:
    *   **Greedy Residual**: A fast and effective algorithm that iteratively adds the best possible string at each step.
    *   **Continuous Relaxation + Eulerization**: A more complex, global optimization approach that solves for all string weights at once and then constructs a single continuous thread.
    *   **Simulated Annealing**: A probabilistic method that explores a wide range of solutions to avoid getting stuck in local optima, often producing more organic-looking results.
*   **Adjustable Parameters**: Fine-tune the generation process by changing parameters like:
    *   The number of pins around the frame.
    *   The total number of lines (strings) to use.
    *   Algorithm-specific settings (e.g., temperature and cooling rate for Simulated Annealing).
*   **Real-time Visualization**: Watch the string art being created line by line. The application also displays algorithm-specific visualizations, such as the residual error or chord weight heatmaps, to give insight into how each algorithm "thinks".

## 🚀 How to Run the Demo

To run the demo on your local machine, follow these steps:

1.  **Prerequisites**: Ensure you have Python 3.8 or newer installed.

2.  **Navigate to the Demo Directory**:
    Open your terminal and change into this directory.
    ```bash
    cd path/to/your/repo/string_art_demo
    ```

3.  **Install Dependencies**:
    Install all the required Python packages using the `requirements.txt` file.
    ```bash
    pip install -r requirements.txt
    ```

4.  **Run the Streamlit App**:
    Start the application using the `streamlit run` command.
    ```bash
    streamlit run app.py
    ```

5.  **View in Browser**:
    Your web browser should automatically open a new tab with the application running. If not, your terminal will display a local URL (usually `http://localhost:8501`) that you can navigate to.

## 🧑‍🔬 Experiment and Explore!

The best way to use this demo is to experiment! Try the following:

*   **Different Images**: How do high-contrast images compare to images with subtle gradients?
*   **Pin Count**: See how a low vs. high number of pins affects the detail and final look.
*   **Algorithm Comparison**: Generate art from the same image using all three algorithms. Notice the differences in their style, speed, and final appearance.
*   **Tweak Parameters**: Play with the `max_lines` or the Simulated Annealing parameters to see how they influence the outcome.

Enjoy creating your own string art!
