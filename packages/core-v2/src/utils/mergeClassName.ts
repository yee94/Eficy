import { transformHump } from './common';

export default function mergeClassName(...classNameStrs: string[]) {
  return transformHump(classNameStrs.join(' '))
    .trim()
    .replace(/ {2,}/, ' ');
}
