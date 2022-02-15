"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.distanceAStarWeightedEx = exports.distanceAStarWeighted = void 0;
const assert_1 = __importDefault(require("assert"));
const PairingHeap_1 = require("../utils/PairingHeap");
/**
 * Calculate the edit distance between two words using an A* algorithm.
 *
 * Using basic weights, this algorithm has the same results as the Damerau-Levenshtein algorithm.
 */
function distanceAStarWeighted(wordA, wordB, map, cost = 100) {
    const best = _distanceAStarWeightedEx(wordA, wordB, map, cost);
    const penalty = map.calcAdjustment(wordB);
    return best.c + best.p + penalty;
}
exports.distanceAStarWeighted = distanceAStarWeighted;
function distanceAStarWeightedEx(wordA, wordB, map, cost = 100) {
    const best = _distanceAStarWeightedEx(wordA, wordB, map, cost);
    const aa = '^' + wordA + '$';
    const bb = '^' + wordB + '$';
    const penalty = map.calcAdjustment(wordB);
    const result = {
        a: aa,
        b: bb,
        cost: best.c + best.p + penalty,
        penalty,
        segments: [],
    };
    const segments = result.segments;
    for (let n = best; n.f; n = n.f) {
        const f = n.f;
        const a = aa.slice(f.ai, n.ai);
        const b = bb.slice(f.bi, n.bi);
        const c = n.c - f.c;
        const p = n.p - f.p;
        segments.push({ a, b, c, p });
    }
    segments.reverse();
    return result;
}
exports.distanceAStarWeightedEx = distanceAStarWeightedEx;
function _distanceAStarWeightedEx(wordA, wordB, map, cost = 100) {
    // Add ^ and $ for begin/end detection.
    const a = '^' + wordA + '$';
    const b = '^' + wordB + '$';
    const aN = a.length;
    const bN = b.length;
    const candidates = new CandidatePool(aN, bN);
    candidates.add({ ai: 0, bi: 0, c: 0, p: 0, f: undefined });
    /** Substitute / Replace */
    function opSub(n) {
        const { ai, bi, c, p } = n;
        if (ai < aN && bi < bN) {
            const cc = a[ai] === b[bi] ? c : c + cost;
            candidates.add({ ai: ai + 1, bi: bi + 1, c: cc, p, f: n });
        }
    }
    /** Insert */
    function opIns(n) {
        const { ai, bi, c, p } = n;
        if (bi < bN) {
            candidates.add({ ai: ai, bi: bi + 1, c: c + cost, p, f: n });
        }
    }
    /** Delete */
    function opDel(n) {
        const { ai, bi, c, p } = n;
        if (ai < aN) {
            candidates.add({ ai: ai + 1, bi: bi, c: c + cost, p, f: n });
        }
    }
    /** Swap adjacent letters */
    function opSwap(n) {
        const { ai, bi, c, p } = n;
        if (a[ai] === b[bi + 1] && a[ai + 1] === b[bi]) {
            candidates.add({ ai: ai + 2, bi: bi + 2, c: c + cost, p, f: n });
        }
    }
    function opMap(n) {
        const { ai, bi, c, p } = n;
        const pos = { a, b, ai, bi, c, p };
        const costCalculations = [map.calcInsDelCosts(pos), map.calcSwapCosts(pos), map.calcReplaceCosts(pos)];
        costCalculations.forEach((iter) => {
            for (const nn of iter) {
                candidates.add({ ...nn, f: n });
            }
        });
    }
    let best;
    // const bc2 = 2 * bc;
    while ((best = candidates.next())) {
        if (best.ai === aN && best.bi === bN)
            break;
        opSwap(best);
        opIns(best);
        opDel(best);
        opMap(best);
        opSub(best);
    }
    (0, assert_1.default)(best);
    return best;
}
class CandidatePool {
    constructor(aN, bN) {
        this.aN = aN;
        this.bN = bN;
        this.pool = new PairingHeap_1.PairingHeap(compare);
        this.grid = [];
    }
    next() {
        let n;
        while ((n = this.pool.dequeue())) {
            if (!n.d)
                return n;
        }
        return undefined;
    }
    add(n) {
        const i = idx(n.ai, n.bi, this.bN);
        const g = this.grid[i];
        if (!g) {
            this.grid[i] = n;
            this.pool.add(n);
            return;
        }
        // Do not add if the existing node is better.
        if (g.c <= n.c)
            return;
        // New node is better.
        g.d = true;
        this.grid[i] = n;
        this.pool.add(n);
    }
}
function idx(r, c, cols) {
    return r * cols + c;
}
function compare(a, b) {
    // lowest cost then progress
    return a.c - b.c || b.ai + b.bi - a.ai - a.bi;
}
//# sourceMappingURL=distanceAStarWeighted.js.map