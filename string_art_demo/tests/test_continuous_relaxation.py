import numpy as np
import pytest
from string_art_demo.algorithms.continuous_relaxation import ContinuousRelaxationAlgorithm
from string_art_demo.algorithms.greedy import generate_pin_coords

@pytest.mark.slow  # Mark this test as slow
def test_continuous_relaxation_run():
    """
    Tests the main run method of the ContinuousRelaxationAlgorithm.
    This is a basic test to ensure the generator runs without errors
    and produces output in the expected format.
    """
    algo = ContinuousRelaxationAlgorithm()
    image_shape = (50, 50)  # Use a smaller image for testing to speed up NNLS
    target_image = np.full(image_shape, 255, dtype=np.uint8)
    target_image[20:30, 20:30] = 0  # A black square

    num_pins = 15  # Fewer pins to reduce complexity
    pin_coords = generate_pin_coords(num_pins, image_shape)

    # The algorithm doesn't use max_lines directly, but we pass it
    generator = algo.run(
        target_image=target_image,
        pin_coords=pin_coords
    )

    results = list(generator)

    # Check that the generator produced some results
    assert len(results) > 0

    # Check the final result
    final_result = results[-1]
    assert "status" in final_result
    assert "progress" in final_result
    assert final_result["progress"] == 1.0

    # If the algorithm ran successfully, it should produce a canvas
    if "error" not in final_result:
        assert "canvas" in final_result
        assert final_result["canvas"].shape == image_shape
        # Check that the canvas is not all white
        assert np.sum(final_result["canvas"]) < np.sum(np.full(image_shape, 255))
