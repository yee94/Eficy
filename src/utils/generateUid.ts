import generate from 'nanoid/generate';

export default function generateUid(pre = ''): string {
  return pre + generate('1234567890abcdefgher', 10);
}
