import {Either, Maybe, rest, first, isErr, ok, isEither, isMaybe, Fallible, success, just, isOk} from 'tsfun';


/**
 * tsfun | mcompose
 * https://github.com/danielmarreirosdeoliveira/tsfun/blob/master/test/composition/mcompose.spec.ts
 */
export function mcompose<T, R>(...fs: Array<(x: T, ...xs: Array<T>) => Either<any, T>>)
    : (seed: Either<any, T>) => Either<any, R>
export function mcompose<T, R>(...fs: Array<(x: T, ...xs: Array<T>) => Maybe<T>>)
    : (seed: Maybe<T>) => Maybe<R>
export function mcompose<T, R>(...fs: Array<(x: T, ...xs: Array<T>) => Either<any, T>|Maybe<T>>)
    : (seed: Either<any, T>|Maybe<T>) => Maybe<R>|Either<any, R> {

    return (seed: Maybe<T>|Either<any, T>) => {
        if (isErr(seed)) return seed as any

        let results = [ok(seed)] as Array<T>
        for (let f of fs) {

            const res = f(first(results) as T, ...rest(results))
            if (isErr(res)) return res as any
            results = [ok(res)].concat(results)
        }
        return convert(first(results), seed) as any
    }
}


/**
 * tsfun | mmatch
 * https://github.com/danielmarreirosdeoliveira/tsfun/blob/master/test/composition/mmatch.spec.ts
 */
export function mmatch<T, R>(onSuccess: (x: T) => R,
                             onFailure: () => R) {

    return (m: Maybe<T>) =>
        isOk(m)
            ? onSuccess((m as any)[0])
            : onFailure()

}

// TODO remove duplication with tsfun
export function convert<T>(what: any, basedOn: Fallible<T>): any {

    if (!isEither(basedOn) && !isMaybe(basedOn)) throw 'illegal argument - basedOn is neither Maybe nor Either';
    return isEither(basedOn)
        ? success(what)
        : just(what)
}
