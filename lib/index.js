"use strict";
const options_1 = require("./options");
const http_handler_1 = require("./http-handler");
const http = require("http");
function main() {
    const parser = options_1.createParser();
    const args = parser.parseArgs();
    http
        .createServer(http_handler_1.createHandler(args.root))
        .listen(args.port, args.bind, () => {
        console.log(`listening with options: ${JSON.stringify(args)}`);
    });
}
exports.main = main;
if (require.main === module) {
    main();
}
//# sourceMappingURL=index.js.map