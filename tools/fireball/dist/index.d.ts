export interface Args {
    command: string;
    detach: boolean;
}
export declare function parseArgs(argv: typeof process.argv): Args;
export default function main(argv?: typeof process.argv): Promise<void>;
