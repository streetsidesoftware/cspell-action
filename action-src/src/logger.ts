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

/**
 *
 * @param logger - overrides
 */
export function overrideDefaultLogger(logger: Partial<Logger>): Logger {
    if (logger.debug) defaultLogger.debug = logger.debug;
    if (logger.info) defaultLogger.info = logger.info;
    if (logger.warning) defaultLogger.warning = logger.warning;
    if (logger.error) defaultLogger.error = logger.error;
    if (logger.issueCommand) defaultLogger.issueCommand = logger.issueCommand;

    return defaultLogger;
}
