import * as fs from 'fs';

import { Promisify } from './util';

export const readdir = Promisify.toPromise1(fs.readdir);
export const readFile = Promisify.toPromise1(fs.readFile);
export const lstat = Promisify.toPromise1(fs.lstat);