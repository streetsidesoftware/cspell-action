import * as cspellApp from 'cspell';
import { Emitters, MessageType, Issue, RunResult, isProgressFileComplete, ProgressItem, ProgressFileComplete } from 'cspell';

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
}

function nullEmitter(_msg: string) {
    /* Do Nthings */
}

/**
 *
 * @param files files or glob patterrns to check
 * @param root the root directory to scan
 * @param logger loggger functions.
 */
export async function lint(files: string[], lintOptions: LintOptions, logger: Logger): Promise<LintResult> {
    const issues: Issue[] = [];

    function issue(issue: Issue) {
        issues.push(issue);
    }
    function info(message: string, msgType: MessageType) {
        switch (msgType) {
            case 'Debug':
                debug(message);
                break;
            case 'Info':
            default:
                debug(message);
                break;
        }
    }
    function debug(message: string) {
        nullEmitter(message);
        // logger.debug(message);
    }
    function progress(progress: ProgressItem | ProgressFileComplete) {
        if (!isProgressFileComplete(progress)) {
            return;
        }

        const {
            fileNum,
            fileCount,
            filename,
            elapsedTimeMs,
        } = progress;
        logger.info(`${fileNum}/${fileCount} ${filename} ${elapsedTimeMs?.toFixed(2)}`);
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
