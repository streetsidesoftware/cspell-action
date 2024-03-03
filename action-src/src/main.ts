import { info, setFailed } from '@actions/core';
import { Context } from '@actions/github/lib/context.js';
import { toError } from './error.js';
import { action } from './action.js';

export async function run(): Promise<undefined | Error> {
    try {
        info('cspell-action');
        const githubContext = new Context();

        await action(githubContext);
        info('Done.');
        return undefined;
    } catch (error) {
        console.error(error);
        const err = toError(error);
        setFailed(err.message);
        return err;
    }
}
