import { Sequence, GenIterable } from './types';
import { toIterableIterator } from './util/util';
export { Sequence, GenIterable, AsyncGenIterable } from './types';
export { toIterableIterator } from './util/util';
export interface SequenceCreator<T> {
    (i: GenIterable<T>): Sequence<T>;
    fromObject: <U>(u: U) => Sequence<KeyValuePair<U>>;
}
export declare function genSequence<T>(i: () => GenIterable<T>): Sequence<T>;
export declare function genSequence<T>(i: GenIterable<T>): Sequence<T>;
export declare const GenSequence: {
    genSequence: typeof genSequence;
    sequenceFromRegExpMatch: typeof sequenceFromRegExpMatch;
    sequenceFromObject: typeof sequenceFromObject;
};
/**
 * alias of toIterableIterator
 */
export declare const toIterator: typeof toIterableIterator;
export declare type KeyValuePair<T> = [keyof T, T[keyof T]];
export declare function objectIterator<T>(t: T): IterableIterator<KeyValuePair<T>>;
export declare function objectToSequence<T>(t: T): Sequence<KeyValuePair<T>>;
export declare function sequenceFromObject<T>(t: T): Sequence<KeyValuePair<T>>;
export declare function sequenceFromRegExpMatch(pattern: RegExp, text: string): Sequence<RegExpExecArray>;
export default genSequence;
