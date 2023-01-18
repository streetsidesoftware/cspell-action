"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.walker = void 0;
const walkerTypes_1 = require("./walkerTypes");
/**
 * Walks the Trie and yields a value at each node.
 * next(goDeeper: boolean):
 */
function* walker(root, compoundingMethod = walkerTypes_1.CompoundWordsMethod.NONE) {
    const roots = {
        [walkerTypes_1.CompoundWordsMethod.NONE]: [],
        [walkerTypes_1.CompoundWordsMethod.JOIN_WORDS]: [[walkerTypes_1.JOIN_SEPARATOR, root]],
        [walkerTypes_1.CompoundWordsMethod.SEPARATE_WORDS]: [[walkerTypes_1.WORD_SEPARATOR, root]],
    };
    function* children(n) {
        if (n.c) {
            yield* n.c;
        }
        if (n.f) {
            yield* roots[compoundingMethod];
        }
    }
    let depth = 0;
    const stack = [];
    stack[depth] = { t: '', c: children(root) };
    let ir;
    while (depth >= 0) {
        let baseText = stack[depth].t;
        while (!(ir = stack[depth].c.next()).done) {
            const [char, node] = ir.value;
            const text = baseText + char;
            const goDeeper = yield { text, node, depth };
            if (goDeeper || goDeeper === undefined) {
                depth++;
                baseText = text;
                stack[depth] = { t: text, c: children(node) };
            }
        }
        depth -= 1;
    }
}
exports.walker = walker;
//# sourceMappingURL=walker.js.map