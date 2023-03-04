"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoCacheWeakMap = exports.AutoCacheMap = void 0;
class AutoCacheMap extends Map {
    constructor(autoFn) {
        super();
        this.autoFn = autoFn;
    }
    get(v) {
        const r = super.get(v);
        if (r !== undefined)
            return r;
        const u = this.autoFn(v);
        super.set(v, u);
        return u;
    }
}
exports.AutoCacheMap = AutoCacheMap;
class AutoCacheWeakMap extends WeakMap {
    constructor(autoFn) {
        super();
        this.autoFn = autoFn;
    }
    get(v) {
        const r = super.get(v);
        if (r !== undefined)
            return r;
        const u = this.autoFn(v);
        super.set(v, u);
        return u;
    }
}
exports.AutoCacheWeakMap = AutoCacheWeakMap;
//# sourceMappingURL=autoCacheMap.js.map