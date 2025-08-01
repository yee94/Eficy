import { Computed, Observable } from '@eficy/reactive';
import { Fragment, type ComponentType } from 'react';
import { injectable } from 'tsyringe';
import type { IComponentRegistry } from '../interfaces';

// 常用的HTML标签
const HTML_TAGS = [
  'div',
  'span',
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'button',
  'input',
  'textarea',
  'select',
  'option',
  'ul',
  'ol',
  'li',
  'dl',
  'dt',
  'dd',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'form',
  'label',
  'fieldset',
  'legend',
  'a',
  'img',
  'video',
  'audio',
  'canvas',
  'section',
  'article',
  'aside',
  'header',
  'footer',
  'nav',
  'main',
  'strong',
  'em',
  'small',
  'code',
  'pre',
  'blockquote',
  'hr',
  'br',
];

@injectable()
export default class ComponentRegistry implements IComponentRegistry {
  @Observable
  private components: Record<string, ComponentType<any> | string> = {};

  constructor() {
    // 自动注册HTML标签
    this.registerHtmlTags();

    this.register('Fragment', Fragment);
    this.register('<>', Fragment);
  }

  private registerHtmlTags(): void {
    HTML_TAGS.forEach((tag) => {
      this.components[tag] = tag;
    });
  }

  register(name: string, component: ComponentType<any> | string): void {
    this.components[name] = component;
  }

  unregister(name: string): void {
    delete this.components[name];
  }

  get(name: string): ComponentType<any> | string | null {
    return this.components[name] || null;
  }

  @Computed
  getAll(): Record<string, ComponentType<any> | string> {
    return { ...this.components };
  }

  extend(componentMap: Record<string, ComponentType<any> | string>): void {
    Object.assign(this.components, componentMap);
  }
}
