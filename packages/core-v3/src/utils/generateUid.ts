import { nanoid } from 'nanoid';

export default function generateUid(pre = ''): string {
  return pre + nanoid(10);
}
