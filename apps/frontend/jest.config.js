/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-preset-angular',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.js'],

  moduleFileExtensions: ['ts', 'html', 'js', 'json'],
  testMatch: ['**/*.spec.ts', '**/*.test.ts'],
  moduleNameMapper: {
    '\\.(css|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg|webp|mp4|mp3|woff2?)$':
      '<rootDir>/test-file-stub.js',
  },
  transformIgnorePatterns: ['node_modules/(?!@angular|rxjs|@ngrx|tslib)'],
};
