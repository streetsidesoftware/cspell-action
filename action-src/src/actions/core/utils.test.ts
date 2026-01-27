import { describe, expect, test } from 'vitest';

import type { AnnotationProperties, CommandProperties } from './coreTypes.js';
import { toCommandProperties, toCommandValue } from './utils.js';

describe('utils', () => {
    const empty: CommandProperties = {
        col: undefined,
        endColumn: undefined,
        endLine: undefined,
        file: undefined,
        line: undefined,
        title: undefined,
    };

    test.each`
        properties                                              | expected
        ${ap({ title: 'title', startColumn: 0, startLine: 2 })} | ${{ ...empty, title: 'title', col: 0, line: 2 }}
        ${ap({ title: 'title' })}                               | ${{ ...empty, title: 'title' }}
        ${{ name: 'MY_VAR' }}                                   | ${{ ...empty }}
        ${{}}                                                   | ${{}}
    `('toCommandProperties $properties', ({ properties, expected }) => {
        const r = toCommandProperties(properties);
        expect(r).toEqual(expected);
    });

    test.each`
        value        | expected
        ${undefined} | ${''}
        ${null}      | ${''}
        ${0}         | ${'0'}
        ${42}        | ${'42'}
        ${[42]}      | ${'[42]'}
        ${{ a: 42 }} | ${'{"a":42}'}
        ${'warning'} | ${'warning'}
        ${'name'}    | ${'name'}
    `('toCommandValue $value', ({ value, expected }) => {
        toCommandValue(value);
        expect(toCommandValue(value)).toEqual(expected);
    });
});

function ap(p: Partial<AnnotationProperties>): Partial<AnnotationProperties> {
    return p;
}
