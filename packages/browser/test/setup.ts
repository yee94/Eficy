/**
 * @eficy/browser Test Setup
 */

import 'reflect-metadata';
import '@testing-library/jest-dom';

// 设置全局变量
global.EficyBrowser = global.EficyBrowser || {};

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock import
global.import = vi.fn(); 