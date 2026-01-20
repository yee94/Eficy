import type { Signal } from '../types/index';

export interface BindOptions {
  valueKey?: string;
  eventKey?: string;
}

export interface BindResult<T> {
  value: T;
  onChange: (eventOrValue: any) => void;
}

export function bind<T>(sig: Signal<T>, options?: BindOptions): BindResult<T> & Record<string, any> {
  const valueKey = options?.valueKey ?? 'value';
  const eventKey = options?.eventKey ?? 'onChange';

  const handleChange = (eventOrValue: any) => {
    if (eventOrValue && typeof eventOrValue === 'object' && eventOrValue.target) {
      const target = eventOrValue.target;
      if (target.type === 'checkbox' || target.type === 'radio') {
        sig.set(target.checked as T);
      } else {
        sig.set(target.value as T);
      }
    } else {
      sig.set(eventOrValue as T);
    }
  };

  const result: Record<string, any> = {};
  result[valueKey] = sig();
  result[eventKey] = handleChange;

  return result as BindResult<T> & Record<string, any>;
}
