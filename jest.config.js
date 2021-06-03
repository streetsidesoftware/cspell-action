module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.{js,ts}'],
  testRunner: 'jest-circus/runner',
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  roots: ['./src', './action'],
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.json'
    }
  },
  verbose: true
}
