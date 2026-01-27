import { action } from './action.js';
import { info, setFailed } from './actions/core/index.js';
import { Context } from './actions/github/index.js';
import { toError } from './error.js';

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
