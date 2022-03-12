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
exports.readFileSync = exports.readFile = void 0;
// cSpell:ignore curr
// cSpell:words zlib iconv
const fs = __importStar(require("fs"));
const zlib = __importStar(require("zlib"));
const defaultEncoding = 'utf8';
function readFile(filename, encoding = defaultEncoding) {
    return new Promise((resolve, reject) => {
        const data = [];
        const stream = prepareFileStream(filename, encoding, reject);
        let resolved = false;
        function complete() {
            resolve(data.join(''));
            resolved = resolved || (resolve(data.join('')), true);
        }
        stream.on('error', reject);
        stream.on('data', (d) => data.push(d));
        stream.on('close', complete);
        stream.on('end', complete);
    });
}
exports.readFile = readFile;
const isZipped = /\.gz$/i;
function prepareFileStream(filename, encoding, fnError) {
    const pipes = [];
    if (isZipped.test(filename)) {
        pipes.push(zlib.createGunzip());
    }
    const fileStream = fs.createReadStream(filename);
    fileStream.on('error', fnError);
    const stream = pipes.reduce((s, p) => s.pipe(p).on('error', fnError), fileStream);
    stream.setEncoding(encoding);
    return stream;
}
function readFileSync(filename, encoding = defaultEncoding) {
    const rawData = fs.readFileSync(filename);
    const data = isZipped.test(filename) ? zlib.gunzipSync(rawData) : rawData;
    return data.toString(encoding);
}
exports.readFileSync = readFileSync;
//# sourceMappingURL=fileReader.js.map