import debounce from 'debounce';
import { useCallback } from 'react';

export function useDebounceCb<T>(cb: (arg: T) => void, delay: number) {
  return useCallback(debounce(cb, delay), [cb, delay]);
}
