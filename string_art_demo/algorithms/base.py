from abc import ABC, abstractmethod

class BaseStringArtAlgorithm(ABC):
    """
    Abstract base class for string art algorithms.
    """

    @abstractmethod
    def run(self, target_image, pin_coords, **kwargs):
        """
        Runs the algorithm and yields the state at each step for animation.

        Args:
            target_image (np.ndarray): The target grayscale image.
            pin_coords (np.ndarray): The coordinates of the pins.
            **kwargs: Algorithm-specific parameters.

        Yields:
            dict: A dictionary containing the state at each step of the animation.
                  The content of the dictionary can vary depending on the algorithm.
        """
        pass
