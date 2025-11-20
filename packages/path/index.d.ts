interface Host {
    platform: string;
    cwd: () => string;
    env: Record<string, string | undefined>;
}
interface PathObject {
    dir?: string;
    root?: string;
    base?: string;
    name?: string;
    ext?: string;
}
interface PathTool {
    resolve: (...args: string[]) => string;
    normalize: (path: string) => string;
    isAbsolute: (path: string) => boolean;
    join: (...args: string[]) => string;
    relative: (from: string, to: string) => string;
    toNamespacedPath: (path: string) => string;
    dirname: (path: string) => string;
    basename: (path: string, suffix?: string) => string;
    extname: (path: string) => string;
    format: (sep: string, pathObject: PathObject) => string;
    parse: (path: string) => PathObject;
    sep: string;
    delimiter: string;
}
export declare function win32PathTool(host: Host): PathTool;
export declare function posixPathTool(host: Host): PathTool;
export default function pathTool(host: Host): PathTool;
export {};
