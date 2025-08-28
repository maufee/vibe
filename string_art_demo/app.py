import streamlit as st
import numpy as np
import cv2
from PIL import Image
import io
import matplotlib.pyplot as plt

# --- Algorithm Imports ---
from algorithms.greedy import generate_pin_coords, GreedyAlgorithm
from algorithms.continuous_relaxation import ContinuousRelaxationAlgorithm
from algorithms.simulated_annealing import SimulatedAnnealingAlgorithm

# --- App Configuration ---
st.set_page_config(
    page_title="Interactive String Art Generator",
    page_icon="🎨",
    layout="wide",
)

# --- Algorithm Mapping ---
ALGORITHMS = {
    "Greedy Residual": GreedyAlgorithm,
    "Continuous Relaxation + Eulerization": ContinuousRelaxationAlgorithm,
    "Simulated Annealing": SimulatedAnnealingAlgorithm,
}

# --- Helper Functions ---
def load_image(image_file, target_size=(300, 300)):
    """Loads an image, converts to grayscale, and resizes."""
    if image_file is not None:
        try:
            img = Image.open(image_file).convert("RGB")
            img_array = np.array(img)
            gray_img = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
            resized_img = cv2.resize(gray_img, target_size)
            return resized_img
        except Exception as e:
            st.error(f"Error loading image: {e}")
            return None
    return None

def get_algorithm_params(algo_name):
    params = {}
    if algo_name == "Greedy Residual":
        params["max_lines"] = st.slider("Number of Lines", 100, 5000, 1000, 100)
        params["line_darkness"] = st.slider("Line Darkness", 1, 50, 20, 1)
    elif algo_name == "Continuous Relaxation + Eulerization":
        st.info("This algorithm is computationally intensive and may be slow.")
        # No specific parameters for now, but we could add some (e.g., for rounding)
    elif algo_name == "Simulated Annealing":
        params["max_lines"] = st.slider("Number of Lines (Sequence Length)", 100, 2000, 500, 50)
        params["start_temp"] = st.number_input("Start Temperature", value=1000)
        params["cooling_rate"] = st.slider("Cooling Rate", 0.9, 0.999, 0.99, 0.001)
        params["line_darkness"] = st.slider("Line Darkness", 1, 50, 25, 1)
    return params

# --- UI Sidebar ---
with st.sidebar:
    st.title("🎨 String Art Controls")

    st.header("1. Choose an Image")
    uploaded_file = st.file_uploader("Upload an image", type=["png", "jpg", "jpeg"])

    default_image_path = "string_art_demo/assets/einstein.jpg"
    if uploaded_file is None:
        try:
            with open(default_image_path, "rb") as f:
                uploaded_file = io.BytesIO(f.read())
            st.info("Using default: Einstein. Upload your own image.")
        except FileNotFoundError:
            st.error(f"Default image not found at {default_image_path}.")
            uploaded_file = None

    st.header("2. Choose an Algorithm")
    algorithm_name = st.selectbox("Algorithm", list(ALGORITHMS.keys()))

    st.header("3. Set Parameters")
    num_pins = st.slider("Number of Pins", 50, 400, 150, 10)
    algo_params = get_algorithm_params(algorithm_name)

    st.header("4. Generate")
    generate_button = st.button("Generate String Art", type="primary", disabled=(uploaded_file is None))

# --- Main App ---
st.title("Interactive String Art Generator")
st.write(
    "Create string art from an image using different algorithms. "
    "Choose an image, an algorithm, and parameters in the sidebar, then click 'Generate'."
)

# Initialize session state
if 'generated_art' not in st.session_state:
    st.session_state.generated_art = None
if 'extra_vis' not in st.session_state:
    st.session_state.extra_vis = None

# --- Image and Results Display ---
col1, col2, col3 = st.columns(3)

target_image = None
if uploaded_file:
    target_image = load_image(uploaded_file)

with col1:
    st.header("Original Image")
    if target_image is not None:
        st.image(target_image, caption="Grayscale Target", use_container_width=True)
    else:
        st.warning("Please upload an image.")

with col2:
    st.header("String Art")
    string_art_placeholder = st.empty()
    if st.session_state.generated_art is not None:
        string_art_placeholder.image(st.session_state.generated_art, caption="Final Result", use_container_width=True)
    elif target_image is not None:
        string_art_placeholder.image(np.zeros_like(target_image) + 255, caption="Result will appear here", use_container_width=True)

with col3:
    st.header("Algorithm Visualization")
    extra_vis_placeholder = st.empty()
    if st.session_state.extra_vis is not None:
        import matplotlib.pyplot as plt
        if isinstance(st.session_state.extra_vis, plt.Figure):
            extra_vis_placeholder.pyplot(st.session_state.extra_vis)
        else:
            extra_vis_placeholder.image(st.session_state.extra_vis, caption="Algorithm-specific data", use_container_width=True)
    elif target_image is not None:
        extra_vis_placeholder.image(target_image, caption="Residual, heatmap, etc.", use_container_width=True)

# --- Generation Logic ---
if generate_button and target_image is not None:
    progress_bar = st.progress(0)
    status_text = st.empty()

    pin_coords = generate_pin_coords(num_pins, target_image.shape)

    AlgorithmClass = ALGORITHMS[algorithm_name]
    algorithm = AlgorithmClass()

    generator = algorithm.run(
        target_image=target_image,
        pin_coords=pin_coords,
        **algo_params
    )

    final_canvas = None

    for result in generator:
        if result.get("error"):
            st.error(result["status"])
            break

        progress = result.get("progress", 0)
        progress_bar.progress(progress)
        status_text.text(result.get("status", ""))

        if "canvas" in result:
            final_canvas = result["canvas"]
            string_art_placeholder.image(final_canvas, use_container_width=True)

        if "residual" in result:
            st.session_state.extra_vis = result["residual"]
            extra_vis_placeholder.image(result["residual"], caption="Residual Error", use_container_width=True)

        if "heatmap" in result:
            # Visualize the chord weights as a bar chart
            fig, ax = plt.subplots()
            ax.bar(range(len(result["heatmap"])), result["heatmap"])
            ax.set_title("Chord Weights (Heatmap)")
            ax.set_xlabel("Chord Index")
            ax.set_ylabel("Weight")
            st.session_state.extra_vis = fig
            extra_vis_placeholder.pyplot(fig)

    progress_bar.progress(1.0)
    if final_canvas is not None:
        st.session_state.generated_art = final_canvas
        string_art_placeholder.image(final_canvas, caption="Final Result", use_container_width=True)

    st.success("String art generation complete!")
    st.rerun()
