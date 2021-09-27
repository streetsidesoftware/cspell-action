import * as cspellApp from 'cspell';
import { CSpellReporter } from 'cspell';

export interface LintOptions {
    root: string;
    config?: string;
}

/**
 * Spell check files.
 * @param files - files or glob patterns to check
 * @param root - the root directory to scan
 * @param reporter - reporter to use.
 */
export async function lint(files: string[], lintOptions: LintOptions, reporter: CSpellReporter): Promise<void> {
    const { root, config } = lintOptions;
    const options: cspellApp.CSpellApplicationOptions = { root, config };
    await cspellApp.lint(files, options, reporter);
}
