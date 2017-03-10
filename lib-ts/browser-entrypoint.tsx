import * as preact from 'preact';
import { DirItem } from './types';

class Greeting extends preact.Component<{}, {}> {
    render() {
        return <p>hey</p>;
    }
}

preact.render(<Greeting />, document.body);

class FileNavigator extends preact.Component<{}, {}> {
    render() {
        return <p>ho</p>
    }
}


const FileService = {
    async listDir(path: string): Promise<DirItem[]> {
        return [];
    },

    async uploadFile(file: File, destPath: string): Promise<void> {
    }
}


namespace AJAX {
    type Dict<T> = { [key: string]: T };
    type XhrDecorator = (xhr: XMLHttpRequest) => void;

    export function getJSON<T>(url: string, headers?: Dict<string>): Promise<T> {
        return getText(url, headers)
            .then(jsonStr => JSON.parse(jsonStr) as T);
    }

    const setHeaders = (headers: Dict<string>) => (xhr: XMLHttpRequest) => {
        if (headers) {
            for (const k in headers) {
                xhr.setRequestHeader(k, headers[k]);
            }
        }
    }

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
            }
        })
    }

}
