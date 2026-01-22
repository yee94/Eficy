import type { Signal } from '../types/index';

export interface BindOptions {
  valueKey?: string;
  eventKey?: string;
}

export interface BindResult {
  onChange: (eventOrValue: any) => void;
  [key: string]: any;
}

export function bind<T>(sig: Signal<T>, options?: BindOptions): BindResult {
  const valueKey = options?.valueKey ?? 'value';
  const eventKey = options?.eventKey ?? 'onChange';

  const reactiveValueKey = `${valueKey}$`;

  const handleChange = (eventOrValue: any) => {
    if (eventOrValue && typeof eventOrValue === 'object' && eventOrValue.target) {
      const target = eventOrValue.target;
      if (target.type === 'checkbox' || target.type === 'radio') {
        sig.value = target.checked as T;
      } else {
        sig.value = target.value as T;
      }
    } else {
      sig.value = eventOrValue as T;
    }
  };

  return {
    [reactiveValueKey]: sig,
    [eventKey]: handleChange,
    onChange: handleChange,
  };
}
