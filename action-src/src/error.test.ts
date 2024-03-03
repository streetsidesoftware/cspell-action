import { describe, expect, test } from 'vitest';
import { AppError, isError, toError } from './error.js';

describe('error', () => {
    test.each`
        value                        | expected
        ${Error('hello')}            | ${true}
        ${new AppError('app error')} | ${true}
        ${toError('hello')}          | ${true}
        ${'hello'}                   | ${false}
        ${{}}                        | ${false}
        ${null}                      | ${false}
    `('isError $value', ({ value, expected }) => {
        expect(isError(value)).toBe(expected);
    });
});
