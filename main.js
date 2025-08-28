document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('image-upload');
    const algorithmSelect = document.getElementById('algorithm-select');
    const startBtn = document.getElementById('start-btn');
    const stringArtCanvas = document.getElementById('string-art-canvas');
    const residualCanvas = document.getElementById('residual-canvas');

    const sCtx = stringArtCanvas.getContext('2d');
    const rCtx = residualCanvas.getContext('2d');

    const CANVAS_SIZE = 500;
    stringArtCanvas.width = CANVAS_SIZE;
    stringArtCanvas.height = CANVAS_SIZE;
    residualCanvas.width = CANVAS_SIZE;
    residualCanvas.height = CANVAS_SIZE;

    let targetImageData = null;
    let pins = [];
    const NUM_PINS = 200;
    const PIN_RADIUS = CANVAS_SIZE / 2 - 10;

    function initPins() {
        pins = [];
        const center = { x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2 };
        for (let i = 0; i < NUM_PINS; i++) {
            const angle = (i / NUM_PINS) * 2 * Math.PI;
            pins.push({
                x: center.x + PIN_RADIUS * Math.cos(angle),
                y: center.y + PIN_RADIUS * Math.sin(angle)
            });
        }
    }

    function drawPins() {
        sCtx.fillStyle = 'black';
        pins.forEach(pin => {
            sCtx.beginPath();
            sCtx.arc(pin.x, pin.y, 2, 0, 2 * Math.PI);
            sCtx.fill();
        });
    }

    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                // Draw image on residual canvas to process it
                rCtx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
                const imageData = rCtx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
                targetImageData = convertToGrayscale(imageData);
                rCtx.putImageData(targetImageData, 0, 0);

                // Also show on main canvas initially
                sCtx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
                drawPins();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    function convertToGrayscale(imageData) {
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg; // red
            data[i + 1] = avg; // green
            data[i + 2] = avg; // blue
        }
        return imageData;
    }

    const algorithms = {
        'greedy': {
            name: 'Greedy Residual',
            run: runGreedyAlgorithm
        },
        'continuous': {
            name: 'Continuous Relaxation + Eulerization',
            run: () => alert('Not implemented yet.')
        },
        'annealing': {
            name: 'Simulated Annealing',
            run: () => alert('Not implemented yet.')
        },
        'radon': {
            name: 'Radon / Hough Transform',
            run: () => alert('Not implemented yet.')
        },
        'rl': {
            name: 'Reinforcement Learning',
            run: () => alert('Not implemented yet.')
        },
        'beam': {
            name: 'Beam Search',
            run: () => alert('Not implemented yet.')
        },
        'tsp': {
            name: 'TSP-Style Polyline',
            run: () => alert('Not implemented yet.')
        },
        'multi': {
            name: 'Multi-Objective Optimization',
            run: () => alert('Not implemented yet.')
        }
    };

    startBtn.addEventListener('click', () => {
        if (!targetImageData) {
            alert('Please upload an image first.');
            return;
        }
        const selectedAlgorithm = algorithmSelect.value;
        const algorithm = algorithms[selectedAlgorithm];
        if (algorithm && typeof algorithm.run === 'function') {
            algorithm.run();
        } else {
            alert('Selected algorithm not found.');
        }
    });

    function runGreedyAlgorithm() {
        console.log('Starting Greedy Residual Algorithm');
        startBtn.disabled = true;

        sCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        initPins();
        drawPins();

        let residualData = rCtx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        let currentPinIndex = 0;
        let lineCount = 0;
        const MAX_LINES = 2000;

        function getLinePixels(p1, p2) {
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
                if (x1 >= 0 && x1 < CANVAS_SIZE && y1 >= 0 && y1 < CANVAS_SIZE) {
                    pixels.push({x: x1, y: y1});
                }

                if ((x1 === x2) && (y1 === y2)) break;
                let e2 = 2 * err;
                if (e2 > -dy) { err -= dy; x1 += sx; }
                if (e2 < dx) { err += dx; y1 += sy; }
            }
            return pixels;
        }

        function calculateLineScore(pinIndex1, pinIndex2, imageData) {
            const p1 = pins[pinIndex1];
            const p2 = pins[pinIndex2];
            const linePixels = getLinePixels(p1, p2);
            if (linePixels.length === 0) return 0;

            let score = 0;
            for (const pixel of linePixels) {
                const dataIndex = (pixel.y * CANVAS_SIZE + pixel.x) * 4;
                score += imageData.data[dataIndex]; // Greyscale, so R, G, and B are the same
            }
            return score / linePixels.length;
        }

        function findBestNextPin(startPinIndex) {
            let bestPinIndex = -1;
            let bestScore = -Infinity;

            for (let i = 0; i < NUM_PINS; i++) {
                if (i === startPinIndex) continue;
                // A simple heuristic to avoid very short chords
                if (Math.abs(i - startPinIndex) % NUM_PINS < 5) continue;

                const score = calculateLineScore(startPinIndex, i, residualData);
                if (score > bestScore) {
                    bestScore = score;
                    bestPinIndex = i;
                }
            }
            return bestPinIndex;
        }

        function drawLine(p1, p2) {
            sCtx.beginPath();
            sCtx.moveTo(p1.x, p1.y);
            sCtx.lineTo(p2.x, p2.y);
            sCtx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
            sCtx.stroke();
        }

        function updateResidual(pinIndex1, pinIndex2, imageData) {
            const p1 = pins[pinIndex1];
            const p2 = pins[pinIndex2];
            const linePixels = getLinePixels(p1, p2);
            const LINE_DARKNESS = 20;

            for (const pixel of linePixels) {
                const dataIndex = (pixel.y * CANVAS_SIZE + pixel.x) * 4;
                imageData.data[dataIndex] = Math.max(0, imageData.data[dataIndex] - LINE_DARKNESS);
                imageData.data[dataIndex + 1] = Math.max(0, imageData.data[dataIndex + 1] - LINE_DARKNESS);
                imageData.data[dataIndex + 2] = Math.max(0, imageData.data[dataIndex + 2] - LINE_DARKNESS);
            }
        }

        function step() {
            if (lineCount >= MAX_LINES) {
                console.log('Finished.');
                startBtn.disabled = false;
                return;
            }

            const nextPinIndex = findBestNextPin(currentPinIndex);
            if (nextPinIndex === -1) {
                console.log('No best pin found.');
                startBtn.disabled = false;
                return;
            }

            // Draw the new line
            drawLine(pins[currentPinIndex], pins[nextPinIndex]);

            // Update the residual image data
            updateResidual(currentPinIndex, nextPinIndex, residualData);

            // Draw the updated residual
            rCtx.putImageData(residualData, 0, 0);

            currentPinIndex = nextPinIndex;
            lineCount++;

            // Request next frame
            requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
    }

    // Initialize pins on load
    initPins();
});
