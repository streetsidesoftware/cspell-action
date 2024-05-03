import { describe, expect, test } from 'vitest';

import { AppError, isAppError, isError, toError } from './error.js';

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

    test.each`
        value                        | expected
        ${Error('hello')}            | ${Error('hello')}
        ${new AppError('app error')} | ${Error('app error')}
        ${toError('hello')}          | ${Error('hello')}
        ${'hello'}                   | ${Error('hello')}
        ${{}}                        | ${Error('Unknown error')}
        ${null}                      | ${Error('Unknown error')}
    `('toError $value', ({ value, expected }) => {
        expect(toError(value)).toEqual(expected);
    });

    test('AppError', () => {
        const err = new AppError('app error');
        expect(err).toBeInstanceOf(Error);
        expect(err).toBeInstanceOf(AppError);
        expect(err.message).toBe('app error');
    });

    test('isAppError', () => {
        const err = new AppError('app error');
        expect(isAppError(err)).toBe(true);
        expect(isAppError(Error('app error'))).toBe(false);
        expect(isAppError('app error')).toBe(false);
    });
});
