import { describe, expect, test } from 'vitest';
import { AppError, isError } from './error';

describe('error', () => {
    test.each`
        value             | expected
        ${Error('hello')} | ${true}
        ${new AppError()} | ${true}
        ${'hello'}        | ${false}
        ${{}}             | ${false}
        ${null}           | ${false}
    `('isError', ({ value, expected }) => {
        expect(isError(value)).toBe(expected);
    });
});
