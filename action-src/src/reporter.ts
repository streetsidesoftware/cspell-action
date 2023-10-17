import { debug, info, warning, error } from '@actions/core';
import { issueCommand } from '@actions/core/lib/command';
import type {
    CSpellReporter,
    Issue,
    MessageType,
    ProgressItem,
    RunResult,
    ProgressFileComplete,
} from '@cspell/cspell-types';
import { URI } from 'vscode-uri';
import * as path from 'path';

const core = { debug, info, warning, error };

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

export type ReportIssueCommand = 'error' | 'warning' | 'none';

export interface ReporterOptions {
    verbose: boolean;
}

export class CSpellReporterForGithubAction {
    readonly issues: Issue[] = [];
    readonly issueCounts = new Map<string, number>();
    readonly result: RunResult = {
        files: -1,
        filesWithIssues: new Set(),
        issues: -1,
        errors: -1,
        cachedFiles: 0,
    };
    finished: boolean = false;
    verbose: boolean;

    constructor(
        readonly reportIssueCommand: ReportIssueCommand,
        readonly options: ReporterOptions,
        readonly logger: Logger = core,
    ) {
        this.verbose = options.verbose;
    }

    _issue(issue: Issue) {
        const { issues, issueCounts } = this;
        const uri = issue.uri;
        uri && issueCounts.set(uri, (issueCounts.get(uri) || 0) + 1);
        issues.push(issue);
    }

    _info(message: string, _msgType: MessageType) {
        this._debug(message);
    }

    _debug(message: string) {
        nullEmitter(message);
        // logger.debug(message);
    }

    _progress(progress: ProgressItem | ProgressFileComplete) {
        if (!this.verbose || !isProgressFileComplete(progress)) {
            return;
        }
        const { issueCounts, logger } = this;

        const issueCount = issueCounts.get(progress.filename) || 0;
        const { fileNum, fileCount, filename, elapsedTimeMs } = progress;
        const issues = issueCount ? ` issues: ${issueCount}` : '';
        const timeMsg = elapsedTimeMs ? `(${elapsedTimeMs.toFixed(2)}ms)` : '-';
        logger.info(`${fileNum}/${fileCount} ${filename}${issues} ${timeMsg}`);
    }

    _error(message: string, error: Error) {
        const { logger } = this;
        logger.error(`${message}
        name: ${error.name}
        msg: ${error.message}
        stack:
${error.stack}
        `);
        return;
    }

    _result(result: RunResult) {
        Object.assign(this.result, result);
        this.finished = true;
        const command = this.reportIssueCommand;

        if (!['error', 'warning'].includes(command)) {
            return;
        }

        const cwd = process.cwd();

        this.issues.forEach((item) => {
            // format: ::warning file={name},line={line},col={col}::{message}
            issueCommand(
                command,
                {
                    file: relative(cwd, item.uri || ''),
                    line: item.row,
                    col: item.col,
                },
                `Unknown word (${item.text})`,
            );
            console.warn(`${relative(cwd, item.uri || '')}:${item.row}:${item.col} Unknown word (${item.text})`);
        });
    }

    readonly reporter: CSpellReporter = {
        debug: (...args) => this._debug(...args),
        error: (...args) => this._error(...args),
        info: (...args) => this._info(...args),
        issue: (...args) => this._issue(...args),
        progress: (...args) => this._progress(...args),
        result: (...args) => this._result(...args),
    };
}

function isProgressFileComplete(p: ProgressItem): p is ProgressFileComplete {
    return p.type === 'ProgressFileComplete';
}

function relative(cwd: string, fileUri: string) {
    const fsPath = URI.parse(fileUri).fsPath;
    return path.relative(cwd, fsPath);
}
