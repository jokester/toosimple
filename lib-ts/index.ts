import { createParser, ParsedOptions } from "./options";
import { createHandler } from "./http-handler";
import * as http from "http";
import * as os from "os";

import { FS, Log, Render } from './service';

/**
 *
 *
 * @param {ParsedOptions} opt
 * @returns {string[]} URLs that service is listening to (i.e. they can be used to assess this host)
 */
function getHttpUrls(opt: ParsedOptions): string[] {
    const allInterfaces = opt.bind === "::";
    const allIpV4 = allInterfaces || opt.bind === "0.0.0.0";
    const allV6 = allInterfaces;

    const ipAddrs = [];
    const nics = os.networkInterfaces();

    const IPV4 = "IPv4";
    const IPV6 = "IPv6";

    for (const nicName in nics) {
        for (const addr of nics[nicName]) {
            const shouldShow = (opt.bind === addr.address)
                || (allIpV4 && addr.family === IPV4)
                || (allV6 && addr.family === IPV6);

            if (shouldShow) {
                if (addr.family === IPV4) {
                    ipAddrs.push(`http://${addr.address}:${opt.port}/`);
                } else if (addr.family === IPV6) {
                    ipAddrs.push(`http://[${addr.address}]:${opt.port}/`)
                }
            }
        }
    }

    return ipAddrs;
}

export function main() {
    const parser = createParser();
    const args = parser.parseArgs();
    http
        .createServer(createHandler(FS.Acutal, Log.normal, Render.Actual, args.root))
        .listen(args.port, args.bind, () => {
            console.log(`toosimple: server started`);
            console.log(`  root: ${args.root}`);
            console.log(`Web UI is available at the following URLs:`);

            const addrs = getHttpUrls(args);
            let addrNo = 0;
            for (const addr of addrs) {
                console.log(`  URL #${++addrNo}: ${addr}`);
            }
            if (addrNo === 0) {
                console.log("  (If you are not seeing any interfaces, please check value of -b/--bind option)")
            }
        });
}

if (require.main === module) {
    main();
}
