import { describe, expect, test, vi } from 'vitest';

import { __testing__, ActionParamsInput, applyDefaults, validateActionParams } from './ActionParams.js';

describe('ActionParams', () => {
    test.each`
        params                 | expected
        ${{}}                  | ${__testing__.defaultActionParams}
        ${{ report: '' }}      | ${__testing__.defaultActionParams}
        ${{ strict: 'false' }} | ${{ ...__testing__.defaultActionParams, strict: 'false' }}
    `('applyDefaults $params', ({ params, expected }) => {
        expect(applyDefaults(params)).toEqual(expected);
    });

    test.each`
        params                                | expected
        ${{ incremental_files_only: 'sure' }} | ${'Invalid incremental_files_only setting, must be one of (true, false)'}
        ${{ config: 'config_not_found' }}     | ${'Configuration file "config_not_found" not found.'}
        ${{ root: 'root_not_found' }}         | ${'Root path does not exist: "root_not_found"'}
        ${{ inline: 'swizzle' }}              | ${'Invalid inline setting, must be one of (error, warning, none)'}
        ${{ strict: 'sure' }}                 | ${'Invalid strict setting, must be one of (true, false)'}
        ${{ use_cspell_files: 'sure' }}       | ${'Invalid use_cspell_files setting, must be one of (true, false)'}
        ${{ check_dot_files: 'sure' }}        | ${'Invalid check_dot_files setting, must be one of (true, false, explicit)'}
    `('validateActionParams Errors $params', ({ params, expected }) => {
        const logger = vi.fn();
        expect(() => validateActionParams(ap(params), logger)).toThrow();
        expect(logger).toHaveBeenCalledWith(expected);
    });
});

function ap(p: Partial<ActionParamsInput>): ActionParamsInput {
    return { ...__testing__.defaultActionParams, ...p };
}
