"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAsyncIterable = exports.toPipeFn = void 0;
function toPipeFn(syncFn, asyncFn) {
    function _(i) {
        return isAsyncIterable(i) ? asyncFn(i) : syncFn(i);
    }
    return _;
}
exports.toPipeFn = toPipeFn;
function isAsyncIterable(i) {
    return typeof i[Symbol.asyncIterator] === 'function';
}
exports.isAsyncIterable = isAsyncIterable;
//# sourceMappingURL=util.js.map