import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { vi } from 'vitest';

import { IssueCommandFn, Logger } from '../logger.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const urlTSConfig = new URL('../../tsconfig.json', import.meta.url);

const tsconfig = JSON.parse(fs.readFileSync(urlTSConfig, 'utf-8'));

export const sourceDir: string = path.resolve(path.join(__dirname, '..', '..'));
/** Repo Root */
export const root: string = path.resolve(path.join(sourceDir, '..'));
export const fixturesLocation: string = path.join(sourceDir, './fixtures');

const outputDir = path.resolve(sourceDir, tsconfig.compilerOptions.outDir);

export const debugDir: string = outputDir;

export function fetchGithubActionFixture(filename: string): Record<string, string> {
    const absFixtureFile = path.resolve(fixturesLocation, filename);
    const absFixtureDir = path.dirname(absFixtureFile);
    const githubEnv = JSON.parse(fs.readFileSync(absFixtureFile, 'utf-8'));
    if (githubEnv['GITHUB_EVENT_PATH']) {
        githubEnv['GITHUB_EVENT_PATH'] = path
            .resolve(absFixtureDir, githubEnv['GITHUB_EVENT_PATH'])
            .replace(/fixtures[/\\]fixtures/, 'fixtures');
    }
    const env = {
        ...process.env,
        ...githubEnv,
    };

    return env;
}

export function resolveFile(file: string, rootDir: string = root): string {
    return path.resolve(rootDir, file);
}

export function resolveFiles(files: string[] | undefined, rootDir?: string): string[] | undefined {
    if (!files) return files;
    return files.map((file) => resolveFile(file, rootDir));
}

type IssueCommandFnParams = Parameters<Logger['issueCommand']>;

export function createIssueCommandCollector(): { issueCommand: IssueCommandFn; calls: IssueCommandFnParams[] } {
    const calls: IssueCommandFnParams[] = [];
    const issueCommand: IssueCommandFn = (...params: IssueCommandFnParams) => {
        calls.push(params);
    };
    return { issueCommand, calls };
}

export function issueCommandToString(params: IssueCommandFnParams): string {
    return JSON.stringify(params);
}

export function mockLogger(loggerOverrides: Partial<Logger> = {}): Logger {
    const f = () => {};
    const logger: Logger = {
        error: vi.fn(f),
        debug: vi.fn(f),
        info: vi.fn(f),
        warning: vi.fn(f),
        issueCommand: vi.fn(f),
        ...loggerOverrides,
    };

    return logger;
}
