"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pipeSync = exports.pipeAsync = void 0;
const helpers_1 = require("./helpers");
function pipeAsync(i, ...fns) {
    let iter = (0, helpers_1.toAsyncIterable)(i);
    for (const fn of fns) {
        iter = fn(iter);
    }
    return iter;
}
exports.pipeAsync = pipeAsync;
function pipeSync(i, ...fns) {
    let iter = i;
    for (const fn of fns) {
        iter = fn(iter);
    }
    return iter;
}
exports.pipeSync = pipeSync;
//# sourceMappingURL=pipe.js.map