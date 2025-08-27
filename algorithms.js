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
        if (Math.abs(i - startPinIndex) % NUM_PINS < 5) continue;

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
