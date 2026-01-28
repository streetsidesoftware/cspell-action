import { defineConfig, type UserConfig } from 'tsdown';

export default defineConfig([
    {
        entry: ['src/main_root.ts'],
        outDir: '../action/lib',
        format: ['esm'],
        target: 'Node24',
        fixedExtension: false,
        dts: false,
        sourcemap: false,
        clean: true,
        external: ['@cspell/cspell-bundled-dicts'],
        inlineOnly: false, // Nearly everything is inlined.
    },
]) as UserConfig[];
