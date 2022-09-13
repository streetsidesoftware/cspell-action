module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.{js,ts}'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {tsconfig: './tsconfig.json'}]
  },
  roots: ['./src'],
  verbose: true
}
