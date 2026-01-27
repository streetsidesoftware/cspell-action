import * as os from 'os';

import { issueCommand } from './command.js';
import type { AnnotationProperties, InputOptions } from './coreTypes.js';
import { ExitCode } from './coreTypes.js';
import { issueFileCommand, prepareKeyValueMessage } from './file-command.js';
import { toCommandProperties, toCommandValue } from './utils.js';

/**
 * Gets the value of an input.
 * Unless trimWhitespace is set to false in InputOptions, the value is also trimmed.
 * Returns an empty string if the value is not defined.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
export function getInput(name: string, options?: InputOptions): string {
    const val: string = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
    if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
    }

    if (options && options.trimWhitespace === false) {
        return val;
    }

    return val.trim();
}

/**
 * Sets the value of an output.
 *
 * @param     name     name of the output to set
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
export function setOutput(name: string, value: unknown): void {
    const filePath = process.env['GITHUB_OUTPUT'] || '';
    if (filePath) {
        return issueFileCommand('OUTPUT', prepareKeyValueMessage(name, value));
    }

    process.stdout.write(os.EOL);
    issueCommand('set-output', { name }, toCommandValue(value));
}

//-----------------------------------------------------------------------
// Results
//-----------------------------------------------------------------------

/**
 * Sets the action status to failed.
 * When the action exits it will be with an exit code of 1
 * @param message add error issue message
 */
export function setFailed(message: string | Error): void {
    process.exitCode = ExitCode.Failure;

    error(message);
}

//-----------------------------------------------------------------------
// Logging Commands
//-----------------------------------------------------------------------

/**
 * Writes debug message to user log
 * @param message debug message
 */
export function debug(message: string): void {
    issueCommand('debug', {}, message);
}

/**
 * Adds an error issue
 * @param message error issue message. Errors will be converted to string via toString()
 * @param properties optional properties to add to the annotation.
 */
export function error(message: string | Error, properties: AnnotationProperties = {}): void {
    issueCommand('error', toCommandProperties(properties), message instanceof Error ? message.toString() : message);
}

/**
 * Adds a warning issue
 * @param message warning issue message. Errors will be converted to string via toString()
 * @param properties optional properties to add to the annotation.
 */
export function warning(message: string | Error, properties: AnnotationProperties = {}): void {
    issueCommand('warning', toCommandProperties(properties), message instanceof Error ? message.toString() : message);
}

/**
 * Adds a notice issue
 * @param message notice issue message. Errors will be converted to string via toString()
 * @param properties optional properties to add to the annotation.
 */
export function notice(message: string | Error, properties: AnnotationProperties = {}): void {
    issueCommand('notice', toCommandProperties(properties), message instanceof Error ? message.toString() : message);
}

/**
 * Writes info to log with console.log.
 * @param message info message
 */
export function info(message: string): void {
    process.stdout.write(message + os.EOL);
}
