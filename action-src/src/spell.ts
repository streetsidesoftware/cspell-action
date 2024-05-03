import type { CSpellReporter } from 'cspell';
import { type CSpellApplicationOptions, lint as cspellAppLint } from 'cspell';

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
    // It is expected that `files` in the configuration will be used to filter the files.
    const mustFindFiles = !files;
    const options: CSpellApplicationOptions = {
        root,
        config,
        files,
        // filterFiles: files ? false : undefined,
        mustFindFiles,
    };
    if (checkDotFiles) {
        options.dot = true;
    } else if (checkDotFiles === false) {
        options.dot = false;
    }
    // console.warn('lint: %o', { globs, lintOptions, options });
    await cspellAppLint(globs, options, reporter);
}
