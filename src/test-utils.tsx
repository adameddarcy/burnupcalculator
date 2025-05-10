
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Re-export everything from testing-library
export * from '@testing-library/react';

// Re-export Jest globals to make them available in test files
export { default as jest } from 'jest';
export const describe = global.describe;
export const it = global.it;
export const expect = global.expect;
export const beforeEach = global.beforeEach;
export const afterEach = global.afterEach;

// Custom render function to handle any providers if needed
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, {...options});

export { customRender as render };
