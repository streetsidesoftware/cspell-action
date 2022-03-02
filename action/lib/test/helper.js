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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pollyRun = exports.fetchGithubActionFixture = exports.debugDir = exports.fixturesLocation = exports.root = exports.sourceDir = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const core_1 = require("@pollyjs/core");
const adapter_node_http_1 = __importDefault(require("@pollyjs/adapter-node-http"));
const persister_fs_1 = __importDefault(require("@pollyjs/persister-fs"));
core_1.Polly.register(adapter_node_http_1.default);
core_1.Polly.register(persister_fs_1.default);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tsconfig = require('../../tsconfig.json');
exports.sourceDir = path.resolve(path.join(__dirname, '..', '..'));
exports.root = path.resolve(path.join(exports.sourceDir, '..'));
exports.fixturesLocation = path.join(exports.sourceDir, 'fixtures');
const outputDir = path.resolve(exports.sourceDir, tsconfig.compilerOptions.outDir);
exports.debugDir = outputDir;
function fetchGithubActionFixture(filename) {
    const githubEnv = JSON.parse(fs.readFileSync(path.resolve(exports.fixturesLocation, filename), 'utf-8'));
    if (githubEnv['GITHUB_EVENT_PATH']) {
        githubEnv['GITHUB_EVENT_PATH'] = path.resolve(exports.root, githubEnv['GITHUB_EVENT_PATH']);
    }
    const env = {
        ...process.env,
        ...githubEnv,
    };
    return env;
}
exports.fetchGithubActionFixture = fetchGithubActionFixture;
function setupPolly(name, dir, options) {
    var _a;
    const polly = new core_1.Polly(name, {
        adapters: ['node-http'],
        persister: 'fs',
        persisterOptions: {
            fs: {
                recordingsDir: dir,
            },
        },
        recordIfMissing: (_a = options === null || options === void 0 ? void 0 : options.recordIfMissing) !== null && _a !== void 0 ? _a : false,
        matchRequestsBy: {
            method: true,
            headers: false,
            body: true,
            order: false,
            url: {
                protocol: true,
                username: true,
                password: true,
                hostname: true,
                port: true,
                pathname: true,
                query: true,
                hash: false,
            },
        },
    });
    const { server } = polly;
    server.any().on('beforePersist', (_req, recording) => {
        recording.request.headers = [];
    });
    return polly;
}
async function pollyRun(testFile, testName, fn, options) {
    const rel = path.relative(exports.sourceDir, testFile);
    const dir = path.resolve(exports.fixturesLocation, '__recordings__', rel);
    const poly = setupPolly(testName, dir, options);
    try {
        // console.warn('Poly Context: %o', { testFile, testName, dir });
        poly.replay();
        await fn(poly);
    }
    finally {
        poly.stop();
    }
}
exports.pollyRun = pollyRun;
