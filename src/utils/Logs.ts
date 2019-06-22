const isDev = process.env.NODE_ENV !== 'production';
// tslint:disable-next-line:no-empty
const nullFn = () => {};
export function Performance(label: string): () => void {
  if (isDev) {
    console.time(label);

    return () => console.timeEnd(label);
  } else {
    return nullFn;
  }
}
