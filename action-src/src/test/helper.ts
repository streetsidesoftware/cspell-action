import * as path from 'path';
import * as fs from 'fs';
import { Polly, PollyConfig } from '@pollyjs/core';
import Adapter from '@pollyjs/adapter';
import Persister from '@pollyjs/persister';
import NodeHttpAdapter from '@pollyjs/adapter-node-http';
import FSPersister from '@pollyjs/persister-fs';

Polly.register(NodeHttpAdapter as typeof Adapter);
Polly.register(FSPersister as typeof Persister);

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

type SetupPolyOptions = Pick<PollyConfig, 'recordIfMissing'>;

function setupPolly(name: string, dir: string, options?: SetupPolyOptions): Polly {
    const polly = new Polly(name, {
        adapters: ['node-http'],
        persister: 'fs',
        persisterOptions: {
            fs: {
                recordingsDir: dir,
            },
        },
        recordIfMissing: options?.recordIfMissing ?? false,
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
    fn: (poly: Polly) => Promise<unknown>,
    options?: SetupPolyOptions
): Promise<void> {
    const rel = path.relative(sourceDir, testFile);
    const dir = path.resolve(fixturesLocation, '__recordings__', rel);
    const poly = setupPolly(testName, dir, options);
    try {
        // console.warn('Poly Context: %o', { testFile, testName, dir });
        poly.replay();
        await fn(poly);
    } finally {
        poly.stop();
    }
}
