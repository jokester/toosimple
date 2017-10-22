import * as preact from "preact";

interface DirItemProps {
    key: number;
    item: {
        href: string
        canDownload: boolean
        title: string
        name: string
    };
}

function DirItem(props: DirItemProps): JSX.Element {
    const item = props.item;
    return (
        <li key={String(props.key)}>
            <a download={item.canDownload} href={item.href}
                title={item.name}>{item.name}</a>
        </li>
    );
}

interface DirListProps {
    items: DirItemProps["item"][];
}

export function DirList(props: DirListProps): JSX.Element {
    return (
        <ul>
            {props.items.map((item, k) => <DirItem item={item} key={k} />)}
        </ul>
    );
}
