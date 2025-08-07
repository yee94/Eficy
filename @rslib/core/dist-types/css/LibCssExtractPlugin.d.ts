import { type Rspack } from '@rsbuild/core';
type Options = Record<string, unknown>;
declare class LibCssExtractPlugin implements Rspack.RspackPluginInstance {
    readonly name: string;
    options: Options;
    constructor(options?: Options);
    apply(compiler: Rspack.Compiler): void;
}
export { LibCssExtractPlugin };
