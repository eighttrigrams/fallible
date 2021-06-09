import {Either, Maybe, isArray} from 'tsfun'


/**
 * tsfun | liftM
 *
 * Examples:
 *
 * https://github.com/danielmarreirosdeoliveira/tsfun/blob/master/test/tuple/lift_m.spec.ts
 */
export function liftM<T, R>(f: (x: T) => R): (x: T) => Maybe<R>
export function liftM<T, R>(f: (...x: T[]) => R): (...x: T[]) => Maybe<R>
export function liftM<T,R>(f: (x: T) => R) {

    return (...x: T[]): Maybe<R> => {

        try {
            return [isArray(x) ? (f as any)(...x) : (f as any)(x)]
        } catch {
            return []
        }
    }
}


/**
 * tsfun | liftE
 *
 * Examples:
 *
 * https://github.com/danielmarreirosdeoliveira/tsfun/blob/master/test/tuple/lift_e.spec.ts
 */
export function liftE<T,R>(f: (x: T) => R): (x: T) => Either<any, R>
export function liftE<T,R>(f: (...x: T[]) => R): (...x: T[]) => Either<any, R>
export function liftE<T,R>(f: (...x: T[]) => R) {

    return (...x: Array<T>): Either<any, R> => {

        try {
            return [undefined, f(...x)]
        } catch (e) {
            return [e, undefined]
        }
    }
}
