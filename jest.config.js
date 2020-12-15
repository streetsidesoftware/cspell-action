module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts', '**/*.test.js'],
  testRunner: 'jest-circus/runner',
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  roots: ['./action-source/lib'],
  globals: {
    'ts-jest': {
      tsconfig: './action-source/tsconfig.json'
    }
  },
  verbose: true
}
