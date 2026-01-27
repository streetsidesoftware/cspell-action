import { describe, expect, test, vi } from 'vitest';

import { formatCommand, issueCommand } from './command.js';

describe('command', () => {
    test.each`
        command       | properties                          | message                         | expected
        ${'warning'}  | ${{}}                               | ${'This is a warning message'}  | ${'::warning::This is a warning message'}
        ${'name'}     | ${{ key: 'value', key2: 'value2' }} | ${'Test message'}               | ${'::name key=value,key2=value2::Test message'}
        ${'set-env'}  | ${{ name: 'MY_VAR' }}               | ${'some value'}                 | ${'::set-env name=MY_VAR::some value'}
        ${'add-mask'} | ${{}}                               | ${'secretValue123'}             | ${'::add-mask::secretValue123'}
        ${'set-env'}  | ${{ name: 'MY_VAR', empty: 0 }}     | ${'some value without empty 0'} | ${'::set-env name=MY_VAR::some value without empty 0'}
        ${'set-env'}  | ${{ name: 'MY_VAR', empty: '' }}    | ${'some value without empty'}   | ${'::set-env name=MY_VAR::some value without empty'}
        ${''}         | ${{ name: 'MY_VAR' }}               | ${'no command'}                 | ${'::missing.command name=MY_VAR::no command'}
    `('formatCommand $command, $properties, $message', ({ command, properties, message, expected }) => {
        const r = formatCommand(command, properties, message);
        expect(r).toBe(expected);
    });

    test.each`
        command      | properties                          | message                        | expected
        ${'warning'} | ${{}}                               | ${'This is a warning message'} | ${'::warning::This is a warning message'}
        ${'name'}    | ${{ key: 'value', key2: 'value2' }} | ${'Test message'}              | ${'::name key=value,key2=value2::Test message'}
    `('formatCommand $command, $properties, $message', ({ command, properties, message, expected }) => {
        const w = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
        issueCommand(command, properties, message);
        expect(w).toHaveBeenLastCalledWith(expected + '\n');
    });
});
