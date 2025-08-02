import { AsyncSignalResult } from '@eficy/reactive-async';
import { useObserver } from '@eficy/reactive-react';

export const Unocss = (props: { generateCSS: AsyncSignalResult<string, any> }) => {
  const { generateCSS } = props;

  const inlineStyle = useObserver(() => generateCSS.data);
  if (!inlineStyle) {
    return null;
  }

  return <style dangerouslySetInnerHTML={{ __html: inlineStyle }} id="unocss-styles" />;
};
