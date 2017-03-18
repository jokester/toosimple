/**
 * TypeScript type definition for preact-render-to-string
 * https://github.com/developit/preact-render-to-string
 */

/// <reference types="preact" />

declare namespace PreactRenderToString {

    interface RenderOption {
        // If `true`, renders nested Components as HTML elements (`<Foo a="b" />`).
        shallow?: boolean
        // If `true`, uses self-closing tags for elements without children.
        xml?: boolean
        // If `true`, adds whitespace for readability
        pretty?: boolean
    }

    export interface ModuleStatic {
        <T extends {}>(vnode: preact.VNode,
            context?: T, opts?: RenderOption,
            inner?: boolean, isSvgMode?: boolean): string
    }
}

declare module "preact-render-to-string" {
    export const render: PreactRenderToString.ModuleStatic
}