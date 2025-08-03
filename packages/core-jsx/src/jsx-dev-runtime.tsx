/**
 * Eficy Core V3 JSX Development Runtime
 */

import type { ReactElement } from "react";
import { jsx, type JSXProps } from "./jsx-runtime";

export interface JSXDevProps extends JSXProps {
	__source?: {
		fileName: string;
		lineNumber: number;
		columnNumber: number;
	};
	__self?: any;
}

/**
 * jsxDEV() 函数 - 开发模式下的 JSX 处理
 */
export function jsxDEV(
	type: any,
	props: JSXDevProps = {},
	key?: string,
	isStaticChildren?: boolean,
	source?: JSXDevProps["__source"],
	self?: any,
): ReactElement {
	// 开发模式下的额外验证
	if (process.env.NODE_ENV === "development") {
		validateProps(props, type);
	}

	return jsx(type, props, key);
}

/**
 * 开发模式下的属性验证
 */
function validateProps(props: JSXDevProps, type: any): void {
	// 检查是否有潜在的问题
	if (props && typeof props === "object") {
		const keys = Object.keys(props);

		// 检查是否有无效的属性名
		const invalidKeys = keys.filter(
			(key) => key.includes("__") && key !== "__source" && key !== "__self",
		);

		if (invalidKeys.length > 0) {
			console.warn(
				`[Eficy V3] Invalid prop keys detected in ${type}:`,
				invalidKeys,
			);
		}
	}
}

// 重新导出 runtime 函数
export { Fragment, jsx, jsxs } from "./jsx-runtime";
