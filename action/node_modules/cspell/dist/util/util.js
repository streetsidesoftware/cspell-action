"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.width = exports.padLeft = exports.pad = exports.padWidth = exports.clean = exports.unique = exports.uniqueFilterFnGenerator = exports.uniqueFn = void 0;
// alias for uniqueFilterFnGenerator
exports.uniqueFn = uniqueFilterFnGenerator;
function uniqueFilterFnGenerator(extractFn) {
    const values = new Set();
    const extractor = extractFn || ((a) => a);
    return (v) => {
        const vv = extractor(v);
        const ret = !values.has(vv);
        values.add(vv);
        return ret;
    };
}
exports.uniqueFilterFnGenerator = uniqueFilterFnGenerator;
function unique(src) {
    return [...new Set(src)];
}
exports.unique = unique;
function clean(src) {
    const r = src;
    for (const key of Object.keys(r)) {
        if (r[key] === undefined) {
            delete r[key];
        }
    }
    return r;
}
exports.clean = clean;
function padWidth(s, target) {
    const sWidth = width(s);
    return Math.max(target - sWidth, 0);
}
exports.padWidth = padWidth;
function pad(s, w) {
    const p = padWidth(s, w);
    if (!p)
        return s;
    return s + ' '.repeat(p);
}
exports.pad = pad;
function padLeft(s, w) {
    const p = padWidth(s, w);
    if (!p)
        return s;
    return ' '.repeat(p) + s;
}
exports.padLeft = padLeft;
function width(s) {
    // eslint-disable-next-line no-control-regex
    return s.replace(/[\u0300-\u036f\x00-\x1f]/g, '').length;
}
exports.width = width;
//# sourceMappingURL=util.js.map