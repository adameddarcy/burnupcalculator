
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
// Import jest-dom without trying to export it directly (it's not a module with exports)
import '@testing-library/jest-dom';

// Re-export everything from testing-library
export * from '@testing-library/react';
// Don't try to re-export jest-dom as it's not a module with exports

// Re-export Jest globals to make them available in test files
export { default as jest } from 'jest';
export const describe = global.describe;
export const it = global.it;
// Use the correct approach to access expect
export const expect = global.expect || jest.fn();
export const beforeEach = global.beforeEach;
export const afterEach = global.afterEach;

// Custom render function to handle any providers if needed
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, {...options});

export { customRender as render };
