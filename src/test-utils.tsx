
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
// Import jest-dom for matchers
import '@testing-library/jest-dom';

// Import expect from Jest
import { expect } from '@jest/globals';

// Re-export everything from testing-library
export * from '@testing-library/react';

// Export Jest globals
export { expect };
export const describe = global.describe;
export const it = global.it;
export const beforeEach = global.beforeEach;
export const afterEach = global.afterEach;
export const jest = global.jest;

// Custom render function to handle any providers if needed
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, {...options});

export { customRender as render };
