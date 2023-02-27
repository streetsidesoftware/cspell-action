"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.opAwaitAsync = void 0;
async function* _asyncAwait(iter) {
    for await (const v of iter) {
        yield v;
    }
}
function opAwaitAsync() {
    return _asyncAwait;
}
exports.opAwaitAsync = opAwaitAsync;
//# sourceMappingURL=await.js.map