
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Custom render function to handle any providers if needed
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, {...options});

// re-export everything
export * from '@testing-library/react';
export { customRender as render };
