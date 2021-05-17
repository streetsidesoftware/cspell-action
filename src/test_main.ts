import { run } from './index';
import { pollyRun } from './test/helper';

pollyRun(__filename, `${process.env.FIXTURE_FILE_NAME}`, run);
