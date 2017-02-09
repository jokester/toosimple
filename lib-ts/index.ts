import { createParser } from './options';
import { createHandler } from './http-handler';
import * as http from 'http';

if (require.main === module) {
    const parser = createParser();
    const args = parser.parseArgs();
    http
        .createServer(createHandler(args.root))
        .listen(args.port, args.bind, () => {
            console.log(`listening with options: ${JSON.stringify(args)}`);
        });
}