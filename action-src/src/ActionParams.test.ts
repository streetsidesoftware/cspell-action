import { ActionParamsInput, applyDefaults, validateActionParams, __testing__ } from './ActionParams';

describe('ActionParams', () => {
    test.each`
        params                 | expected
        ${{}}                  | ${__testing__.defaultActionParams}
        ${{ strict: 'false' }} | ${{ ...__testing__.defaultActionParams, strict: 'false' }}
    `('applyDefaults $params', ({ params, expected }) => {
        expect(applyDefaults(params)).toEqual(expected);
    });

    test.each`
        params                                | expected
        ${{ github_token: '' }}               | ${'Missing GITHUB Token'}
        ${{ incremental_files_only: 'sure' }} | ${'Invalid incremental_files_only setting, must be one of (true, false)'}
        ${{ config: 'config_not_found' }}     | ${'Configuration file "config_not_found" not found.'}
        ${{ root: 'root_not_found' }}         | ${'Root path does not exist: "root_not_found"'}
        ${{ inline: 'swizzle' }}              | ${'Invalid inline level (swizzle), must be one of (error, warning, none)'}
        ${{ strict: 'sure' }}                 | ${'Invalid strict setting, must be one of (true, false)'}
    `('validateActionParams Errors $params', ({ params, expected }) => {
        const logger = jest.fn();
        expect(() => validateActionParams(ap(params), logger)).toThrow();
        expect(logger).toHaveBeenCalledWith(expected);
    });

    test.each`
        params
        ${{ github_token: 'token' }}
    `('validateActionParams $params', ({ params }) => {
        const logger = jest.fn();
        expect(() => validateActionParams(ap(params), logger)).not.toThrow();
        expect(logger).not.toHaveBeenCalled();
    });
});

function ap(p: Partial<ActionParamsInput>): ActionParamsInput {
    return { ...__testing__.defaultActionParams, github_token: 'token', ...p };
}
