export type Resolve = () => void;

export type Process<T> = () => T | PromiseLike<T>;

export type ResourceProcess<R, T> = (resource: T) => R | PromiseLike<R>;

export type Unselect = () => void;
