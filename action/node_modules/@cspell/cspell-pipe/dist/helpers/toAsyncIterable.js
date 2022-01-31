"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toAsyncIterable = exports.mergeAsyncIterables = void 0;
/**
 * Merge multiple iterables into an AsyncIterable
 * @param iter - initial iterable.
 * @param rest - iterables to merge.
 */
async function* mergeAsyncIterables(iter, ...rest) {
    for await (const i of [iter, ...rest]) {
        yield* i;
    }
}
exports.mergeAsyncIterables = mergeAsyncIterables;
/**
 * Convert one or more iterables to an AsyncIterable
 */
exports.toAsyncIterable = mergeAsyncIterables;
//# sourceMappingURL=toAsyncIterable.js.map