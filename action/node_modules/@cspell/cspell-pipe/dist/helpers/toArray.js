"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toArray = void 0;
const _1 = require(".");
function toArray(i) {
    return (0, _1.isAsyncIterable)(i) ? toArrayAsync(i) : toArraySync(i);
}
exports.toArray = toArray;
function toArraySync(iter) {
    return [...iter];
}
async function toArrayAsync(iter) {
    const collection = [];
    for await (const i of iter) {
        collection.push(i);
    }
    return collection;
}
//# sourceMappingURL=toArray.js.map