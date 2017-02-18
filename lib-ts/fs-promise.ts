/**
 * Export fs as promise
 *
 * (Overloaded function may get incorrect type after Promisify.toPromiseN)
 */

import * as fs from 'fs';
import { IncomingMessage, ServerResponse } from 'http';

import { Promisify } from './util';

export const readdir = Promisify.toPromise1(fs.readdir);
export const readFile = Promisify.toPromise1(fs.readFile);
export const lstat = Promisify.toPromise1(fs.lstat);
export const stat = Promisify.toPromise1(fs.stat);
export const unlink = Promisify.toPromise1(fs.unlink);
export const mkdtemp = Promisify.toPromise1(fs.mkdtemp);
export const rmdir = Promisify.toPromise1(fs.rmdir);
// NOTE 'rename' (and POSIX 'rename' syscall) is limited to same filesystem.
export const rename = Promisify.toPromise2(fs.rename);

export function cp(oldPath: string, newPath: string) {
    return new Promise<void>((fulfill, reject) => {
        const readStream = fs.createReadStream(oldPath);
        const writeStream = fs.createWriteStream(newPath);

        readStream.on('error', reject);
        writeStream.on('error', reject);

        readStream.on('close', fulfill);
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
        if (e && e.code === 'EXDEV') {
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

// FIXME rename this file
import * as formidable from 'formidable';

export function parseForm(parser: formidable.IncomingForm, req: IncomingMessage)
    : Promise<{ fields: formidable.Fields, files: formidable.Files }> {
    return new Promise((fulfill, reject) => {
        parser.parse(req, (err, fields, files) => {
            if (err) {
                reject(err);
            } else {
                fulfill({ fields: fields, files: files });
            }
        })
    });
}