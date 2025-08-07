import type { RslibConfig } from '../types';
import type { CommonOptions } from './commands';
export declare function init(options: CommonOptions): Promise<{
    config: RslibConfig;
    configFilePath: string;
    watchFiles: string[];
}>;
