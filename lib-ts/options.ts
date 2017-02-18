import { ArgumentParser } from "argparse";

// TODO add an option to disable uploading
// TODO add an option to prevent file overwriting
export interface ParsedOptions {
    root: string;
    port: number;
    /**
     * NOTE listening to "::" will use 0.0.0.0 as well
     * This behavior is referred to as "dual stack mode"
     * @see https://github.com/nodejs/node/issues/7200
     */
    bind: string;
}

export function createParser() {
    const parser = new ArgumentParser({
        version: require("../package.json").version,
        addHelp: true,
        description: "toosimple: Yet another simple-http-server"
    });

    parser.addArgument(
        ["-r", "--root"],
        {
            metavar: "PATH",
            defaultValue: process.cwd(),
            help: "root of files, defaults to $PWD",
            dest: "root"
        }
    );

    parser.addArgument(
        ["-p", "--port"],
        {
            metavar: "PORT",
            defaultValue: 11131,
            help: "http/https port to listen at. Defaults to 11131",
            type: parseInt,
            dest: "port",
        }
    );

    parser.addArgument(
        ["-b", "--bind"],
        {
            metavar: "IP",
            defaultValue: "::",
            help: "Network interface to listen on. Defaults to all interfaces.",
            dest: "bind",
            // action: "append",
        }
    );

    return parser as {
        parseArgs(): ParsedOptions
    };
}

/**
 * Run this file with node / ts-node to test output of parser
 */
if (require.main === module) {
    const parser = createParser();
    const args = parser.parseArgs();
    console.log("parsed");
    console.log(args);
    console.log(JSON.stringify(args));
}
