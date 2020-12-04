"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wait = void 0;
async function wait(milliseconds) {
    return new Promise(resolve => {
        if (isNaN(milliseconds)) {
            throw new Error('milliseconds not a number');
        }
        setTimeout(() => resolve('done!'), milliseconds);
    });
}
exports.wait = wait;
//# sourceMappingURL=wait.js.map