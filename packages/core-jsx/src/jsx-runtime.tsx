/**
 * Eficy Core V3 JSX Runtime
 *
 * 直接基于 React 的 JSX runtime，不需要转换为 ViewData
 * 重点是处理含有 signals 的 props
 */

import React from "react";
import { Fragment } from "react/jsx-runtime";
import { EficyNode } from "./index";

export { Fragment };

export interface JSXProps {
	children?: any;
	[key: string]: any;
}

/**
 * jsx() 函数 - 处理 JSX 元素
 */
export function jsx(
	type: any,
	props: JSXProps = {},
	key?: string,
): React.ReactElement {
	// 对于其他类型，使用 EficyNode 包装
	return <EficyNode type={type} props={props} key={key} />;
}

/**
 * jsxs() 函数 - 处理有多个子元素的 JSX 元素
 */
export function jsxs(
	type: any,
	props: JSXProps = {},
	key?: string,
): React.ReactElement {
	return jsx(type, props, key);
}
