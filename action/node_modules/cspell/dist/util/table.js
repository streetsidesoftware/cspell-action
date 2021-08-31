"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decorateRowWith = exports.tableToLines = void 0;
const strip_ansi_1 = __importDefault(require("strip-ansi"));
const chalk_1 = __importDefault(require("chalk"));
function tableToLines(table, deliminator) {
    deliminator = deliminator || table.deliminator || ' | ';
    const columnWidths = [];
    const { header, rows } = table;
    function recordWidths(row) {
        row.forEach((col, idx) => {
            columnWidths[idx] = Math.max((0, strip_ansi_1.default)(col).length, columnWidths[idx] || 0);
        });
    }
    function justifyRow(c, i) {
        return c + ' '.repeat(columnWidths[i] - (0, strip_ansi_1.default)(c).length);
    }
    function toLine(row) {
        return decorateRowWith(row, justifyRow).join(deliminator);
    }
    function* process() {
        yield toLine(decorateRowWith(header, headerDecorator));
        yield* rows.map(toLine);
    }
    recordWidths(header);
    rows.forEach(recordWidths);
    return [...process()];
}
exports.tableToLines = tableToLines;
function headerDecorator(t) {
    return chalk_1.default.bold(chalk_1.default.underline(t));
}
function decorateRowWith(row, ...decorators) {
    return decorators.reduce((row, decorator) => row.map(decorator), row);
}
exports.decorateRowWith = decorateRowWith;
//# sourceMappingURL=table.js.map