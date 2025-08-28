import * as a from '../algorithms.js';

describe('Greedy Algorithm Tests', () => {
    describe('getLinePixels', () => {
        it('should return an array of pixels for a horizontal line', () => {
            const p1 = { x: 0, y: 0 };
            const p2 = { x: 3, y: 0 };
            const pixels = a.getLinePixels(p1, p2, 10);
            expect(pixels).to.deep.equal([
                { x: 0, y: 0 },
                { x: 1, y: 0 },
                { x: 2, y: 0 },
                { x: 3, y: 0 },
            ]);
        });
    });

    describe('calculateLineScore', () => {
        it('should calculate the average darkness of a line', () => {
            const pins = [{ x: 0, y: 1 }, { x: 3, y: 1 }];
            const CANVAS_SIZE = 4;
            const imageData = new Uint8ClampedArray([
                0, 0, 0, 0,
                100, 100, 50, 50,
                0, 0, 0, 0,
                0, 0, 0, 0,
            ].flatMap(p => [p, p, p, 255]));

            const score = a.calculateLineScore(pins[0], pins[1], imageData, CANVAS_SIZE);
            expect(score).to.equal(75);
        });
    });

    describe('findBestNextPin', () => {
        it('should find the pin that produces the line with the highest score', () => {
            const pins = [
                { x: 0, y: 1 }, // 0: start pin
                { x: 3, y: 1 }, // 1: target for line with score 75
                { x: 1, y: 3 }, // 2: target for line with score 25
                { x: 0, y: 0 }  // 3: another pin
            ];
            const CANVAS_SIZE = 4;
            const imageData = new Uint8ClampedArray([
                0, 0, 0, 100,
                100, 100, 50, 50,
                0, 0, 0, 0,
                0, 25, 0, 0,
            ].flatMap(p => [p, p, p, 255]));

            const startPinIndex = 0;
            const NUM_PINS = 4;

            const bestPinIndex = a.findBestNextPin(startPinIndex, pins, imageData, CANVAS_SIZE, NUM_PINS);
            expect(bestPinIndex).to.equal(1);
        });
    });

    describe('updateResidualInPlace', () => {
        it('should reduce the pixel values along a line', () => {
            const p1 = { x: 0, y: 1 };
            const p2 = { x: 3, y: 1 };
            const CANVAS_SIZE = 4;
            const LINE_DARKNESS = 20;
            const imageData = new Uint8ClampedArray([
                0, 0, 0, 0,
                100, 100, 50, 50,
                0, 0, 0, 0,
                0, 0, 0, 0,
            ].flatMap(p => [p, p, p, 255]));

            a.updateResidualInPlace(p1, p2, imageData, CANVAS_SIZE, LINE_DARKNESS);

            const expectedData = new Uint8ClampedArray([
                0, 0, 0, 0,
                80, 80, 30, 30,
                0, 0, 0, 0,
                0, 0, 0, 0,
            ].flatMap(p => [p, p, p, 255]));

            expect(imageData).to.deep.equal(expectedData);
        });
    });

    describe('calculateGreedyPath', () => {
        it('should generate a path of pin indices', () => {
            const pins = [
                { x: 0, y: 1 }, { x: 3, y: 1 }, { x: 1, y: 3 }, { x: 0, y: 0 }
            ];
            const CANVAS_SIZE = 4;
            const NUM_PINS = 4;
            const MAX_LINES = 3;
            const LINE_DARKNESS = 20;
            const initialResidualData = {
                data: new Uint8ClampedArray([
                    0, 0, 0, 100,
                    100, 100, 50, 50,
                    0, 0, 0, 0,
                    0, 25, 0, 0,
                ].flatMap(p => [p, p, p, 255])),
                width: CANVAS_SIZE,
                height: CANVAS_SIZE,
            };
            const options = { MAX_LINES, CANVAS_SIZE, NUM_PINS, LINE_DARKNESS };

            const generator = a.calculateGreedyPath(initialResidualData, pins, options);

            const result1 = generator.next();
            expect(result1.done).to.be.false;
            expect(result1.value.prevPin).to.equal(0);
            expect(result1.value.nextPin).to.equal(1);

            const result2 = generator.next();
            expect(result2.done).to.be.false;

            const result3 = generator.next();
            expect(result3.done).to.be.false;

            const result4 = generator.next();
            expect(result4.done).to.be.true;
        });
    });
<<<<<<< HEAD
<<<<<<< HEAD
});
=======
});
        it('should return an array of pixels for a horizontal line', () => {
            const p1 = { x: 0, y: 0 };
            const p2 = { x: 3, y: 0 };
            const pixels = getLinePixels(p1, p2, 10);
            expect(pixels).to.deep.equal([
                { x: 0, y: 0 },
                { x: 1, y: 0 },
                { x: 2, y: 0 },
                { x: 3, y: 0 },
            ]);
        });
    });

    describe('calculateLineScore', () => {
        it('should calculate the average darkness of a line', () => {
            const pins = [{ x: 0, y: 1 }, { x: 3, y: 1 }];
            const CANVAS_SIZE = 4;
            const imageData = new Uint8ClampedArray([
                0, 0, 0, 0,
                100, 100, 50, 50,
                0, 0, 0, 0,
                0, 0, 0, 0,
            ].flatMap(p => [p, p, p, 255]));

            const score = calculateLineScore(pins[0], pins[1], imageData, CANVAS_SIZE);
            expect(score).to.equal(75);
        });
    });

    describe('findBestNextPin', () => {
        it('should find the pin that produces the line with the highest score', () => {
            const pins = [
                { x: 0, y: 1 }, // 0: start pin
                { x: 3, y: 1 }, // 1: target for line with score 75
                { x: 1, y: 3 }, // 2: target for line with score 25
                { x: 0, y: 0 }  // 3: another pin
            ];
            const CANVAS_SIZE = 4;
            const imageData = new Uint8ClampedArray([
                0, 0, 0, 100,
                100, 100, 50, 50,
                0, 0, 0, 0,
                0, 25, 0, 0,
            ].flatMap(p => [p, p, p, 255]));

            const startPinIndex = 0;
            const NUM_PINS = 4;

            const bestPinIndex = findBestNextPin(startPinIndex, pins, imageData, CANVAS_SIZE, NUM_PINS);
            expect(bestPinIndex).to.equal(1);
        });
    });

    describe('updateResidualInPlace', () => {
        it('should reduce the pixel values along a line', () => {
            const p1 = { x: 0, y: 1 };
            const p2 = { x: 3, y: 1 };
            const CANVAS_SIZE = 4;
            const LINE_DARKNESS = 20;
            const imageData = new Uint8ClampedArray([
                0, 0, 0, 0,
                100, 100, 50, 50,
                0, 0, 0, 0,
                0, 0, 0, 0,
            ].flatMap(p => [p, p, p, 255]));

            updateResidualInPlace(p1, p2, imageData, CANVAS_SIZE, LINE_DARKNESS);

            const expectedData = new Uint8ClampedArray([
                0, 0, 0, 0,
                80, 80, 30, 30, // 100-20, 100-20, 50-20, 50-20
                0, 0, 0, 0,
                0, 0, 0, 0,
            ].flatMap(p => [p, p, p, 255]));

            expect(imageData).to.deep.equal(expectedData);
        });
    });
});
>>>>>>> origin/feature/string-art-webapp
=======
});
>>>>>>> origin/main
