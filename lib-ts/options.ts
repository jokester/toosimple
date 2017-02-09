import { ArgumentParser } from 'argparse';


interface ParsedOptions {
    root: string;
    port: number;
    bind: string;
}

export function createParser() {
    const parser = new ArgumentParser({
        version: '0.1.0',
        addHelp: true,
        description: 'toosimple: Yet another simple-http-server'
    });

    parser.addArgument(
        ['-r', '--root'],
        {
            metavar: "PATH",
            defaultValue: process.cwd(),
            help: 'root of files, defaults to $PWD',
            dest: "root"
        }
    );

    parser.addArgument(
        ['-p', '--port'],
        {
            metavar: "PORT",
            defaultValue: 11131,
            help: "http/https port to listen at. Defaults to 11131",
            type: parseInt,
            dest: "port",
        }
    );

    parser.addArgument(
        ['-b', '--bind'],
        {
            metavar: "IP",
            defaultValue: "0.0.0.0",
            help: "Network interface to serve on. Defaults to 0.0.0.0 / all interfaces.",
            dest: "bind",
            // action: "append",
        }
    )

    return parser as {
        parseArgs(): ParsedOptions
    };
}

function parseOptions(argv: string[]): Readonly<ParsedOptions> {
    return null;
}

/**
 * Run this file with node / ts-node to test output of parser
 */
if (require.main === module) {
    const parser = createParser();
    const args = parser.parseArgs();
    console.log('parsed');
    console.log(args);
    console.log(JSON.stringify(args));
}