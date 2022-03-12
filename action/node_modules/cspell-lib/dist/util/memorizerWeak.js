"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memorizerWeak = void 0;
// prettier-ignore
function memorizerWeak(fn) {
    const r = {};
    function find(p) {
        var _a;
        let n = r;
        for (const k of p) {
            if (!n)
                break;
            n = (_a = n.c) === null || _a === void 0 ? void 0 : _a.get(k);
        }
        return n;
    }
    function set(p, v) {
        var _a;
        let n = r;
        for (const k of p) {
            const c = (_a = n.c) === null || _a === void 0 ? void 0 : _a.get(k);
            if (c) {
                n = c;
                continue;
            }
            const r = {};
            n.c = n.c || new WeakMap();
            n.c.set(k, r);
            n = r;
        }
        n.v = v;
    }
    return (...p) => {
        const f = find(p);
        if (f && 'v' in f) {
            return f.v;
        }
        const v = fn(...p);
        set(p, v);
        return v;
    };
}
exports.memorizerWeak = memorizerWeak;
//# sourceMappingURL=memorizerWeak.js.map