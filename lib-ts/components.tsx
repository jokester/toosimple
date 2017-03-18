import * as preact from 'preact';

interface DirItemProps {
    item: {
        href: string
        canDownload: boolean
        title: string
        name: string
    }
}

export class DirItem extends preact.Component<DirItemProps, {}> {
    render() {
        const item = this.props.item;
        return (
            <li>
                <a download={item.canDownload} href={item.href}
                    title={item.name}>{item.name}</a>
            </li>
        );
    }
}

interface FileListProps {
    items: {
        href: string
        canDownload: boolean
        title: string
        name: string
    }[]
}

export class FileList extends preact.Component<FileListProps, {}> {
    render() {
        const props = this.props;
        return (
            <ul>
                {this.props.items.map((item, k) => <DirItem item={item} key={k} />)}
            </ul>
        )
    }
}

class FileNavigator extends preact.Component<{}, {}> {
    render() {
        return <p>ho</p>
    }
}
