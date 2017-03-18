/**
 * Components for server rendering
 */
import * as preact from 'preact';
import { DirItem } from './types';
import { render } from 'preact-render-to-string'
import { FileList } from './components';

interface IndexPageProps {
    title: string
    urlPath: string
    items: {
        href: string
        canDownload: boolean
        title: string
        name: string
    }[]
}

export function renderIndex(props: IndexPageProps) {
    const index = <FileList items={props.items} />
    return render(index);
}