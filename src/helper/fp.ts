// T => any
type FnT2Any<T> = (value: T) => any

// T => T
type FnT2T<T> = (value: T) => T

// T => Promise<T>
type FnT2PromiseT<T> = (value: T) => Promise<T>

// T => Promise<any>
type FnT2PromiseAny<T> = (value: T) => Promise<any>

/**
 * runs fn (as a side effect), then returns value.
 * @param fn: T => any
 * @return a function: T => T,
 *         that takes a value, calls fn(value), then returns value.
 *         similar to _.tap.
 */
export const tap = <T>(fn: FnT2Any<T>): FnT2T<T> => (value: T): T => {
  fn(value)
  return value
}

/**
 * runs fn (as a side effect) and waits for it to complete, then returns value.
 * @param fn: T => Promise<any>
 * @return a function: T => Promise<T>
 *         value => Promise w/ value
 */
export const tapWait = <T>(fn: FnT2PromiseAny<T>): FnT2PromiseT<T> => (value: T): Promise<T> => {
  return Promise.resolve(fn(value))
    .then(() => value)
}

/**
 * pauses, then returns the value
 * @param pause_ms: milliseconds
 * @return fn: T => Promise<T>
 */
export const pause = <T>(pause_ms: number): FnT2PromiseT<T> => (value: T): Promise<T> => {
  return new Promise((resolve) => setTimeout(() => resolve(value), pause_ms))
}
