import { type CSpellApplicationOptions, lint as cspellAppLint } from 'cspell';
import type { CSpellReporter } from 'cspell';
import assert from 'node:assert';

export interface LintOptions {
    root: string;
    config?: string;
    /**
     * Check files and directories starting with `.`.
     * - `true` - glob searches will match against `.dot` files.
     * - `false` - `.dot` files will NOT be checked.
     * - `undefined` - glob patterns can match explicit `.dot` patterns.
     */
    checkDotFiles: boolean | undefined;
    files?: string[] | undefined;
}

/**
 * Spell check files.
 * @param globs - files or glob patterns to check
 * @param root - the root directory to scan
 * @param reporter - reporter to use.
 */
export async function lint(globs: string[], lintOptions: LintOptions, reporter: CSpellReporter): Promise<void> {
    const { root, config, checkDotFiles, files } = lintOptions;
    assert(
        (globs.length && !files) || (files && !globs.length),
        'Either globs or files must be specified, but not both.',
    );
    // console.warn('lint: %o', { globs, lintOptions });
    const options: CSpellApplicationOptions = { root, config, files, filterFiles: !files };
    if (checkDotFiles) {
        options.dot = true;
    } else if (checkDotFiles === false) {
        options.dot = false;
    }
    await cspellAppLint(globs, options, reporter);
}
