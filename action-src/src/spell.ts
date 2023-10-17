import { type CSpellApplicationOptions, lint as cspellAppLint } from 'cspell';
import type { CSpellReporter } from 'cspell';

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
}

/**
 * Spell check files.
 * @param files - files or glob patterns to check
 * @param root - the root directory to scan
 * @param reporter - reporter to use.
 */
export async function lint(files: string[], lintOptions: LintOptions, reporter: CSpellReporter): Promise<void> {
    const { root, config, checkDotFiles } = lintOptions;
    const options: CSpellApplicationOptions = { root, config };
    if (checkDotFiles) {
        options.dot = true;
    } else if (checkDotFiles === false) {
        options.dot = false;
    }
    await cspellAppLint(files, options, reporter);
}
