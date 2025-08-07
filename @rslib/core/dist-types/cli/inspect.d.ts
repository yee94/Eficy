import { type RsbuildInstance } from '@rsbuild/core';
import type { RslibConfig } from '../types/config';
import type { InspectOptions } from './commands';
export declare function inspect(config: RslibConfig, options?: Pick<InspectOptions, 'lib' | 'mode' | 'output' | 'verbose'>): Promise<RsbuildInstance>;
