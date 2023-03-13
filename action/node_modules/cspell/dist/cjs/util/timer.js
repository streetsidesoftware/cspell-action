"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hrTimeToMs = exports.elapsedTimeMsFrom = exports.getTimeMeasurer = void 0;
function getTimeMeasurer() {
    const start = process.hrtime();
    return () => hrTimeToMs(process.hrtime(start));
}
exports.getTimeMeasurer = getTimeMeasurer;
function elapsedTimeMsFrom(relativeTo) {
    return hrTimeToMs(process.hrtime(relativeTo));
}
exports.elapsedTimeMsFrom = elapsedTimeMsFrom;
function hrTimeToMs(hrTime) {
    return hrTime[0] * 1.0e3 + hrTime[1] * 1.0e-6;
}
exports.hrTimeToMs = hrTimeToMs;
//# sourceMappingURL=timer.js.map