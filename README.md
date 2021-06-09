# Fallible

## Monadic computation with Either and Maybe for tsfun

* [mcompose](test/composition/mcompose.spec.ts)
* [liftM](test/tuple/lift_m.spec.ts)
* [liftE](test/tuple/lift_e.spec.ts)
* [mmatch](test/tuple/mmatch.spec.ts)
* [aMcompose](test/async/a_mcompose.spec.ts)

## The-Monad-Tutorial

In functional programming one at some point inevitably stumbles upon the term Monad,
a seemingly esoteric concept, if not for the choice of term alone. When looking at it
bottom up, from practice to theory instead the other way around, the basic concept can be understood,
if not easily, then at least gradually, with recurrent exposure to simpler functions like *map* and *flatMap*.

To show this (in pseudo notation), let's look at the familiar *map* function.

	:> map [1,2,3], even?
	[false, true, false]

So we have a collection of numbers and map it to the same type of collection, here a *List*,
but of booleans instead of numbers, which can be expressed like this

	List[A] => (A => B) => List[B]

Or, to also abstract the collection type away, we can say

	T[A] => (A => B) => T[B]

T must not even be a collection, it simply needs to "box" an item or more items of a given type, hence
we also call T the box type. In any case, taking a box type with items of type A and a mapping function
from A to B, map produces a box with items of type B.

Now for something more funky, let's have a look at flatMap

	:> flatMap [1, 2, 3], x => [x * 2, x * 3]
	[2, 3, 4, 6, 6, 9]

This implementation of flatMap for List takes mapping functions from the original item type to a List of items.
To prepare for a more general view of it and facilitate the ongoing argument, let's see two more examples. First

	:> flatMap [1, 2, 3], x => [x * 2]
	[2, 4, 6]

Here the resulting List is of the same length, which acts effectively like `map`. Second, one could also make use of a Predicate

	:> flatMap [1, 2, 3], x => odd? x ? [x * 2] : []
	[2, 6]

This is equivalent to an element-wise application of `filter;map`.

Independent of the specifics of flatMap for List, as seen in the previous examples
(namely, that it concats all items linearly, which is an arbitrary choice; think for a moment, how you would implement map, and then flatMap for a *Map*?),
the essence can be captured like this

	T[A] => (A => T[B]) => T[B]

So first of all its not about Lists and secondly it is very similar to map, except that the mapping functions
result type differs. This tiny detail has some interesting implications.

To show that, note for now that one can nest flatMaps

	:> flatMap [4], x =>
	     flatMap [2 * x], y =>
	       [x + y]
	[12]

Something along these lines would be possible with map, except that we would never end up with a box type of the same "depth"
afterwards (the *flat* in flatMap is an allusion to the List implementation, where the obvious effect is seen as a flattening of the list after a mapping operation).

A more general property of this construction is that it closes over all its nested functions arguments, which enables the `x + y` in the
last line.

One could invent a new syntax for this, to make things more readable

	:> do x <- [4],
	      y <- [2 * x],
	      [x + y]
	[12]

This is in fact done in *Haskell* and *Scala*, albeit here things are tiny bit simplified

Now lets say this do notation has a specific implementation (of flatMap) for singleton or empty Lists, which is interpreted in that way that
a singleton List like `[1]` means *success* with a success value `1` and an empty List `[]` signifies *failure* (usually these are called `Maybe = Just|Nothing` or `Option = Some|None`).

	:> flatMap maybe, f =
	      pattern maybe
		 [x] -> f x,
		 []  -> []

Remember that it still conforms to the type signature as defined above

	T[A] => (A => T[B]) => T[B]

Contemplating this example, which assumes do is now implemented in terms for flatMap for Maybe

	:> a = 9
	:> b = 3
	:> do x <- [a],
	      y <- b == 0 ? [] : [b],
	      [x / y]
	[3]

One wonders, what happens if b is 0? Compare again to this version in plain syntax, with b set to 0.

	:> a = 9
	:> b = 0
	:> flatMap a, x =>
	      flatMap b == 0 ? [] : [b], y =>
	   	 [x / y]
	[]

One can see that the inner flatMap will, because of its implementation, not call its mapping function at all
and instead simply return failure (`[]`) immediately. The division which would lead to an error will not get executed at all.

The general interpretation of this is, that this is a composition of computations, which can fail at any step,
where the underlying machinery handles failure and continuation. One can extend this to use *Either*, which can hold contextual error information,
to be gathered at the failing step of the computation. Imagine for example one has a list of a 1000 items, which need to go through a series of
transformations, where each step possibly can fail. You then would just map these 1000 items through that computation and collect the Eithers afterwards.
For each item, you will either end up with the final result or a failure value stemming from the precise step which failed for that specific item. Item 2 could have failed at step 3, item 17 at step 4, after which the processing of those particular items stop.

Monadic behaviour for other data types can be implemented, with different semantics other than
error handling. This is famously done in the Haskell `IO` Monad, and generally by providing different implementations of flatMap (a.k.a. `bind` or `>>=`) for those data types, which as a sole requirement need flatMap to conform to the given type signature. The automagic behaviour of the `<-` arrow, which allows for items to appear inside a hermetic context is, I think, what is linked to the term Monad. It emerges out of the property of the mapping function to map to a box type again.

### Credits and notes

If I remember correctly, the safe division example stems from *Programming in Haskell* by *Graham Hutton*.
