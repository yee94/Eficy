module.exports = {
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(spec))\\.(jsx?|tsx?|ts?)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '\\.(css|scss)$': '<rootDir>/__mocks__/styleMock.js',
  },
  collectCoverage: false,
  coverageReporters: ['html'],
  coverageDirectory: 'test/coverage/',
  collectCoverageFrom: ['src/**/*.{ts,tsx,js,jsx}', '!src/index.tsx'],
  transformIgnorePatterns: ['/!node_modules\\/lodash/'],
};
