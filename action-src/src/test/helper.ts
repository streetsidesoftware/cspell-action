import * as path from 'path';
import * as fs from 'fs';
import { Polly } from '@pollyjs/core';
import NodeHttpAdapter from '@pollyjs/adapter-node-http';
import FSPersister from '@pollyjs/persister-fs';

Polly.register(NodeHttpAdapter);
Polly.register(FSPersister);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const tsconfig = require('../../tsconfig.json');

export const sourceDir = path.resolve(path.join(__dirname, '..', '..'));
export const root = path.resolve(path.join(sourceDir, '..'));
export const fixturesLocation = path.join(sourceDir, 'fixtures');

const outputDir = path.resolve(sourceDir, tsconfig.compilerOptions.outDir);

export const debugDir = outputDir;

export function fetchGithubActionFixture(filename: string): Record<string, string> {
    const githubEnv = JSON.parse(fs.readFileSync(path.resolve(fixturesLocation, filename), 'utf-8'));
    if (githubEnv['GITHUB_EVENT_PATH']) {
        githubEnv['GITHUB_EVENT_PATH'] = path.resolve(root, githubEnv['GITHUB_EVENT_PATH']);
    }
    const env = {
        ...process.env,
        ...githubEnv,
    };

    return env;
}

function setupPolly(name: string, dir: string): Polly {
    const polly = new Polly(name, {
        adapters: ['node-http'],
        persister: 'fs',
        persisterOptions: {
            fs: {
                recordingsDir: dir,
            },
        },
        recordIfMissing: false,
        matchRequestsBy: {
            method: true,
            headers: false,
            body: true,
            order: false,

            url: {
                protocol: true,
                username: true,
                password: true,
                hostname: true,
                port: true,
                pathname: true,
                query: true,
                hash: false,
            },
        },
    });
    const { server } = polly;
    server.any().on('beforePersist', (_req, recording) => {
        recording.request.headers = [];
    });
    return polly;
}

export async function pollyRun(
    testFile: string,
    testName: string,
    fn: (poly: Polly) => Promise<unknown>
): Promise<void> {
    const rel = path.relative(sourceDir, testFile);
    const dir = path.resolve(fixturesLocation, '__recordings__', rel);
    const poly = setupPolly(testName, dir);
    try {
        // console.warn('Poly Context: %o', { testFile, testName, dir });
        poly.replay();
        await fn(poly);
    } finally {
        poly.stop();
    }
}
