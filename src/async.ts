import {Maybe, Either, first, ok, isErr, rest} from 'tsfun'
import {convert} from './composition'



// TODO review if we need the double await (like in flow here too, now since we allow single as well as multiparam lists in functions like asyncMap
/**
 * tsfun | aMcompose
 *
 * Examples:
 *
 * https://github.com/danielmarreirosdeoliveira/tsfun/blob/master/test/async/a_mcompose.spec.ts
 */
export function aMcompose<T, R>(...fs: Array<(x: T, ...xs: Array<T>) => Promise<Either<any, T>>|Either<any, T>>)
    : (seed: Either<any, T>) => Promise<Either<any, R>>
export function aMcompose<T, R>(...fs: Array<(x: T, ...xs: Array<T>) => Promise<Maybe<T>>|Maybe<T>>)
    : (seed: Maybe<T>) => Promise<Maybe<R>>
export function aMcompose<T, R>(...fs: Array<
                                   (x: T, ...xs: Array<T>) =>
                                       Promise<Either<any, T>>
                                       |Promise<Maybe<T>>
                                       |Either<any, T>
                                       |Maybe<T>
                                   >) {

    return async (seed: Maybe<T>|Either<any, T>) => {
        if (isErr(seed)) return seed as any

        let results = [ok(seed)] as Array<T>
        for (let f of fs) {

            const res = await f(first(results) as T, ...rest(results))
            if (isErr(res)) return res as any
            results = [ok(res)].concat(results)
        }
        return convert(first(results), seed) as any
    }
}
