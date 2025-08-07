import type { Format, PkgJson } from '../types';
export declare const getDefaultExtension: (options: {
    format: Format;
    pkgJson?: PkgJson;
    autoExtension: boolean;
}) => {
    jsExtension: string;
    dtsExtension: string;
    isModule?: boolean;
};
