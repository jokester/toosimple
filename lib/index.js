"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const options_1 = require("./options");
const http_handler_1 = require("./http-handler");
const http = require("http");
const os = require("os");
const io_1 = require("./common/io");
const logger_1 = require("./common/util/logger");
const server_rendering_1 = require("./server-rendering");
/**
 *
 *
 * @param {ParsedOptions} opt
 * @returns {string[]} URLs that service is listening to (i.e. that can possibly be used to assess this host)
 */
function getHttpUrls(opt) {
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
                }
                else if (addr.family === IPV6) {
                    ipAddrs.push(`http://[${addr.address}]:${opt.port}/`);
                }
            }
        }
    }
    return ipAddrs;
}
function main() {
    const parser = options_1.createParser();
    const args = parser.parseArgs();
    const ctx = {
        logger: logger_1.Logger.normal,
        fs: io_1.FS,
        render: server_rendering_1.Render,
    };
    http
        .createServer(http_handler_1.createHandler(ctx, args.root))
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
            console.log("  (If you are not seeing any interfaces, please check value of -b/--bind option)");
        }
    });
}
exports.main = main;
if (require.main === module) {
    main();
}
