/// <reference types="node" />

import { IncomingMessage, ServerResponse } from 'http';

interface EcstaticStatic {
    (option?: EcstaticOption): HTTPHandler
}

interface HTTPHandler {
    (req: IncomingMessage, res: ServerResponse, next?: () => void): void
}

/**
 * 
 * @see https://github.com/jfhbrook/node-ecstatic#ecstaticopts
 * 
 * @interface EcstaticOption
 */
interface EcstaticOption {
    root?: string
    port?: number
    baseDir?: string
    cache?: number
    showDir?: boolean
    showDotfiles?: boolean
    autoIndex?: boolean
    humanReadable?: boolean
    headers?: { [key: string]: string }
    si?: boolean
    defaultExt?: string
    gzip?: boolean
    serverHeader?: boolean
    contentType?: string
    mimeTypes?: string | { [type: string]: string[] }
    handleOptionsMethod?: boolean

    handleError?: boolean
    // FIXME: complete all options
}

declare const ecstatic: EcstaticStatic;

// declare module "ecstatic" {
//     export = ecstatic;
// }