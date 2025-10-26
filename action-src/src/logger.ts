import { debug, error, info, warning } from '@actions/core';
import { issueCommand } from '@actions/core/lib/command.js';

export type IssueCommandFn = typeof issueCommand;

const defaultLogger = createLogger();

type LogFn = (message: string) => void;
type LogErrorFn = (message: string | Error) => void;

export interface Logger {
    debug: LogFn;
    info: LogFn;
    warning: LogErrorFn;
    error: LogErrorFn;
    issueCommand: IssueCommandFn;
}

export function createLogger(logger?: Partial<Logger>): Logger {
    return { debug, info, warning, error, issueCommand, ...logger };
}

export function getDefaultLogger(): Logger {
    return defaultLogger;
}
