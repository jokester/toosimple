/**
 * Types shared by frontend / backend
 */
export interface DirItem {
    name: string
    size: number
    isDir: boolean
}

/**
 *
 */
export interface IndexParam {
    title: string
    fsPath: string
    items: {
        href: string
        canDownload: boolean
        title: string
        name: string
    }[]
}