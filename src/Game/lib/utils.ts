export function and<
  T extends any[],
  U extends ((...args: [...T]) => boolean)[]
>(...fns: [...U]) {
  return (...args: [...T]) => fns.every((fn) => fn(...args));
}

export function not<T extends any[]>(fn: (...args: [...T]) => boolean) {
  return (...args: [...T]) => !fn(...args);
}
