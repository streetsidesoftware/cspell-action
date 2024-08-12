import { info, setFailed } from '@actions/core';
import { Context } from '@actions/github/lib/context.js';

import { action } from './action.js';
import { toError } from './error.js';

export async function run(): Promise<undefined | Error> {
    try {
        info('cspell-action');
        const githubContext = new Context();

        const success = await action(githubContext);
        if (!success) {
            setFailed('Errors found.');
        }
        info('Done.');
        return undefined;
    } catch (error) {
        console.error(error);
        const err = toError(error);
        setFailed(err.message);
        return err;
    }
}
