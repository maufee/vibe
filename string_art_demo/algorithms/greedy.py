import numpy as np
from skimage.draw import line as skimage_line
from .base import BaseStringArtAlgorithm

def generate_pin_coords(num_pins, image_shape):
    """
    Generates coordinates for pins evenly spaced on a circle that fits within the image.
    """
    center_x = image_shape[1] / 2
    center_y = image_shape[0] / 2
    radius = min(center_x, center_y) - 1

    coords = []
    for i in range(num_pins):
        angle = 2 * np.pi * i / num_pins
        x = int(center_x + radius * np.cos(angle))
        y = int(center_y + radius * np.sin(angle))
        coords.append((y, x))
    return np.array(coords)


class GreedyAlgorithm(BaseStringArtAlgorithm):
    """
    Implements the greedy string art algorithm.
    """

    def _get_all_chords(self, num_pins):
        """
        Generates all possible chords between pins, avoiding duplicates.
        A chord is a tuple of two pin indices.
        """
        chords = []
        for i in range(num_pins):
            for j in range(i + 1, num_pins):
                chords.append((i, j))
        return chords

    def _draw_line_on_canvas(self, canvas, start_pin_coord, end_pin_coord, line_darkness=25):
        """
        Draws a single line on the canvas. Modifies the canvas in place.
        """
        rr, cc = skimage_line(start_pin_coord[0], start_pin_coord[1], end_pin_coord[0], end_pin_coord[1])
        # Add a fixed darkness value, capping at 255
        canvas[rr, cc] = np.minimum(canvas[rr, cc] + line_darkness, 255)


    def run(self, target_image, pin_coords, max_lines=200, line_darkness=25, **kwargs):
        """
        Runs the greedy string art algorithm.

        Args:
            target_image (np.ndarray): The target grayscale image.
            pin_coords (np.ndarray): The coordinates of the pins.
            max_lines (int): The maximum number of lines (chords) to draw.
            line_darkness (int): The value to add to the canvas for each line.

        Yields:
            dict: A dictionary containing the state at each step of the animation, including
                  the current line number, the chord being added, the current canvas,
                  and the residual image.
        """
        num_pins = len(pin_coords)

        inverted_target = 255 - target_image
        string_art_canvas = np.zeros_like(inverted_target, dtype=np.uint16)

        all_chords = self._get_all_chords(num_pins)

        line_canvases = {}
        for i, j in all_chords:
            temp_canvas = np.zeros_like(inverted_target, dtype=np.uint16)
            self._draw_line_on_canvas(temp_canvas, pin_coords[i], pin_coords[j], line_darkness)
            line_canvases[(i, j)] = temp_canvas

        current_pin = 0
        sequence = []

        for line_num in range(max_lines):
            best_chord = None
            min_error = float('inf')

            for next_pin in range(num_pins):
                if next_pin == current_pin:
                    continue

                chord = tuple(sorted((current_pin, next_pin)))

                if chord not in line_canvases:
                    continue

                line_canvas = line_canvases[chord]

                new_canvas = string_art_canvas + line_canvas

                error = np.sum((inverted_target.astype(np.int32) - new_canvas.astype(np.int32))**2)

                if error < min_error:
                    min_error = error
                    best_chord = (current_pin, next_pin)

            if best_chord is None:
                break

            sequence.append(best_chord)
            best_chord_sorted = tuple(sorted(best_chord))
            string_art_canvas += line_canvases[best_chord_sorted]

            current_pin = best_chord[1]

            display_canvas = np.clip(string_art_canvas, 0, 255).astype(np.uint8)

            residual = np.clip(inverted_target.astype(np.int32) - string_art_canvas.astype(np.int32), 0, 255).astype(np.uint8)

            yield {
                "line_num": line_num + 1,
                "chord": best_chord,
                "canvas": 255 - display_canvas, # Invert back for display
                "residual": residual
            }
