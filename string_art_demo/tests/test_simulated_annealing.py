import numpy as np
import pytest
from string_art_demo.algorithms.simulated_annealing import SimulatedAnnealingAlgorithm
from string_art_demo.algorithms.greedy import generate_pin_coords

def test_simulated_annealing_run():
    """
    Tests the main run method of the SimulatedAnnealingAlgorithm.
    This is a basic test to ensure the generator runs without errors
    and produces output in the expected format.
    """
    algo = SimulatedAnnealingAlgorithm()
    image_shape = (50, 50)
    target_image = np.full(image_shape, 255, dtype=np.uint8)
    target_image[20:30, 20:30] = 0

    num_pins = 15
    pin_coords = generate_pin_coords(num_pins, image_shape)

    # Use fewer lines and a faster cooling for the test
    generator = algo.run(
        target_image=target_image,
        pin_coords=pin_coords,
        max_lines=50,
        start_temp=100,
        cooling_rate=0.9
    )

    results = list(generator)

    # Check that the generator produced some results
    assert len(results) > 0

    # Check the final result
    final_result = results[-1]
    assert "status" in final_result
    assert "progress" in final_result
    assert final_result["progress"] == 1.0

    assert "canvas" in final_result
    assert final_result["canvas"].shape == image_shape
    # Check that the canvas is not all white
    assert np.sum(final_result["canvas"]) < np.sum(np.full(image_shape, 255))
