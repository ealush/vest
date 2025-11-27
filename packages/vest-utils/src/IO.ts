// IO represents a deferred computation. Executing the function performs the effect.
export type IO<T> = () => T;
