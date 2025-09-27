import type { Config } from 'jest';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: 'apps/backend/.env.test' });

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  testMatch: ['<rootDir>/src/**/*.spec.ts', '<rootDir>/src/**/*.test.ts'],
  clearMocks: true,
  globalSetup: '<rootDir>/test/globalSetup.ts',
};

export default config;
