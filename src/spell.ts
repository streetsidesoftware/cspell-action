import * as cspellApp from 'cspell';
import {
    Emitters,
    MessageType,
    Issue,
    RunResult,
    isProgressFileComplete,
    ProgressItem,
    ProgressFileComplete,
} from 'cspell';

export interface LintResult {
    issues: Issue[];
    result: RunResult;
}

type LogFn = (message: string) => void;
export interface Logger {
    debug: LogFn;
    info: LogFn;
    warning: LogFn;
    error: LogFn;
}

export interface LintOptions {
    root: string;
    config?: string;
}

function nullEmitter(_msg: string) {
    /* Do Nothings */
}

/**
 *
 * @param files files or glob patterns to check
 * @param root the root directory to scan
 * @param logger logger functions.
 */
export async function lint(files: string[], lintOptions: LintOptions, logger: Logger): Promise<LintResult> {
    const issues: Issue[] = [];

    const issueCounts = new Map<string, number>();

    function issue(issue: Issue) {
        const uri = issue.uri;
        uri && issueCounts.set(uri, (issueCounts.get(uri) || 0) + 1);
        issues.push(issue);
    }
    function info(message: string, _msgType: MessageType) {
        debug(message);
    }
    function debug(message: string) {
        nullEmitter(message);
        // logger.debug(message);
    }
    function progress(progress: ProgressItem | ProgressFileComplete) {
        if (!isProgressFileComplete(progress)) {
            return;
        }

        const issueCount = issueCounts.get(progress.filename) || 0;
        const { fileNum, fileCount, filename, elapsedTimeMs } = progress;
        const issues = issueCount ? `issues: ${issueCount} ` : '';
        logger.info(`${fileNum}/${fileCount} ${filename} ${issues}(${elapsedTimeMs?.toFixed(2)}ms)`);
    }

    function error(message: string, error: Error) {
        logger.error(`${message}
        name: ${error.name}
        msg: ${error.message}
        stack:
${error.stack}
        `);
        return;
    }

    const emitters: Emitters = {
        issue,
        info,
        debug,
        error,
        progress,
    };

    const options: cspellApp.CSpellApplicationOptions = { ...lintOptions };
    const result = await cspellApp.lint(files, options, emitters);
    return {
        issues,
        result,
    };
}
