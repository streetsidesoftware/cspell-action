import { getInput } from '@actions/core';

import { ActionParamsInput, applyDefaults, TrueFalse } from './ActionParams.js';

export function getActionParams(): ActionParamsInput {
    return applyDefaults({
        // github_token: getInput('github_token', { required: true }),
        files: getInput('files'),
        incremental_files_only: tf(getInput('incremental_files_only')),
        config: getInput('config'),
        root: getInput('root'),
        inline: getInput('inline').toLowerCase(),
        strict: tf(getInput('strict')),
        verbose: tf(getInput('verbose')),
        check_dot_files: tf(getInput('check_dot_files')),
        use_cspell_files: tf(getInput('use_cspell_files')),
    });
}

function tf(v: string | boolean | number): TrueFalse | string {
    const mapValues: Record<string, TrueFalse> = {
        true: 'true',
        t: 'true',
        false: 'false',
        f: 'false',
        '0': 'false',
        '1': 'true',
    };
    v = typeof v === 'boolean' || typeof v === 'number' ? (v ? 'true' : 'false') : v;
    v = v.toString();
    v = v.toLowerCase();
    v = mapValues[v] || v;
    return v;
}
