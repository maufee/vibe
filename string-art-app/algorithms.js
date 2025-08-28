export function getLinePixels(p1, p2, size) {
    let pixels = [];
    let x1 = Math.round(p1.x);
    let y1 = Math.round(p1.y);
    let x2 = Math.round(p2.x);
    let y2 = Math.round(p2.y);

    let dx = Math.abs(x2 - x1);
    let dy = Math.abs(y2 - y1);
    let sx = (x1 < x2) ? 1 : -1;
    let sy = (y1 < y2) ? 1 : -1;
    let err = dx - dy;

    while(true) {
        if (x1 >= 0 && x1 < size && y1 >= 0 && y1 < size) {
            pixels.push({x: x1, y: y1});
        }

        if ((x1 === x2) && (y1 === y2)) break;
        let e2 = 2 * err;
        if (e2 > -dy) { err -= dy; x1 += sx; }
        if (e2 < dx) { err += dx; y1 += sy; }
    }
    return pixels;
}

export function calculateLineScore(p1, p2, imageData, CANVAS_SIZE) {
    const linePixels = getLinePixels(p1, p2, CANVAS_SIZE);
    if (linePixels.length === 0) return 0;

    let score = 0;
    for (const pixel of linePixels) {
        const dataIndex = (pixel.y * CANVAS_SIZE + pixel.x) * 4;
        score += imageData[dataIndex];
    }
    return score / linePixels.length;
}

export function findBestNextPin(startPinIndex, pins, imageData, CANVAS_SIZE, NUM_PINS) {
    let bestPinIndex = -1;
    let bestScore = -Infinity;

    for (let i = 0; i < NUM_PINS; i++) {
    if (i === startPinIndex) continue;
    const dist = Math.abs(i - startPinIndex);
    if (Math.min(dist, NUM_PINS - dist) < 5) continue;

        const score = calculateLineScore(pins[startPinIndex], pins[i], imageData, CANVAS_SIZE);
        if (score > bestScore) {
            bestScore = score;
            bestPinIndex = i;
        }
    }
    return bestPinIndex;
}

export function updateResidualInPlace(p1, p2, imageData, CANVAS_SIZE, LINE_DARKNESS) {
    const linePixels = getLinePixels(p1, p2, CANVAS_SIZE);

    for (const pixel of linePixels) {
        const dataIndex = (pixel.y * CANVAS_SIZE + pixel.x) * 4;
        imageData[dataIndex] = Math.max(0, imageData[dataIndex] - LINE_DARKNESS);
        imageData[dataIndex + 1] = Math.max(0, imageData[dataIndex + 1] - LINE_DARKNESS);
        imageData[dataIndex + 2] = Math.max(0, imageData[dataIndex + 2] - LINE_DARKNESS);
    }
}

export function calculateImageError(imageA, imageB) {
    let error = 0;
    for (let i = 0; i < imageA.length; i += 4) {
        const diff = imageA[i] - imageB[i];
        error += diff * diff;
    }
    return error / (imageA.length / 4);
}

export function renderPathToImageData(path, pins, CANVAS_SIZE, LINE_DARKNESS) {
    const imageData = new Uint8ClampedArray(CANVAS_SIZE * CANVAS_SIZE * 4).fill(255);

    for (let i = 0; i < path.length - 1; i++) {
        const p1 = pins[path[i]];
        const p2 = pins[path[i+1]];
        const linePixels = getLinePixels(p1, p2, CANVAS_SIZE);

        for (const pixel of linePixels) {
            const dataIndex = (pixel.y * CANVAS_SIZE + pixel.x) * 4;
            imageData[dataIndex] = Math.max(0, imageData[dataIndex] - LINE_DARKNESS);
            imageData[dataIndex + 1] = Math.max(0, imageData[dataIndex + 1] - LINE_DARKNESS);
            imageData[dataIndex + 2] = Math.max(0, imageData[dataIndex + 2] - LINE_DARKNESS);
        }
    }
    return imageData;
}

export function* calculateSAPath(options) {
    const { PINS, CANVAS_SIZE, LINE_DARKNESS, MAX_ITERATIONS, targetImageData } = options;
    const NUM_PINS = PINS.length;

    // 1. Start with a random path
    let currentPath = Array.from({ length: 50 }, () => Math.floor(Math.random() * NUM_PINS));
    let currentImageData = renderPathToImageData(currentPath, PINS, CANVAS_SIZE, LINE_DARKNESS);
    let currentError = calculateImageError(currentImageData, targetImageData);

    let T = 1.0;
    const T_min = 0.00001;
    const alpha = 0.9;

    for (let i = 0; i < MAX_ITERATIONS; i++) {
        // 2. Create a new candidate path
        let newPath = [...currentPath];
        const indexToChange = Math.floor(Math.random() * newPath.length);
        newPath[indexToChange] = Math.floor(Math.random() * NUM_PINS);

        // 3. Calculate energy of new path
        const newImageData = renderPathToImageData(newPath, PINS, CANVAS_SIZE, LINE_DARKNESS);
        const newError = calculateImageError(newImageData, targetImageData);

        // 4. Decide whether to accept the new path
        const deltaE = newError - currentError;
        if (deltaE < 0 || Math.random() < Math.exp(-deltaE / T)) {
            currentPath = newPath;
            currentError = newError;
        }

        // 5. Yield current state
        yield { path: currentPath, error: currentError, temp: T, iteration: i };

        // 6. Cool down
        T *= alpha;
        if (T < T_min) break;
    }
}

export function* calculateGreedyPath(initialResidualData, pins, options) {
    const { MAX_LINES, CANVAS_SIZE, NUM_PINS, LINE_DARKNESS } = options;
    let residualData = new Uint8ClampedArray(initialResidualData.data);
    let currentPinIndex = 0;

    for (let i = 0; i < MAX_LINES; i++) {
        const nextPinIndex = findBestNextPin(currentPinIndex, pins, residualData, CANVAS_SIZE, NUM_PINS);
        if (nextPinIndex === -1) {
            return; // End of generator
        }

        updateResidualInPlace(pins[currentPinIndex], pins[nextPinIndex], residualData, CANVAS_SIZE, LINE_DARKNESS);

        yield { prevPin: currentPinIndex, nextPin: nextPinIndex, residualData };

        currentPinIndex = nextPinIndex;
    }
}
