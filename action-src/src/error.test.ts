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

    const unknownErrorObj = {};

    test.each`
        value                        | expected
        ${Error('hello')}            | ${new Error('hello')}
        ${new AppError('app error')} | ${new AppError('app error')}
        ${toError('hello')}          | ${new Error('hello')}
        ${'hello'}                   | ${new Error('hello')}
        ${unknownErrorObj}           | ${err('Unknown error', unknownErrorObj)}
        ${null}                      | ${err('Unknown error', null)}
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

function err(message: string, cause: unknown = undefined) {
    if (cause) return new Error(message, { cause });
    return new Error(message);
}
