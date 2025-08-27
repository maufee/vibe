import numpy as np
import networkx as nx
from scipy.optimize import nnls
from skimage.draw import line as skimage_line
from .base import BaseStringArtAlgorithm

class ContinuousRelaxationAlgorithm(BaseStringArtAlgorithm):
    """
    Implements the Continuous Relaxation + Eulerization algorithm.
    """

    def _get_all_chords(self, num_pins):
        chords = []
        for i in range(num_pins):
            for j in range(i + 1, num_pins):
                chords.append((i, j))
        return chords

    def _draw_line_on_canvas(self, canvas, start_pin_coord, end_pin_coord, line_darkness=1):
        rr, cc = skimage_line(start_pin_coord[0], start_pin_coord[1], end_pin_coord[0], end_pin_coord[1])
        canvas[rr, cc] += line_darkness

    def run(self, target_image, pin_coords, **kwargs):
        """
        Runs the Continuous Relaxation + Eulerization algorithm.
        """
        num_pins = len(pin_coords)
        image_shape = target_image.shape

        # Invert the target image
        inverted_target = 255 - target_image
        b = inverted_target.flatten().astype(float)

        # 1. Build matrix of chord contributions (A)
        all_chords = self._get_all_chords(num_pins)
        num_chords = len(all_chords)
        A = np.zeros((image_shape[0] * image_shape[1], num_chords), dtype=np.uint8)

        for k, (i, j) in enumerate(all_chords):
            line_canvas = np.zeros(image_shape, dtype=np.uint8)
            self._draw_line_on_canvas(line_canvas, pin_coords[i], pin_coords[j])
            A[:, k] = line_canvas.flatten()

        yield {"status": "Solving for chord weights...", "progress": 0.2}

        # 2. Solve NNLS
        # This can be very slow for large images/pin counts
        # For a demo, we might need to downsample or use a faster solver
        try:
            x, rnorm = nnls(A, b)
        except Exception as e:
            yield {"status": f"Error during NNLS: {e}", "progress": 1.0, "error": True}
            return

        yield {
            "status": "Visualizing chord weights...",
            "progress": 0.5,
            "heatmap": x,
            "chords": all_chords
        }

        # 3. Round weights to get number of wraps for each chord
        # Simple rounding for now. More complex strategies could be used.
        num_wraps = np.round(x).astype(int)

        # 4. Construct a multigraph and find an Eulerian path
        G = nx.MultiGraph()
        G.add_nodes_from(range(num_pins))
        for k, (i, j) in enumerate(all_chords):
            if num_wraps[k] > 0:
                for _ in range(num_wraps[k]):
                    G.add_edge(i, j)

        # Make the graph Eulerian
        odd_degree_nodes = [n for n, d in G.degree() if d % 2 != 0]
        for i in range(0, len(odd_degree_nodes), 2):
            if i + 1 < len(odd_degree_nodes):
                G.add_edge(odd_degree_nodes[i], odd_degree_nodes[i+1])

        yield {"status": "Building string path...", "progress": 0.8}

        # 5. Extract Euler trail
        if not nx.is_eulerian(G):
            # If not Eulerian, find an Eulerian path (starts/ends at different nodes)
            # This should be handled by the logic above, but as a fallback:
            if G.number_of_edges() > 0:
                start_node = list(G.nodes())[0] # Pick an arbitrary start
                if odd_degree_nodes:
                    start_node = odd_degree_nodes[0]

                path = list(nx.eulerian_path(G, source=start_node))
            else:
                path = []
        else:
            if G.number_of_edges() > 0:
                path = list(nx.eulerian_circuit(G, source=list(G.nodes())[0]))
            else:
                path = []

        # Yield the final animation steps from the path
        string_art_canvas = np.zeros(image_shape, dtype=np.uint16)
        total_lines = len(path)
        for i, (u, v) in enumerate(path):
            self._draw_line_on_canvas(string_art_canvas, pin_coords[u], pin_coords[v], 25)
            display_canvas = np.clip(string_art_canvas, 0, 255).astype(np.uint8)

            yield {
                "status": f"Drawing line {i+1}/{total_lines}",
                "progress": 0.8 + 0.2 * (i / total_lines if total_lines > 0 else 1),
                "canvas": 255 - display_canvas,
                "line_num": i + 1,
                "chord": (u, v)
            }

        yield {"status": "Done!", "progress": 1.0, "canvas": 255 - np.clip(string_art_canvas, 0, 255).astype(np.uint8)}
