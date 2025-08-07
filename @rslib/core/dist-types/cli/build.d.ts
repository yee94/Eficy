import { type RsbuildInstance } from '@rsbuild/core';
import type { RslibConfig } from '../types/config';
import type { BuildOptions } from './commands';
export declare function build(config: RslibConfig, options?: Pick<BuildOptions, 'lib' | 'watch' | 'root'>): Promise<RsbuildInstance>;
