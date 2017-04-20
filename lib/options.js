"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var argparse_1 = require("argparse");
function createParser() {
    var parser = new argparse_1.ArgumentParser({
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
    return parser;
}
exports.createParser = createParser;
/**
 * Run this file with node / ts-node to test output of parser
 */
if (require.main === module) {
    var parser = createParser();
    var args = parser.parseArgs();
    console.log("parsed");
    console.log(args);
    console.log(JSON.stringify(args));
}
