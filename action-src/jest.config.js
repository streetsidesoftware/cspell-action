module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.{js,ts}'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  roots: ['./src'],
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.json'
    }
  },
  verbose: true
}
