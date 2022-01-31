"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.opUnique = exports.opUniqueSync = exports.opUniqueAsync = void 0;
const util_1 = require("../helpers/util");
function opUniqueAsync(k) {
    function fnK(k) {
        async function* fn(iter) {
            const s = new Set();
            for await (const v of iter) {
                const kk = k(v);
                if (s.has(kk))
                    continue;
                s.add(kk);
                yield v;
            }
        }
        return fn;
    }
    async function* fn(iter) {
        const s = new Set();
        for await (const v of iter) {
            if (s.has(v))
                continue;
            s.add(v);
            yield v;
        }
    }
    return k ? fnK(k) : fn;
}
exports.opUniqueAsync = opUniqueAsync;
function opUniqueSync(k) {
    function fnK(key) {
        function* fn(iter) {
            const s = new Set();
            for (const v of iter) {
                const kk = key(v);
                if (s.has(kk))
                    continue;
                s.add(kk);
                yield v;
            }
        }
        return fn;
    }
    function* fn(iter) {
        const s = new Set();
        for (const v of iter) {
            if (s.has(v))
                continue;
            s.add(v);
            yield v;
        }
    }
    return k ? fnK(k) : fn;
}
exports.opUniqueSync = opUniqueSync;
const opUnique = (getKey) => (0, util_1.toPipeFn)(opUniqueSync(getKey), opUniqueAsync(getKey));
exports.opUnique = opUnique;
//# sourceMappingURL=unique.js.map