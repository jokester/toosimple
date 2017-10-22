/**
 * code that will be executed from browser
 */
import * as preact from "preact";
import { DirItem, IndexParam } from "./types";

import { render } from "preact-render-to-string";

class Greeting extends preact.Component<{}, {}> {
    render() {
        return <p>hey</p>;
    }
}

preact.render(<Greeting />, document.body);


namespace AJAX {

    export async function listDir(path: string): Promise<DirItem[]> {
        return getJSON<DirItem[]>(path, { "X-toosimple-api": "listDir" });
    }

    export async function uploadFile(file: File, destPath: string): Promise<void> {
        throw "NOT IMPLEMENTED";
    }

    //////////////////////////////

    type Dict<T> = { [key: string]: T };
    type XhrDecorator = (xhr: XMLHttpRequest) => void;

    function getJSON<T>(url: string, headers?: Dict<string>): Promise<T> {
        return getText(url, headers)
            .then(jsonStr => JSON.parse(jsonStr) as T);
    }

    const setHeaders = (headers: Dict<string>) => (xhr: XMLHttpRequest) => {
        if (headers) {
            for (const k in headers) {
                xhr.setRequestHeader(k, headers[k]);
            }
        }
    };

    function getText(url: string, headers?: Dict<string>): Promise<string> {
        return request("GET", url, setHeaders(headers))
            .then(xhr => xhr.responseText);
    }

    function request(method: string, url: string, decorator: XhrDecorator): Promise<XMLHttpRequest> {
        return new Promise<XMLHttpRequest>((fulfill, reject) => {

            const xhr = new XMLHttpRequest();
            if (decorator)
                decorator(xhr);

            xhr.onerror = () => reject(xhr);
            xhr.onabort = () => reject(xhr);
            xhr.onreadystatechange = () => {
                if (xhr.status === XMLHttpRequest.DONE) {
                    if (200 <= xhr.status && xhr.status < 400) {
                        fulfill(xhr);
                    } else {
                        reject(xhr);
                    }
                }
            };
        });
    }
}

AJAX.listDir("/").then(l => console.log("AJAX.listDir", l));
