import { describe, expect, test, vi } from 'vitest';

import { run } from './main.js';

vi.mock('./main');

import './main_root.js';

const runMocked = vi.mocked(run);

describe('main_root', () => {
    test('run called', () => {
        expect(runMocked).toHaveBeenCalled();
    });
});
