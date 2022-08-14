import * as core from '@actions/core';
import { ActionParamsInput, applyDefaults, TrueFalse } from './ActionParams';

export function getActionParams(): ActionParamsInput {
    return applyDefaults({
        github_token: core.getInput('github_token', { required: true }),
        files: core.getInput('files'),
        incremental_files_only: tf(core.getInput('incremental_files_only')),
        config: core.getInput('config'),
        root: core.getInput('root'),
        inline: core.getInput('inline').toLowerCase(),
        strict: tf(core.getInput('strict')),
        verbose: tf(core.getInput('verbose')),
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
