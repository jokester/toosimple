/**
 * Components for server rendering
 */
import * as preact from 'preact';
import { DirItem, IndexParam } from './types';
import { render } from 'preact-render-to-string'
import { FileList } from './components';

type IndexPageProps = IndexParam

class IndexPage extends preact.Component<IndexPageProps, {}> {
    render(props: IndexPageProps) {
        return (
            <body class="hack dark-grey">
                <div class="main container grid">
                    <div id="file-list" class="cell -8of12">
                        <h1>Files</h1>
                        <h3>{props.fsPath}</h3>
                        <FileList items={props.items} />
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
}

export function renderIndex(props: IndexPageProps) {
    const index = <IndexPage {...props} />
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
