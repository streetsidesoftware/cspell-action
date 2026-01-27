import path from 'node:path';

import { describe, expect, test, vi } from 'vitest';

import { fetchGithubActionFixture, root } from '../../test/helper.js';

const configFile = path.resolve(root, 'cspell.json');

import { Context } from './context.js';

describe('Context', () => {
    test('Context', () => {
        createContextEnvFromFile('pull_request.json');
        const context = new Context();
        expect(context.eventName).toBe('pull_request');
        expect(context.sha).toBe('fac78ee45538f198c00ae651db5aedc7336f7ccc');
    });

    test('Context no event path', () => {
        createContextEnvFromFile('pull_request.json');
        process.env.GITHUB_EVENT_PATH = '';
        const context = new Context();
        expect(context.eventName).toBe('pull_request');
        expect(context.sha).toBe('fac78ee45538f198c00ae651db5aedc7336f7ccc');
    });

    test('Context bad event path', () => {
        process.env.GITHUB_EVENT_PATH = './non/existent/path.json';
        const stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
        expect(() => new Context()).not.toThrow();
        expect(stdoutSpy).toHaveBeenCalledWith('GITHUB_EVENT_PATH ./non/existent/path.json does not exist\n');
    });

    test('Context.issue', () => {
        createContextEnvFromFile('pull_request.json');
        const context = new Context();
        expect(context.issue).toEqual({ number: 3, owner: 'streetsidesoftware', repo: 'cspell-action' });
    });

    test('Context.issue with non-issue', () => {
        process.env.GITHUB_EVENT_PATH = '';
        process.env.GITHUB_REPOSITORY = 'some-owner/some-repo';
        const context = new Context();
        expect(context.issue).toEqual({ number: undefined, owner: 'some-owner', repo: 'some-repo' });
    });

    test('Context.repo', () => {
        createContextEnvFromFile('pull_request.json');
        process.env.GITHUB_REPOSITORY = '';
        const context = new Context();
        expect(context.repo).toEqual({ owner: 'streetsidesoftware', repo: 'cspell-action' });

        process.env.GITHUB_REPOSITORY = 'some-owner/some-repo';
        expect(context.repo).toEqual({ owner: 'some-owner', repo: 'some-repo' });
    });

    test('Context.repo error', () => {
        process.env.GITHUB_EVENT_PATH = '';
        process.env.GITHUB_REPOSITORY = '';
        const context = new Context();
        expect(() => context.repo).toThrow(
            "context.repo requires a GITHUB_REPOSITORY environment variable like 'owner/repo'",
        );
    });
});

function createContextEnvFromFile(filename: string, ...params: Record<string, string>[]): void {
    return createContext(fetchGithubActionFixture(filename), ...params);
}

function createContext(...params: Record<string, string>[]): void {
    Object.assign(process.env, ...params);
    setEnvIfNotExist('INPUT_ROOT', root);
    setEnvIfNotExist('INPUT_CONFIG', configFile);
    process.env.INPUT_CONFIG = path.resolve(root, process.env.INPUT_CONFIG || configFile);
}

function setEnvIfNotExist(key: string, value: string) {
    if (process.env[key] === undefined) {
        process.env[key] = value;
    }
}
