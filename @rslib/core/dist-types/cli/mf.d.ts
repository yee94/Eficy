import type { RsbuildInstance } from '@rsbuild/core';
import type { RslibConfig } from '../types';
import type { CommonOptions } from './commands';
export declare function startMFDevServer(config: RslibConfig, options?: Pick<CommonOptions, 'lib'>): Promise<RsbuildInstance | undefined>;
