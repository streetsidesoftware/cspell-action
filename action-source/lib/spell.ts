import * as cspellApp from 'cspell';
import { Emitters, MessageType, Issue, RunResult } from 'cspell';

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

function nullEmitter() {
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

    function issue(issue: Issue) {
        issues.push(issue);
    }
    function info(message: string, msgType: MessageType) {
        switch (msgType) {
            case 'Debug':
                logger.debug(message);
                break;
            case 'Info':
            default:
                logger.info(message);
                break;
        }
    }
    function debug(message: string) {
        logger.debug(message);
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
        info: nullEmitter,
        debug: nullEmitter,
        error,
        progress: nullEmitter,
    };

    const options: cspellApp.CSpellApplicationOptions = { ...lintOptions };
    const result = await cspellApp.lint(files, options, emitters);
    return {
        issues,
        result,
    };
}
