import type { EnvironmentConfig } from '@rsbuild/core';
import { type CssLoaderOptionsAuto } from './utils';
export declare const RSLIB_CSS_ENTRY_FLAG = "__rslib_css__";
type ExternalCallback = (arg0?: undefined, arg1?: string) => void;
export declare function cssExternalHandler(request: string, callback: ExternalCallback, jsExtension: string, auto: CssLoaderOptionsAuto, styleRedirectPath: boolean, styleRedirectExtension: boolean, redirectedPath: string | undefined, issuer: string): Promise<false | void>;
export declare const composeCssConfig: (rootDir: string | null, auto: CssLoaderOptionsAuto, bundle?: boolean, banner?: string, footer?: string) => EnvironmentConfig;
export {};
