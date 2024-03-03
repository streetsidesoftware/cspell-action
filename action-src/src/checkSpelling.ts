import { debug, info, error, warning } from '@actions/core';
import type { RunResult } from 'cspell';
import { ActionParams } from './ActionParams.js';
import { CSpellReporterForGithubAction } from './reporter.js';
import { lint, LintOptions } from './spell.js';
import { checkDotMap } from './checkDotMap.js';

const core = { debug, error, info, warning };

export async function checkSpelling(
    params: ActionParams,
    globs: string[],
    files: string[] | undefined,
): Promise<RunResult> {
    const options: LintOptions = {
        root: params.root || process.cwd(),
        config: params.config || undefined,
        checkDotFiles: checkDotMap[params.check_dot_files],
        files,
    };

    const reporterOptions = {
        verbose: params.verbose === 'true',
    };

    const collector = new CSpellReporterForGithubAction(params.inline, reporterOptions, core);
    await lint(globs, options, collector.reporter);

    return collector.result;
}
