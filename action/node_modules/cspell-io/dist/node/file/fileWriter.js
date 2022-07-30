"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeToFileIterableP = exports.writeToFileIterable = exports.writeToFile = void 0;
const fs = __importStar(require("fs"));
const zlib = __importStar(require("zlib"));
const stream = __importStar(require("stream"));
function writeToFile(filename, data) {
    return writeToFileIterable(filename, [data]);
}
exports.writeToFile = writeToFile;
function writeToFileIterable(filename, data) {
    const sourceStream = stream.Readable.from(data);
    const writeStream = fs.createWriteStream(filename);
    const zip = filename.match(/\.gz$/) ? zlib.createGzip() : new stream.PassThrough();
    return sourceStream.pipe(zip).pipe(writeStream);
}
exports.writeToFileIterable = writeToFileIterable;
function writeToFileIterableP(filename, data) {
    const stream = writeToFileIterable(filename, data);
    return new Promise((resolve, reject) => {
        stream.on('finish', () => resolve());
        stream.on('error', (e) => reject(e));
    });
}
exports.writeToFileIterableP = writeToFileIterableP;
//# sourceMappingURL=fileWriter.js.map