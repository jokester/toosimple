"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const argparse_1 = require("argparse");
function createParser() {
    const parser = new argparse_1.ArgumentParser({
        version: require("../package.json").version,
        addHelp: true,
        description: "toosimple: Yet another simple-http-server"
    });
    parser.addArgument(["-r", "--root"], {
        metavar: "PATH",
        defaultValue: process.cwd(),
        help: "root of files, defaults to $PWD",
        dest: "root"
    });
    parser.addArgument(["-p", "--port"], {
        metavar: "PORT",
        defaultValue: 11131,
        help: "http/https port to listen at. Defaults to 11131",
        type: parseInt,
        dest: "port",
    });
    parser.addArgument(["-b", "--bind"], {
        metavar: "IP",
        defaultValue: "::",
        help: "Network interface to listen on. Defaults to all interfaces.",
        dest: "bind",
    });
    parser.addArgument(["--verbose"], {
        defaultValue: false,
        help: "Enable verbose log, useful when debugging",
        dest: "verbose",
        action: "storeTrue"
    });
    parser.addArgument(["-u", "--allow-upload"], {
        defaultValue: false,
        help: "Allow files to be uploaded",
        dest: "allowUpload",
        action: "storeTrue"
    });
    return parser;
}
exports.createParser = createParser;
/**
 * When this file is directly executed (node / ts-node), test output of parser
 */
if (require.main === module) {
    const parser = createParser();
    const args = parser.parseArgs();
    console.log("parsed");
    console.log(args);
    console.log(JSON.stringify(args, undefined, 4));
}
