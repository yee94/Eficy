export default function isEficyAction(schema: any) {
  return typeof schema.action === 'string';
}
