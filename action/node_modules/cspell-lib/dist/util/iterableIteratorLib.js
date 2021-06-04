"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.concatIterables = exports.toIterableIterator = void 0;
function* toIterableIterator(i) {
    yield* i;
}
exports.toIterableIterator = toIterableIterator;
function* concatIterables(...iterables) {
    for (const i of iterables) {
        yield* i;
    }
}
exports.concatIterables = concatIterables;
//# sourceMappingURL=iterableIteratorLib.js.map