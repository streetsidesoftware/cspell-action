import * as spell from './spell'
import * as path from 'path'

const root = path.join(__dirname, '..')

describe('Validate Spell Checking', () => {
    test('Linting some files', async () => {
        const options = {
            root
        }
        const f = () => {};
        const emitters = {
            error: jest.fn(f),
            debug: jest.fn(f),
            info: jest.fn(f),
            warning: jest.fn(f),
        }
        const r = await spell.lint(['src/spell.ts', 'fixtures/sampleCode/ts/**/*.ts'], options, emitters)
        expect(r.result.files).toBe(2)
        expect(r.result.issues).toBe(0)
        expect(r.result.filesWithIssues.size).toBe(0)
        expect(r.issues).toEqual([])
    });
});
