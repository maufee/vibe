import numpy as np
import random
import math
from skimage.draw import line as skimage_line
from .base import BaseStringArtAlgorithm

class SimulatedAnnealingAlgorithm(BaseStringArtAlgorithm):
    """
    Implements the Simulated Annealing string art algorithm.
    """

    def _draw_line_on_canvas(self, canvas, start_pin_coord, end_pin_coord, line_darkness=25):
        rr, cc = skimage_line(start_pin_coord[0], start_pin_coord[1], end_pin_coord[0], end_pin_coord[1])
        canvas[rr, cc] = np.minimum(canvas[rr, cc] + line_darkness, 255)

    def _calculate_error(self, canvas, target):
        return np.sum((target.astype(np.int32) - canvas.astype(np.int32))**2)

    def _get_canvas_from_sequence(self, sequence, pin_coords, image_shape, line_darkness):
        canvas = np.zeros(image_shape, dtype=np.uint16)
        for u, v in sequence:
            self._draw_line_on_canvas(canvas, pin_coords[u], pin_coords[v], line_darkness)
        return canvas

    def run(self, target_image, pin_coords, max_lines=500, start_temp=1000, end_temp=1e-3, cooling_rate=0.99, **kwargs):
        """
        Runs the Simulated Annealing algorithm.

        Args:
            target_image (np.ndarray): The target grayscale image.
            pin_coords (np.ndarray): The coordinates of the pins.
            max_lines (int): The number of lines in the sequence.
            start_temp (float): The initial temperature for annealing.
            end_temp (float): The final temperature.
            cooling_rate (float): The rate at which temperature cools.

        Yields:
            dict: Animation state at each step.
        """
        num_pins = len(pin_coords)
        inverted_target = 255 - target_image
        line_darkness = kwargs.get('line_darkness', 25)

        # 1. Start with a random solution
        current_sequence = []
        last_pin = random.randint(0, num_pins - 1)
        for _ in range(max_lines):
            next_pin = random.randint(0, num_pins - 1)
            while next_pin == last_pin:
                next_pin = random.randint(0, num_pins - 1)
            current_sequence.append((last_pin, next_pin))
            last_pin = next_pin

        current_canvas = self._get_canvas_from_sequence(current_sequence, pin_coords, target_image.shape, line_darkness)
        current_error = self._calculate_error(current_canvas, inverted_target)

        temp = start_temp
        iteration = 0

        while temp > end_temp:
            iteration += 1

            # 2. Propose a local change (reroute a subpath)
            # Pick a random point in the sequence to modify
            if not current_sequence:
                break

            idx_to_modify = random.randint(0, len(current_sequence) - 1)

            # Create a new random connection
            start_pin = current_sequence[idx_to_modify][0]
            new_end_pin = random.randint(0, num_pins - 1)
            while new_end_pin == start_pin:
                new_end_pin = random.randint(0, num_pins - 1)

            new_sequence = list(current_sequence)
            new_sequence[idx_to_modify] = (start_pin, new_end_pin)

            # If we changed a link in the middle, we need to reconnect the chain
            if idx_to_modify < len(current_sequence) - 1:
                next_start_pin = new_end_pin
                next_end_pin = current_sequence[idx_to_modify+1][1]
                new_sequence[idx_to_modify+1] = (next_start_pin, next_end_pin)

            new_canvas = self._get_canvas_from_sequence(new_sequence, pin_coords, target_image.shape, line_darkness)
            new_error = self._calculate_error(new_canvas, inverted_target)

            # 3. Decide whether to accept the change
            delta_error = new_error - current_error
            accepted = False
            if delta_error < 0:
                accepted = True
            else:
                # Accept worse solutions with some probability
                acceptance_prob = math.exp(-delta_error / temp)
                if random.random() < acceptance_prob:
                    accepted = True

            if accepted:
                current_sequence = new_sequence
                current_error = new_error
                current_canvas = new_canvas

            # 4. Cool the temperature
            temp *= cooling_rate

            if iteration % 10 == 0:
                display_canvas = np.clip(current_canvas, 0, 255).astype(np.uint8)
                yield {
                    "status": f"Temp: {temp:.2f}, Error: {current_error:.0f}",
                    "progress": 1 - (temp / start_temp),
                    "canvas": 255 - display_canvas,
                    "accepted": accepted,
                    "line_num": iteration
                }

        final_canvas = np.clip(self._get_canvas_from_sequence(current_sequence, pin_coords, target_image.shape, line_darkness), 0, 255).astype(np.uint8)
        yield {"status": "Done!", "progress": 1.0, "canvas": 255 - final_canvas}
