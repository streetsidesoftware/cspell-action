// For internal use, subject to change.

import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';

import { toCommandValue } from './utils.js';

export function issueFileCommand(command: string, message: unknown): void {
    const filePath = process.env[`GITHUB_${command}`];
    if (!filePath) {
        throw new Error(`Unable to find environment variable for file command ${command}`);
    }
    if (!fs.existsSync(filePath)) {
        throw new Error(`Missing file at path: ${filePath}`);
    }

    fs.appendFileSync(filePath, `${toCommandValue(message)}${os.EOL}`, {
        encoding: 'utf8',
    });
}

export function prepareKeyValueMessage(key: string, value: unknown): string {
    const delimiter = `ghadelimiter_${crypto.randomUUID()}`; // cspell:ignore ghadelimiter
    const convertedValue = toCommandValue(value);

    return `${key}<<${delimiter}${os.EOL}${convertedValue}${os.EOL}${delimiter}`;
}
