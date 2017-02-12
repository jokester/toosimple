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
export const rename = Promisify.toPromise2(fs.rename);
export const mkdtemp = Promisify.toPromise1(fs.mkdtemp);
export const rmdir = Promisify.toPromise1(fs.rmdir);

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