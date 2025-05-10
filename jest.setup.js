
// Import jest-dom to add custom matchers
import '@testing-library/jest-dom';

// Mock matchMedia for components that might use media queries
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock for requestAnimationFrame
global.requestAnimationFrame = (callback) => {
  setTimeout(callback, 0);
  return 0;
};

// Mock for canvas context (used by Chart.js)
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  // Minimal mock of CanvasRenderingContext2D
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({
    data: new Array(4),
  })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => []),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
}));

// Make Jest globals available
global.jest = jest;
global.expect = expect;
global.describe = describe;
global.it = it;
global.beforeEach = beforeEach;
global.afterEach = afterEach;

// Suppress console errors from Chart.js
console.error = jest.fn();
