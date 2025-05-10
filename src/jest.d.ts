
// This file ensures TypeScript recognizes Jest globals
import '@types/jest';

declare global {
  const describe: jest.Describe;
  const it: jest.It;
  const expect: jest.Expect;
  const beforeEach: jest.Lifecycle;
  const afterEach: jest.Lifecycle;
  const jest: typeof import('jest');
}

export {};
