import type { Config } from 'jest';
import { createCjsPreset } from 'jest-preset-angular/presets';

const preset = createCjsPreset() as unknown as Partial<Config>;

const config: Config = {
  ...preset,

  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],

  transformIgnorePatterns: ['node_modules/(?!(@angular|rxjs|tslib|@ngrx)/)'],

  moduleFileExtensions: ['ts', 'js', 'mjs', 'html', 'json'],

  moduleNameMapper: {
    '\\.(css|scss|sass|less)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/test-file-stub.js',
  },

  testMatch: ['**/*.spec.ts', '**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  verbose: true,
};

export default config;
