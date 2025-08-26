# 🎨 String Art Algorithm Guide

## 1. Problem Description

String art is a visual art form created by winding a continuous thread around a set of fixed pins (often arranged in a circle). Each straight thread segment (a *chord*) contributes to the darkness of the pixels it crosses. The goal is to approximate a target image by choosing a sequence of chords that, when layered, resemble the original picture.

**Inputs:**

* Target grayscale image (darker = more thread coverage desired).
* Pin layout (typically evenly spaced points on a circle).
* Maximum number of chords or total thread length.

**Output:**

* A **plan**: ordered list of pin indices to follow with a single thread.
* The corresponding **rendered string art image**.

**Challenges:**

* Finding a sequence that balances global similarity and local smoothness.
* Ensuring physical feasibility (e.g., no overcrowding pins, avoiding sagging).

---

## 2. Algorithms

### 2.1 Greedy Residual (Baseline)

**Idea:** Iteratively select the chord that best reduces the residual error.

**Steps:**

1. Initialize residual = target image.
2. For each candidate chord, estimate how much it reduces residual.
3. Pick the best chord, add it to plan, update approximation.
4. Repeat until stopping condition.

**Pros:** Simple, fast, works well.
**Cons:** Can get stuck in local optima.

---

### 2.2 Continuous Relaxation + Eulerization

**Idea:** Solve globally for fractional weights of chords, then convert into a single continuous path.

**Steps:**

1. Build matrix of chord contributions.
2. Solve NNLS / LASSO: minimize error subject to non-negative weights.
3. Round weights to integers (number of wraps per chord).
4. Construct a multigraph of pins and chords, ensure Eulerian path.
5. Extract Euler trail → single continuous thread.

**Pros:** Global optimization, guaranteed single path.
**Cons:** Computationally heavy, needs pruning.

---

### 2.3 Simulated Annealing (SA) / MCMC

**Idea:** Optimize a chord sequence by local random changes, accepting worse moves with some probability.

**Steps:**

1. Start from a random or greedy solution.
2. Propose local changes (swap chords, reroute subpath).
3. Accept change if it improves error, or with probability exp(-Δ/T) otherwise.
4. Slowly lower temperature T.

**Pros:** Escapes local minima.
**Cons:** Slower convergence.

---

### 2.4 Radon / Hough Transform

**Idea:** Use line integrals (Radon transform) to find chord directions aligned with strong image features.

**Steps:**

1. Compute Radon transform of image.
2. Identify strong peaks (dark line integrals).
3. Map peaks to chords between pins.
4. Use greedy refinement on selected candidates.

**Pros:** Captures global edges efficiently.
**Cons:** Works best with circular pin layout.

---

### 2.5 Reinforcement Learning

**Idea:** Train an agent to select the next pin to maximize image coverage.

**Steps:**

1. Define state = residual + last pin.
2. Actions = choice of next pin.
3. Reward = error reduction − penalties.
4. Train with PPO/DQN; deploy learned policy.

**Pros:** Learns heuristics, adaptable.
**Cons:** Requires training, data.

---

### 2.6 Beam Search

**Idea:** Explore multiple promising chord sequences in parallel.

**Steps:**

1. Keep B best partial plans.
2. Expand each by top-K next chords.
3. Prune to best B by score.
4. Repeat until complete.

**Pros:** Balanced between greedy and global.
**Cons:** Requires careful pruning.

---

### 2.7 TSP-Style Polyline → Pin Snapping

**Idea:** Approximate dark regions with a long continuous polyline, then snap to pins.

**Steps:**

1. Generate stippling of target (dense dots in dark regions).
2. Solve TSP over dots → long path.
3. Snap path to nearest pins.
4. Simplify into chord sequence.

**Pros:** Continuous, aesthetic results.
**Cons:** Less direct tonal control.

---

### 2.8 Multi-Objective Optimization

**Idea:** Incorporate mechanical and aesthetic constraints.

**Constraints:**

* Limit number of wraps per pin.
* Avoid very short or repetitive chords.
* Ensure even distribution of tension.
* Penalize overcrowding.

**Outcome:** Practical, balanced, visually appealing string art.

---

## 3. Animation Plan

Animations help explain each algorithm step-by-step.

### Greedy Residual

* Show target image + pins.
* Highlight chord with highest score.
* Draw chord, update residual.
* Repeat until image forms.

### Continuous Relaxation + Eulerization

* Show target image.
* Overlay chord weight heatmap.
* Round weights → multiple passes.
* Build graph, show Euler trail being traced.

### Simulated Annealing

* Start with random chords.
* Highlight proposed change.
* Show acceptance/rejection (red/green).
* Error curve decreases over time.

### Radon / Hough

* Sweep lines across image.
* Build Radon space.
* Show peaks corresponding to strong chords.
* Add chords to plan.

### Reinforcement Learning

* Show agent at last pin.
* Visualize Q-values for possible next pins.
* Animate choice, reward feedback.

### Beam Search

* Show branching tree of partial solutions.
* Highlight top B beams.
* Animate convergence to final solution.

### TSP Polyline

* Show stippled dots.
* Animate TSP tour connecting dots.
* Snap path to pins.
* Simplify to chords.

### Multi-Objective Constraints

* Show greedy solution.
* Highlight violations (red marks).
* Apply penalties.
* Show smoother, feasible result.

---

## 4. Next Steps

* Implement **Greedy Residual** fully (done in demo).
* Extend framework to support switching between algorithms interactively.
* Add visualization overlays (residual heatmap, Radon peaks, beam trees).

---

**End of Document**
 