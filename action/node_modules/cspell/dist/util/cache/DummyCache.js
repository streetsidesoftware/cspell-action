"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DummyCache = void 0;
/**
 * Dummy cache implementation that should be usd if caching option is disabled.
 */
class DummyCache {
    getCachedLintResults() {
        return Promise.resolve(undefined);
    }
    setCachedLintResults() {
        return;
    }
    reconcile() {
        return;
    }
    reset() {
        return;
    }
}
exports.DummyCache = DummyCache;
//# sourceMappingURL=DummyCache.js.map