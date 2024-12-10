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
exports.parseArgs = parseArgs;
exports.default = main;
const node_child_process_1 = require("node:child_process");
const path = __importStar(require("node:path"));
const minimist_1 = __importDefault(require("minimist"));
const { version: VERSION } = require('../package.json');
const USAGE = `Usage: fireball COMMAND

Commands:
  up                       stand up Jaeger
  down                     tear down Jaeger

Options:
  -h, --help               print fireball command line options
  -d, --detach             detach after standing up Jaeger
  -v, --version            print fireball version
`;
function help() {
    console.log(USAGE);
    process.exit(0);
}
function version() {
    console.log(`v${VERSION}`);
    process.exit(0);
}
function usage(message) {
    console.error(message + '\n');
    console.error(USAGE);
    process.exit(70);
}
function error(err, code = 1) {
    console.error(err);
    process.exit(code);
}
function parseArgs(argv) {
    const args = (0, minimist_1.default)(argv, {
        alias: {
            h: 'help',
            v: 'version',
            d: 'detach',
        },
        boolean: ['help', 'version', 'detach'],
        unknown(opt) {
            if (opt.startsWith('-')) {
                usage(`Unknown option: ${opt}`);
                return false;
            }
            return true;
        },
    });
    if (args.help) {
        help();
    }
    if (args.version) {
        version();
    }
    if (args._.length < 1) {
        help();
    }
    if (args._.length > 1) {
        usage(`Unexpected argument: ${args._[1]}`);
    }
    const command = args._[0];
    return { command, detach: args.detach || false };
}
function run(command) {
    const { status } = (0, node_child_process_1.spawnSync)('terraform', [
        `-chdir=${path.join(__dirname, '..', 'modules', 'fireball')}`,
        command,
        '-auto-approve',
    ], { stdio: 'inherit' });
    if (status) {
        error('', status);
    }
}
function getName() {
    const { status, stdout } = (0, node_child_process_1.spawnSync)('terraform', [
        `-chdir=${path.join(__dirname, '..', 'modules', 'fireball')}`,
        'output',
        '-raw',
        'name',
    ], { stdio: ['inherit', 'pipe', 'inherit'], encoding: 'utf8' });
    if (status) {
        error('', status);
    }
    return stdout;
}
function tail(name) {
    const child = (0, node_child_process_1.spawn)('docker', ['logs', '-f', '--tail', '10', name], {
        stdio: ['inherit', 'inherit', 'inherit'],
    });
    child.on('exit', (status) => {
        if (status) {
            error('', status);
        }
    });
}
async function main(argv = process.argv.slice(2)) {
    const { command, detach } = parseArgs(argv);
    switch (command) {
        case 'up':
            run('apply');
            if (!detach) {
                process.once('SIGINT', () => {
                    run('destroy');
                    process.exit(0);
                });
                tail(getName());
            }
            break;
        case 'down':
            run('destroy');
            break;
        default:
            error(`Unknown command: ${command}`);
    }
}
//# sourceMappingURL=index.js.map