import { getInput } from '@actions/core';

import { ActionParamsInput, applyDefaults } from './ActionParams.js';
import { tf } from './utils.js';

export function getActionParams(): ActionParamsInput {
    const params: ActionParamsInput = {
        files: getInput('files'),
        incremental_files_only: tf(getInput('incremental_files_only')),
        config: getInput('config'),
        root: getInput('root'),
        inline: getInput('inline').toLowerCase(),
        treat_flagged_words_as_errors: tf(getInput('treat_flagged_words_as_errors')),
        strict: tf(getInput('strict')),
        verbose: tf(getInput('verbose')),
        check_dot_files: tf(getInput('check_dot_files')),
        use_cspell_files: tf(getInput('use_cspell_files')),
        suggestions: tf(getInput('suggestions')),
        report: getInput('report').toLowerCase(),
        summary: tf(getInput('summary') || 'false'),
    };
    return applyDefaults(params);
}
