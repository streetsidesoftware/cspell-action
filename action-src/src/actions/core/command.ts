import * as os from 'os';

import type { CommandProperties } from './coreTypes.js';
import { toCommandValue } from './utils.js';

/**
 * Issues a command to the GitHub Actions runner
 *
 * @param command - The command name to issue
 * @param properties - Additional properties for the command (key-value pairs)
 * @param message - The message to include with the command
 * @remarks
 * This function outputs a specially formatted string to stdout that the Actions
 * runner interprets as a command. These commands can control workflow behavior,
 * set outputs, create annotations, mask values, and more.
 *
 * Command Format:
 *   ::name key=value,key=value::message
 *
 * @example
 * ```typescript
 * // Issue a warning annotation
 * issueCommand('warning', {}, 'This is a warning message');
 * // Output: ::warning::This is a warning message
 *
 * // Set an environment variable
 * issueCommand('set-env', { name: 'MY_VAR' }, 'some value');
 * // Output: ::set-env name=MY_VAR::some value
 *
 * // Add a secret mask
 * issueCommand('add-mask', {}, 'secretValue123');
 * // Output: ::add-mask::secretValue123
 * ```
 *
 * @internal
 * This is an internal utility function that powers the public API functions
 * such as setSecret, warning, error, and exportVariable.
 */
export function issueCommand(command: string, properties: CommandProperties, message: string): void {
    const cmd = formatCommand(command, properties, message);
    process.stdout.write(cmd + os.EOL);
}

export function formatCommand(command: string, properties: CommandProperties, message: string): string {
    const cmd = new Command(command, properties, message);
    return cmd.toString();
}

const CMD_STRING = '::';

class Command {
    private readonly command: string;
    private readonly message: string;
    private readonly properties: CommandProperties;

    constructor(command: string, properties: CommandProperties, message: string) {
        if (!command) {
            command = 'missing.command';
        }

        this.command = command;
        this.properties = properties;
        this.message = message;
    }

    toString(): string {
        let cmdStr = CMD_STRING + this.command;

        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            let first = true;
            for (const [key, val] of Object.entries(this.properties)) {
                if (val) {
                    if (first) {
                        first = false;
                    } else {
                        cmdStr += ',';
                    }
                    cmdStr += `${key}=${escapeProperty(val)}`;
                }
            }
        }

        cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
        return cmdStr;
    }
}

function escapeData(s: unknown): string {
    return toCommandValue(s).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
}

function escapeProperty(s: unknown): string {
    return toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/:/g, '%3A')
        .replace(/,/g, '%2C');
}
