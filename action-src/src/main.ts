import { info, getInput, setFailed } from '@actions/core';
import { getOctokit } from '@actions/github';
import { Context } from '@actions/github/lib/context';
import assert from 'assert';
import { isAppError, isError } from './error';
import { action } from './action';
import { format } from 'util';

function getGithubToken(): string | undefined {
    const t0 = getInput('github_token', { required: true });
    if (t0[0] !== '$') {
        return t0 !== 'undefined' ? t0 : undefined;
    }
    return process.env[t0.slice(1)] || undefined;
}

export async function run(): Promise<undefined | Error> {
    try {
        info('cspell-action');
        const githubContext = new Context();
        const githubToken = getGithubToken();
        assert(githubToken, 'GITHUB_TOKEN is required.');

        await action(githubContext, getOctokit(githubToken));
        info('Done.');
        return undefined;
    } catch (error) {
        console.error(error);
        setFailed(isAppError(error) ? error.message : isError(error) ? error : format(error));
        return isError(error) ? error : Error(format(error));
    }
}
