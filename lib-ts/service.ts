/**
 * Services that does actual stuff
 */
import { Promisify } from './util';
import * as fs from "fs";
import * as path from "path";
import * as ejs from "ejs";

import { IncomingMessage, ServerResponse } from "http";
import { DirItem } from './types';

export namespace AbstractService {
    export type FS = FS.AbstractFS
    export type Log = Log.AbstractLogger
    export type Render = Render.AbstractRender
}

export namespace Render {
    export interface AbstractRender {
        /**
         *
         *
         * @param {string} template
         * @param {string} fsPath The dir that is being shown
         * @param {string} fsRoot The root dir that toosimple hosts
         * @param {DirItem[]} items
         * @returns {Promise<string>}
         *
         * @memberOf AbstractRender
         */
        dirIndex(template: string, fsPath: string, fsRoot: string, items: DirItem[]): Promise<string>
    }

    interface TemplateVar {
        title: string
        urlPath: string
        items: {
            href: string
            canDownload: boolean
            title: string
            name: string
        }[]
    }

    namespace $Impl {
        export async function dirIndex(template: string, fsPath: string, fsRoot: string, items: DirItem[]) {
            const relPath = path.relative(fsRoot, fsPath);
            if (relPath.startsWith('..')) {
                throw new Error(`${fsPath} is outside ${fsRoot}`);
            }

            if (relPath) {
                // when fsPath !== fsRoot, add a link to ..
                items = [{
                    name: "..",
                    size: -1,
                    isDir: true
                }].concat(items);
            }

            const interpolate: TemplateVar = {
                title: `${relPath}/`,
                urlPath: fsPath,
                items: items.map(i => {
                    const name = i.isDir ? `${i.name}/` : i.name;
                    return {
                        href: name,
                        canDownload: !i.isDir,
                        title: name,
                        name: name,
                    }
                }),
            }
            return ejs.render(template, interpolate);
        }
    }

    export const Actual: AbstractRender = $Impl
}

export namespace FS {

    export interface AbstractFS {
        cp(oldPath: string, newPath: string): Promise<void>
        mv(oldPath: string, newPath: string): Promise<void>
        readDir(path: string | Buffer): Promise<string[]>
        readFile(filename: string): Promise<Buffer>
        readText(filename: string,
            options: { encoding: string; flag?: string; }): Promise<string>
        lstat(path: string | Buffer): Promise<fs.Stats>
        stat(path: string | Buffer): Promise<fs.Stats>
        unlink(path: string | Buffer): Promise<void>
        mkdtemp(prefix: string): Promise<string>
        rmdir(path: string | Buffer): Promise<void>
        rename(oldPath: string, newPath: string): Promise<void>
        readDirDetail(path: string): Promise<DirItem[]>
    }

    namespace $Impl {
        export function cp(oldPath: string, newPath: string) {
            return new Promise<void>((fulfill, reject) => {
                const readStream = fs.createReadStream(oldPath);
                const writeStream = fs.createWriteStream(newPath);

                readStream.on("error", reject);
                writeStream.on("error", reject);

                readStream.on("close", fulfill);
                readStream.pipe(writeStream);
            });
        }

        /**
         * mv: use POSIX rename first, and fallback to (cp + unlink)
         *
         * @export
         * @param {string} oldPath
         * @param {string} newPath
         */
        export async function mv(oldPath: string, newPath: string) {
            try {
                await rename(oldPath, newPath);
            } catch (e) {
                if (e && e.code === "EXDEV") {
                    /**
                     * on "EXDEV: cross-device link not permitted" error
                     * fallback to cp + unlink
                     */
                    await cp(oldPath, newPath);
                    await unlink(oldPath);
                } else {
                    throw e;
                }
            }
        }

        export const readDir = Promisify.toPromise1(fs.readdir);
        export const readFile = Promisify.toPromise1(fs.readFile);
        export const readText = Promisify
            .toPromise2<string, { encoding: string; flag?: string; }, string>(fs.readFile);

        export const lstat = Promisify.toPromise1(fs.lstat);
        export const stat = Promisify.toPromise1(fs.stat);
        export const unlink = Promisify.toPromise1v(fs.unlink);
        export const mkdtemp = Promisify.toPromise1(fs.mkdtemp);
        export const rmdir = Promisify.toPromise1v(fs.rmdir);
        // NOTE 'rename' (and POSIX 'rename' syscall) is limited to same filesystem.
        export const rename = Promisify.toPromise2v(fs.rename);

        /**
         * 
         * 
         * @export
         * @param {string} dirName
         * @returns {Promise<DirItem[]>} (name + isDir + size) of entries
         */
        export async function readDirDetail(dirName: string): Promise<DirItem[]> {
            const s = await stat(dirName);
            if (!s.isDirectory()) {
                throw new Error(`expect directory at '${dirName}'`);
            }

            const childNames = await readDir(dirName);
            const children = childNames.map(async name => {
                const fullPath = path.join(dirName, name);
                const childS = await stat(fullPath);
                const childItem: DirItem = {
                    name: name,
                    isDir: childS.isDirectory(),
                    size: childS.isDirectory() ? NaN : childS.size
                };
                return childItem;
            });

            return Promise.all(children);
        }
    }

    /**
     * export it as FileSystemService, so that arguments can have correct name
     */
    export const Acutal: AbstractFS = $Impl;
}

export namespace Log {
    export interface AbstractLogger {
        debug(...param: any[]): void
        info(...param: any[]): void
        warn(...param: any[]): void
        error(...param: any[]): void
    }

    /**
     *
     * @param verbosity
     */
    function createLogger(verbosity: number): AbstractLogger {
        return {
            // lvl3
            debug(...param: any[]) {
                if (verbosity >= 3) {
                    console.debug.apply(console, param);
                }
            },
            // lvl2
            info(...param: any[]) {
                if (verbosity >= 2) {
                    console.info.apply(console, param)
                }
            },
            // lvl1
            warn(...param: any[]) {
                if (verbosity >= 1) {
                    console.info.apply(console, param)
                }
            },
            // lvl0
            error(...param: any[]) {
                if (verbosity >= 0) {
                    console.info.apply(console, param)
                }
            },
        }
    }

    export const debug = createLogger(3);

    export const normal = createLogger(2);

    export const quiet = createLogger(1);

    export const dead = createLogger(0);
}
