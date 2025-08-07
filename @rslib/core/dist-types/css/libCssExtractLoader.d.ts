import type { Rspack } from '@rsbuild/core';
import { type CssLoaderOptionsAuto } from './utils';
export interface CssExtractRspackLoaderOptions {
    publicPath?: string | ((resourcePath: string, context: string) => string);
    emit?: boolean;
    esModule?: boolean;
    layer?: string;
    defaultExport?: boolean;
    rootDir?: string;
    auto?: CssLoaderOptionsAuto;
    banner?: string;
    footer?: string;
}
declare const loader: Rspack.LoaderDefinition;
export declare const pitch: Rspack.LoaderDefinition['pitch'];
export default loader;
