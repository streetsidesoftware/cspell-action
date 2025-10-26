import { describe, expect, it } from 'vitest';

import { tf, type TrueFalse } from './utils.js';

// AI Generated tests for the tf function

describe('tf function', () => {
    describe('boolean inputs', () => {
        it('should convert true to "true"', () => {
            expect(tf(true)).toBe('true');
        });

        it('should convert false to "false"', () => {
            expect(tf(false)).toBe('false');
        });
    });

    describe('number inputs', () => {
        it('should convert 0 to "false"', () => {
            expect(tf(0)).toBe('false');
        });

        it('should convert 1 to "true"', () => {
            expect(tf(1)).toBe('true');
        });

        it('should convert negative numbers to "true"', () => {
            expect(tf(-1)).toBe('true');
            expect(tf(-5)).toBe('true');
        });

        it('should convert positive numbers (except 0) to "true"', () => {
            expect(tf(2)).toBe('true');
            expect(tf(100)).toBe('true');
            expect(tf(3.14)).toBe('true');
        });

        it('should convert decimal numbers correctly', () => {
            expect(tf(0.0)).toBe('false');
            expect(tf(0.1)).toBe('true');
        });
    });

    describe('string inputs - recognized values', () => {
        it('should convert "true" to "true" (case insensitive)', () => {
            expect(tf('true')).toBe('true');
            expect(tf('TRUE')).toBe('true');
            expect(tf('True')).toBe('true');
            expect(tf('TrUe')).toBe('true');
        });

        it('should convert "t" to "true" (case insensitive)', () => {
            expect(tf('t')).toBe('true');
            expect(tf('T')).toBe('true');
        });

        it('should convert "false" to "false" (case insensitive)', () => {
            expect(tf('false')).toBe('false');
            expect(tf('FALSE')).toBe('false');
            expect(tf('False')).toBe('false');
            expect(tf('FaLsE')).toBe('false');
        });

        it('should convert "f" to "false" (case insensitive)', () => {
            expect(tf('f')).toBe('false');
            expect(tf('F')).toBe('false');
        });

        it('should convert string "0" to "false"', () => {
            expect(tf('0')).toBe('false');
        });

        it('should convert string "1" to "true"', () => {
            expect(tf('1')).toBe('true');
        });
    });

    describe('string inputs - unrecognized values', () => {
        it('should return unrecognized strings as-is', () => {
            expect(tf('yes')).toBe('yes');
            expect(tf('no')).toBe('no');
            expect(tf('on')).toBe('on');
            expect(tf('off')).toBe('off');
            expect(tf('Maybe')).toBe('Maybe');
            expect(tf('2')).toBe('2');
            expect(tf('10')).toBe('10');
            expect(tf('-1')).toBe('-1');
        });

        it('should return empty string as-is', () => {
            expect(tf('')).toBe('');
        });

        it('should return whitespace strings as-is', () => {
            expect(tf(' ')).toBe(' ');
            expect(tf('  ')).toBe('  ');
            expect(tf('\t')).toBe('\t');
            expect(tf('\n')).toBe('\n');
        });

        it('should handle special characters', () => {
            expect(tf('!')).toBe('!');
            expect(tf('@#$')).toBe('@#$');
            expect(tf('null')).toBe('null');
            expect(tf('undefined')).toBe('undefined');
        });

        it('should handle strings with mixed case that are not recognized', () => {
            expect(tf('TrueValue')).toBe('TrueValue');
            expect(tf('FalseValue')).toBe('FalseValue');
        });
    });

    describe('edge cases', () => {
        it('should handle strings that contain recognized values but with extra characters', () => {
            expect(tf('true1')).toBe('true1');
            expect(tf('false0')).toBe('false0');
            expect(tf('t_true')).toBe('t_true');
            expect(tf('f_false')).toBe('f_false');
        });

        it('should handle numeric strings that are not 0 or 1', () => {
            expect(tf('2')).toBe('2');
            expect(tf('100')).toBe('100');
            expect(tf('-5')).toBe('-5');
            expect(tf('3.14')).toBe('3.14');
        });
    });

    describe('type checking', () => {
        it('should return TrueFalse type for recognized boolean values', () => {
            const result1: TrueFalse | string = tf(true);
            const result2: TrueFalse | string = tf('true');
            const result3: TrueFalse | string = tf(1);

            // These should be TrueFalse values
            expect(['true', 'false'].includes(result1 as TrueFalse)).toBe(true);
            expect(['true', 'false'].includes(result2 as TrueFalse)).toBe(true);
            expect(['true', 'false'].includes(result3 as TrueFalse)).toBe(true);
        });

        it('should return string type for unrecognized values', () => {
            const result: TrueFalse | string = tf('unrecognized');
            expect(typeof result).toBe('string');
            expect(result).toBe('unrecognized');
        });
    });
});
