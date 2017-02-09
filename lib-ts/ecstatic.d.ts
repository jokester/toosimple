
interface Static {
    (option?: EcstaticOption): HTTPHandler
}

// FIXME fix
interface HTTPHandler {
    (req: any, res: any, next?: Function): void
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

declare const ecstatic: Static;

declare module "ecstatic" {


    export = ecstatic;
}