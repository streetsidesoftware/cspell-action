import { debug, error, info, warning } from '@actions/core';
import { issueCommand } from '@actions/core/lib/command.js';
import type {
    CSpellReporter,
    Issue,
    MessageType,
    ProgressFileComplete,
    ProgressItem,
    ReportIssueOptions,
    RunResult,
} from '@cspell/cspell-types';
import * as path from 'path';
import { URI } from 'vscode-uri';

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
    treatFlaggedWordsAsErrors: boolean;
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

    _issue(issue: Issue, _options?: ReportIssueOptions) {
        const { issues, issueCounts } = this;
        const uri = issue.uri;
        if (uri) {
            issueCounts.set(uri, (issueCounts.get(uri) || 0) + 1);
        }
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
        const errorCommand = this.options.treatFlaggedWordsAsErrors ? 'error' : command;

        const cwd = process.cwd();

        this.issues.forEach((item) => {
            const isError = item.isFlagged || false;
            const hasPreferred = item.suggestionsEx?.some((s) => s.isPreferred) || false;
            const msgPrefix = isError ? 'Forbidden word' : hasPreferred ? 'Misspelled word' : 'Unknown word';
            const suggestions = item.suggestionsEx?.map((s) => s.word + (s.isPreferred ? '*' : '')).join(', ') || '';
            const sugMsg = suggestions ? ` Suggestions: (${suggestions})` : '';
            const message = `${msgPrefix} (${item.text})${sugMsg}`;
            const cmd = isError ? errorCommand : command;

            if (!['error', 'warning'].includes(cmd)) {
                return;
            }

            // format: ::warning file={name},line={line},col={col}::{message}
            issueCommand(
                cmd,
                {
                    file: relative(cwd, item.uri || ''),
                    line: item.row,
                    col: item.col,
                },
                message,
            );
            console.warn(`${relative(cwd, item.uri || '')}:${item.row}:${item.col} ${message}`);
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
