"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toArray = void 0;
/**
 * Reads an entire iterable and converts it into a promise.
 * @param asyncIterable the async iterable to wait for.
 */
async function toArray(asyncIterable) {
    const data = [];
    for await (const item of asyncIterable) {
        data.push(item);
    }
    return data;
}
exports.toArray = toArray;
//# sourceMappingURL=asyncIterable.js.map