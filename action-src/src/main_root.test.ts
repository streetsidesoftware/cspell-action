import { describe, test, expect, vi } from 'vitest';
import { run } from './main';

vi.mock('./main');

import './main_root';

const runMocked = vi.mocked(run);

describe('main_root', () => {
    test('run called', () => {
        expect(runMocked).toHaveBeenCalled();
    });
});
