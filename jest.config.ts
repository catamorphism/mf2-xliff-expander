import { defaults } from 'jest-config';

export default {
  collectCoverage: false,
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/fixtures/',
    '/__fixtures__/',
    '/parser/parser.js'
  ],
  extensionsToTreatAsEsm: ['.ts'],
  moduleFileExtensions: ['mjs', 'ts', 'js', ...defaults.moduleFileExtensions],
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/$1',
  },
  resolver: 'jest-ts-webcompat-resolver',
  testPathIgnorePatterns: ['/node_modules/'],
  transform: { '\\.(js|mjs|ts|tsx)$': 'babel-jest' }
};
