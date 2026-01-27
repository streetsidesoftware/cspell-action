import { constants } from 'node:fs';
import { access, appendFile, writeFile } from 'node:fs/promises';

export const SUMMARY_ENV_VAR = 'GITHUB_STEP_SUMMARY';

export interface SummaryWriteOptions {
    /**
     * Replace all existing content in summary file with buffer contents
     * (optional) default: false
     */
    overwrite?: boolean;
}

class Summary {
    private _buffer: string;
    private _filePath?: string;

    constructor() {
        this._buffer = '';
    }

    /**
     * Finds the summary file path from the environment, rejects if env var is not found or file does not exist
     * Also checks r/w permissions.
     *
     * @returns step summary file path
     */
    private async filePath(): Promise<string> {
        if (this._filePath) {
            return this._filePath;
        }

        const pathFromEnv = process.env[SUMMARY_ENV_VAR];
        if (!pathFromEnv) {
            throw new Error(
                `Unable to find environment variable for $${SUMMARY_ENV_VAR}. Check if your runtime environment supports job summaries.`,
            );
        }

        try {
            await access(pathFromEnv, constants.R_OK | constants.W_OK);
        } catch {
            throw new Error(
                `Unable to access summary file: '${pathFromEnv}'. Check if the file has correct read/write permissions.`,
            );
        }

        this._filePath = pathFromEnv;
        return this._filePath;
    }

    /**
     * Writes text in the buffer to the summary buffer file and empties buffer. Will append by default.
     *
     * @param (optional) options for write operation
     *
     * @returns summary instance
     */
    async write(options?: SummaryWriteOptions): Promise<this> {
        const overwrite = !!options?.overwrite;
        const filePath = await this.filePath();
        const writeFunc = overwrite ? writeFile : appendFile;
        await writeFunc(filePath, this._buffer, { encoding: 'utf8' });
        return this.emptyBuffer();
    }

    /**
     * Resets the summary buffer without writing to summary file
     *
     * @returns summary instance
     */
    emptyBuffer(): this {
        this._buffer = '';
        return this;
    }

    /**
     * Adds raw text to the summary buffer
     *
     * @param text content to add
     * @param (optional) append an EOL to the raw text (default: false)
     *
     * @returns summary instance
     */
    addRaw(text: string): this {
        this._buffer += text;
        return this;
    }
}

export const summary: Summary = new Summary();
