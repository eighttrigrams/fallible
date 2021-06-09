import {liftM} from '../../src/tuple'
import {mcompose} from '../../src/composition'
import {cond, throws, is, val, map} from 'tsfun'


/**
 * tsfun | liftM
 *
 * maybelift
 */
describe('liftM', () => {

    const square = (x: number) => x * x

    it('success', () =>

        expect(

            liftM(val(3))(17)

        ).toEqual([3])
    )


    it('failure', () =>

        expect(

            liftM(throws(3))(19)

        ).toEqual([])
    )


    it('varargs', () =>

        expect(

            liftM((x: number, y: number) => x + y)(17, 19)

        ).toEqual([36])
    )


    it('use with mcompose', () =>

        expect(

            map(mcompose(liftM(cond(is(1.5), throws(3))), liftM(square)))
            ([[1.5], [0], [2]]) as any

        ).toEqual([[],[0],[4]])
    )
})
