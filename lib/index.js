"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var options_1 = require("./options");
var http_handler_1 = require("./http-handler");
var http = require("http");
var os = require("os");
var service_1 = require("./service");
/**
 *
 *
 * @param {ParsedOptions} opt
 * @returns {string[]} URLs that service is listening to (i.e. they can be used to assess this host)
 */
function getHttpUrls(opt) {
    var allInterfaces = opt.bind === "::";
    var allIpV4 = allInterfaces || opt.bind === "0.0.0.0";
    var allV6 = allInterfaces;
    var ipAddrs = [];
    var nics = os.networkInterfaces();
    var IPV4 = "IPv4";
    var IPV6 = "IPv6";
    for (var nicName in nics) {
        for (var _i = 0, _a = nics[nicName]; _i < _a.length; _i++) {
            var addr = _a[_i];
            var shouldShow = (opt.bind === addr.address)
                || (allIpV4 && addr.family === IPV4)
                || (allV6 && addr.family === IPV6);
            if (shouldShow) {
                if (addr.family === IPV4) {
                    ipAddrs.push("http://" + addr.address + ":" + opt.port + "/");
                }
                else if (addr.family === IPV6) {
                    ipAddrs.push("http://[" + addr.address + "]:" + opt.port + "/");
                }
            }
        }
    }
    return ipAddrs;
}
function main() {
    var parser = options_1.createParser();
    var args = parser.parseArgs();
    http
        .createServer(http_handler_1.createHandler(service_1.FS.Acutal, service_1.Log.normal, service_1.Render.Preact, args.root))
        .listen(args.port, args.bind, function () {
        console.log("toosimple: server started");
        console.log("  root: " + args.root);
        console.log("Web UI is available at the following URLs:");
        var addrs = getHttpUrls(args);
        var addrNo = 0;
        for (var _i = 0, addrs_1 = addrs; _i < addrs_1.length; _i++) {
            var addr = addrs_1[_i];
            console.log("  URL #" + ++addrNo + ": " + addr);
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
