import { calculateGreedyPath } from './algorithms.js';

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
    const LINE_DARKNESS = 20;

    function initPins(num, radius) {
        pins = [];
        const center = { x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2 };
        for (let i = 0; i < num; i++) {
            const angle = (i / num) * 2 * Math.PI;
            pins.push({
                x: center.x + radius * Math.cos(angle),
                y: center.y + radius * Math.sin(angle)
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

    function drawLine(p1, p2) {
        sCtx.beginPath();
        sCtx.moveTo(p1.x, p1.y);
        sCtx.lineTo(p2.x, p2.y);
        sCtx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        sCtx.stroke();
    }

    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                rCtx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
                const imageData = rCtx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
                targetImageData = convertToGrayscale(imageData);
                rCtx.putImageData(targetImageData, 0, 0);
                sCtx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
                initPins(NUM_PINS, PIN_RADIUS);
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
            data[i] = avg;
            data[i + 1] = avg;
            data[i + 2] = avg;
        }
        return imageData;
    }

    function runGreedyAlgorithm() {
        console.log('Starting Greedy Residual Algorithm');
        startBtn.disabled = true;

        sCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        drawPins();

        const initialResidualData = rCtx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        const options = { MAX_LINES: 2000, CANVAS_SIZE, NUM_PINS, LINE_DARKNESS };

        const greedyGenerator = calculateGreedyPath(initialResidualData, pins, options);

        function step() {
            const result = greedyGenerator.next();
            if (result.done) {
                console.log('Finished.');
                startBtn.disabled = false;
                return;
            }

            const { prevPin, nextPin, residualData } = result.value;
            const p1 = pins[prevPin];
            const p2 = pins[nextPin];
            drawLine(p1, p2);

            const residualImageData = new ImageData(new Uint8ClampedArray(residualData), CANVAS_SIZE, CANVAS_SIZE);
            rCtx.putImageData(residualImageData, 0, 0);

            requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    const algorithms = {
        'greedy': {
            name: 'Greedy Residual',
            run: runGreedyAlgorithm
        },
        // Other algorithms are disabled for now
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
            alert('Selected algorithm not found or not implemented.');
        }
    });

    });
