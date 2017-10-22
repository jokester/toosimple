/**
 * Components for server rendering
 */
import * as preact from "preact";
import * as path from "path";
import { DirItem, IndexParam } from "../types";
import { render } from "preact-render-to-string";
import { DirList } from "../components";

/**
 *
 * Renderer: functions to render html at server side
 *
 * @export
 * @interface Renderer
 */
export interface Renderer {
    /**
     * @param {string} fsPath The dir that is being shown
     * @param {string} fsRoot The root dir that toosimple hosts
     * @param {DirItem[]} items
     * @returns {Promise<string>} a html string
     *
     */
    dirIndex(fsPath: string, fsRoot: string, items: DirItem[]): string;
}

export const defaultRenderer: Readonly<Renderer> = {
    dirIndex: function (fsPath: string, fsRoot: string, items: DirItem[]) {
        /* FIXME: the functionality of 'add ..' should be moved to somewhere else */
        const relPath = path.relative(fsRoot, fsPath);
        if (relPath.startsWith("..")) {
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

        return renderIndex({
            title: `${path.relative(fsRoot, fsPath)}/`,
            fsPath: fsPath,
            items: items.map(i => {
                const name = i.isDir ? `${i.name}/` : i.name;
                return {
                    href: name,
                    canDownload: !i.isDir,
                    title: name,
                    name: name,
                };
            })
        });
    }
};

type IndexPageProps = IndexParam;

function IndexPage(props: IndexParam) {
    return (
        <body class="hack dark-grey">
            <div class="main container grid">
                <div id="file-list" class="cell -8of12">
                    <h1>Files</h1>
                    <h3>{props.fsPath}</h3>
                    <DirList items={props.items} />
                </div>

                <div id="upload-box" class="cell -4of12">
                    <h1>Upload</h1>
                    <form method="POST" encType="multipart/form-data">
                        <p>
                            <input type="file" name="file1" multiple />
                        </p>
                        <input type="submit" value="Upload" />
                    </form>
                </div>

            </div>

            <div id="footer">
                <h6>Powered by <a href="https://github.com/jokester/toosimple">jokester/toosimple</a>
                </h6>
            </div>
        </body>
    );
}

function renderIndex(props: IndexPageProps) {
    const index = <IndexPage {...props} />;
    return [
        `<!DOCTYPE html>
<html lang="en-US">`,
        head(props.title),
        render(index, null, { pretty: false }),
        `</html>`
    ].join("");
}

function head(title: string) {
    return [
        `<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />`,

        render(<title>{title}</title>),

        `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/hack/0.7.7/hack.css" integrity="sha256-c/3noOgwbDGzfWfBnqwqAi9yTPr11DTSZlQJ5grjOB0="
        crossorigin="anonymous" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/hack/0.7.7/dark-grey.css" integrity="sha256-B9oAyfCZFHDKM9Bw4VeYLURNKjAnpdAXRxYglycpmxY="
        crossorigin="anonymous" />

<style type="text/css">

    #file-list > h1, #upload-box > h1 {
        display: block;
    }

    #file-list,
    #upload-box,
    #footer {
        padding: 4px;
    }

    #footer {
        display: none;
    }

    @media screen and (min-width:768px) {
        #footer {
            display: inline-block;
            position: fixed;
            right: 0px;
            bottom: 0px;
        }
    }
</style>
</head>`

    ].join("");
}
