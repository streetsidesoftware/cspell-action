
export type TrueFalse = 'true' | 'false';

/**
 * Convert a string, boolean, or number to 'true'|'false' or return the string as-is.
 * @param v - value to convert
 * @returns
 */
export function tf(value: string | boolean | number): TrueFalse | string {
    let v = value;
    const mapValues: Record<string, TrueFalse> = {
        true: 'true',
        t: 'true',
        false: 'false',
        f: 'false',
        '0': 'false',
        '1': 'true',
    };
    v = typeof v === 'boolean' || typeof v === 'number' ? (v ? 'true' : 'false') : v;
    v = v.toString();
    v = v.toLowerCase();
    v = mapValues[v] || value;
    return v;
}
