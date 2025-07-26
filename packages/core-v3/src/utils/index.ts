// 基础工具函数
export const isFunction = (value: any): value is (...args: any[]) => any => typeof value === 'function'
export const isObject = (value: any): value is object => value !== null && typeof value === 'object'
export const isArray = (value: any): value is any[] => Array.isArray(value)
// export { default as renderHelper } from './renderHelper';
export { default as generateUid } from './generateUid';
export { default as mergeClassName } from './mergeClassName';
export { default as isEficyView } from './isEficyView';
export { default as forEachDeep } from './forEachDeep';
export { default as mapDeep } from './mapDeep';
export { default as relaceVariable } from './relaceVariable';
export { default as isEficyAction } from './isEficyAction';
export { default as loadComponentModels } from './loadComponentModels';
export { default as eficyWrap } from './eficyWrap';
export * from './common';
// export * from './decorators';
import * as _Logs from './Logs';
export const Logs = _Logs;
