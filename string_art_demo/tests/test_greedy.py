import numpy as np
import pytest
from string_art_demo.algorithms.greedy import (
    generate_pin_coords,
    GreedyAlgorithm
)

def test_generate_pin_coords():
    """
    Tests the pin coordinate generation.
    """
    num_pins = 10
    image_shape = (100, 100)
    coords = generate_pin_coords(num_pins, image_shape)

    # Check if the correct number of pins are generated
    assert len(coords) == num_pins

    # Check if coordinates are within the image bounds
    for y, x in coords:
        assert 0 <= y < image_shape[0]
        assert 0 <= x < image_shape[1]

def test_get_all_chords():
    """
    Tests the chord generation.
    """
    algo = GreedyAlgorithm()
    num_pins = 4
    # For 4 pins, chords should be (0,1), (0,2), (0,3), (1,2), (1,3), (2,3)
    # Total = 3 + 2 + 1 = 6
    expected_num_chords = (num_pins * (num_pins - 1)) // 2
    chords = algo._get_all_chords(num_pins)

    assert len(chords) == expected_num_chords
    assert (0, 1) in chords
    assert (2, 3) in chords
    assert (0, 3) in chords
    assert len(set(chords)) == len(chords), "Chords should be unique"

def test_draw_line_on_canvas():
    """
    Tests if the line drawing function modifies the canvas.
    """
    algo = GreedyAlgorithm()
    canvas = np.zeros((50, 50), dtype=np.uint16)
    start_coord = (10, 10)
    end_coord = (40, 40)
    line_darkness = 25

    algo._draw_line_on_canvas(canvas, start_coord, end_coord, line_darkness)

    # The canvas should no longer be all zeros
    assert np.sum(canvas) > 0

    # Check if the pixels on the line have been modified
    # A simple check: the start and end points should be colored
    assert canvas[start_coord[0], start_coord[1]] > 0
    assert canvas[end_coord[0], end_coord[1]] > 0

def test_greedy_algorithm_run():
    """
    Tests the main run method of the GreedyAlgorithm.
    """
    algo = GreedyAlgorithm()
    image_shape = (100, 100)
    target_image = np.full(image_shape, 255, dtype=np.uint8)
    # Make a black square in the middle
    target_image[40:60, 40:60] = 0

    num_pins = 20
    pin_coords = generate_pin_coords(num_pins, image_shape)
    max_lines = 10

    generator = algo.run(
        target_image=target_image,
        pin_coords=pin_coords,
        max_lines=max_lines,
        line_darkness=25
    )

    results = list(generator)

    # Check if it ran for the correct number of lines
    assert len(results) == max_lines

    # Check the structure of the output
    first_result = results[0]
    assert "line_num" in first_result
    assert "chord" in first_result
    assert "canvas" in first_result
    assert "residual" in first_result

    assert first_result["line_num"] == 1
    assert isinstance(first_result["chord"], tuple)
    assert first_result["canvas"].shape == image_shape

    # Check that the final canvas is not blank (i.e., not all white)
    final_canvas = results[-1]["canvas"]
    assert np.sum(final_canvas) < np.sum(np.full(image_shape, 255))
