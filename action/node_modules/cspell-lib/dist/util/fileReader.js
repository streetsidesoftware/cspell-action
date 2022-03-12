"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readLinesSync = exports.readLines = void 0;
const cspell_io_1 = require("cspell-io");
const iterableIteratorLib_1 = require("./iterableIteratorLib");
async function readLines(filename, encoding = 'utf8') {
    try {
        const content = await (0, cspell_io_1.readFile)(filename, encoding);
        return (0, iterableIteratorLib_1.toIterableIterator)(content.split(/\r?\n/g));
    }
    catch (e) {
        return Promise.reject(e);
    }
}
exports.readLines = readLines;
function readLinesSync(filename, encoding = 'utf8') {
    const content = (0, cspell_io_1.readFileSync)(filename, encoding);
    return content.split(/\r?\n/g);
}
exports.readLinesSync = readLinesSync;
//# sourceMappingURL=fileReader.js.map