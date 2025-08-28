import * as a from '../algorithms.js';

describe('Simulated Annealing Algorithm Tests', () => {
    describe('calculateSAPath', () => {
        it('should generate a path that attempts to minimize error', () => {
            const PINS = [
                {x:0, y:0}, {x:10, y:0}, {x:10, y:10}, {x:0, y:10}
            ];
            const CANVAS_SIZE = 11;
            const LINE_DARKNESS = 50;
            const MAX_ITERATIONS = 100;

            // A target image with a dark diagonal line
            const targetImageData = new Uint8ClampedArray(CANVAS_SIZE * CANVAS_SIZE * 4).fill(255);
            for(let i=0; i<CANVAS_SIZE; i++) {
                const idx = (i * CANVAS_SIZE + i) * 4;
                targetImageData[idx] = 0;
                targetImageData[idx+1] = 0;
                targetImageData[idx+2] = 0;
            }

            const options = { PINS, CANVAS_SIZE, LINE_DARKNESS, MAX_ITERATIONS, targetImageData, T_start: 1.0, T_min: 0.00001, alpha: 0.9 };
            const saGenerator = a.calculateSAPath(options);

            let result = saGenerator.next();
            const initialError = result.value.error;
            let lastError = initialError;
            while(!result.done) {
                expect(result.value.path).to.be.an('array');
                expect(result.value.error).to.be.a('number');
                expect(result.value.error).to.be.at.most(lastError + 1000); // Allow for some uphill moves
                lastError = result.value.error;
                result = saGenerator.next();
            }
            expect(lastError).to.be.lessThan(initialError);
        });
    });

    describe('renderPathToImageData', () => {
        it('should render a path to an image data array', () => {
            const path = [0, 1];
            const pins = [{ x: 0, y: 1 }, { x: 3, y: 1 }];
            const CANVAS_SIZE = 4;
            const LINE_DARKNESS = 20;

            const imageData = a.renderPathToImageData(path, pins, CANVAS_SIZE, LINE_DARKNESS);

            const expectedData = new Uint8ClampedArray(4 * 4 * 4).fill(255);
            // Manually calculate the expected pixel values for the line (0,1) to (3,1)
            const linePixels = [{x:0, y:1}, {x:1, y:1}, {x:2, y:1}, {x:3, y:1}];
            for (const p of linePixels) {
                const idx = (p.y * CANVAS_SIZE + p.x) * 4;
                expectedData[idx] = 255 - LINE_DARKNESS;
                expectedData[idx+1] = 255 - LINE_DARKNESS;
                expectedData[idx+2] = 255 - LINE_DARKNESS;
            }

            expect(imageData).to.deep.equal(expectedData);
        });
    });

    describe('calculateImageError', () => {
        it('should calculate the mean squared error between two images', () => {
            const imageA = new Uint8ClampedArray([10, 20, 30, 40]);
            const imageB = new Uint8ClampedArray([12, 22, 28, 45]);

            // MSE = ((10-12)^2 + (20-22)^2 + (30-28)^2 + (40-45)^2) / 4
            // MSE = (4 + 4 + 4 + 25) / 4 = 37 / 4 = 9.25
            const error = a.calculateImageError(imageA, imageB);
            expect(error).to.be.closeTo(9.25, 0.01);
        });
    });
});
