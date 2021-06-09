import {liftM} from '../../src/tuple'
import {mcompose, mmatch} from '../../src/composition'
import {Maybe, map, flow, val, just} from 'tsfun'


/**
 * tsfun | mmatch
 */
describe('mmatch', () => {

    const safediv = (x: number) => (y: number) => (y === 0 ? [] : [x / y]) as Maybe<number>
    const div = (x: number) => (y: number) => x / y
    const square = (x: number) => x * x


    it('success', () =>

        expect(

            mmatch(square, val(17))([3])

        ).toEqual(9)
    )


    it('failure', () =>

        expect(

            mmatch(square, val(17))([])

        ).toEqual(17)
    )


    it('use with mcompose', () =>

        expect(

            flow(
                [1.5, 0.0, 2.0],
                map(just),
                map(mcompose(safediv(3), liftM(div(6)), liftM(square))),
                map(mmatch(square, val(4)))) as any

        ).toEqual([81, 4, 256])
    )
})
