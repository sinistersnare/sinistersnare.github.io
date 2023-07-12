+++
slug = "rusts-poor-composability"
title = "Rust's Poor Composability"
description = "They should think better about their design"
date = 2023-04-05T12:15:00-05:00
draft = false
[taxonomies]
tags = ["Rust", "PLT", "Engineering", "Pet-Peeves"]
[extra]
generate_toc = false
+++

I love Rust. I wish they would spend more time making it actually work for non hello-world use-cases.

## Iteration

Rust has a nice pretty syntax for iterating:

```rs
for x in &mut something {
    *x = (*x) * 2;
}
```

EXCEPT when you need to do _anything else_ to the iterator, then its ugly:

```rs
for (i, x) in something.iter_mut().filter(|| {...}).enumerate() {
    *x = (*x) * i
}
```

What's the point of having the 'pretty' syntax if it only works in the simplest of cases?

I _hate_ syntax that only works in hello world examples. It infuriates me, because it means
that this is all just Oz, and that you eventually need to pull back the curtain
and everything you were promised was a lie.

## Trying...

Rust has a great syntax for early return on `Err` cases.

```rs
let thing: Result<A, B> = x.foo();
// Will return early with the error if x.foo() returns Err.
let thing: A = x.foo()?;
```

BUT when you try to use it with iterators -- which are also amazing, I love using iterators -- IT DOESNT WORK.

```rs
// ? in an Iterator method doesnt work!! What the hell!
let res: Vec<_> = iterator.iter().map(|x| x.foo()?).collect();
```

So instead we need to use the ugly for-loop manual collection

```rs
let res = vec![];
for x in &iterator {
    res.push(x.foo()?);
}
```

In my mind, the `for` loop syntax should be simple syntactic sugar for `iterator.iter().for_each(BODY)`, not bespoke syntax. The fact this breaks wrecks my mental model. Whats the point of having two completely different iteration syntaxes with different properties?

But this also happens elsewhere, because of this ugly inflexability, we cant do:

```rs
let z = x.foo().map(|y| y.bar()?);
```

we must do

```rs
let z = if let Some(y) = x.foo() {
    y.bar()?
}
```

Gross. The Rust designers really should have ran [`import this`](https://peps.python.org/pep-0020/).

> There should be one-- and preferably only one --obvious way to do it.

Again, the absolute lack of composability is astounding. Whats the point of even having iterator methods if you can't
use them for _real world usecases_, where code is regularly fallable, so you need to return a `Result`.

# Async

This is basically the same problem as before, but with `.await` instead of `?`.
You _must_ use the `for` loop syntax if you want to use `.await`, because iterators are not powerful enough
to support real world use-cases.

# Conclusion

I have been a fan of Rust for 10 years now (wow!), and I love it. But the teams working on language design need to
_SLOW DOWN_ and focus on ergonomics and composability. Not adding new syntax because some other language has it.
For years now there has been calls for a 'fallow year' for Rust, and I think it should happen. Of course, there are
so many people working on Rust, it is infeasable to task everyone on '**_ergonomics_**',
but I think it should be the focus at least.

Niko has [some ideas](http://smallcultfollowing.com/babysteps/blog/2023/01/20/rust-in-2023-growing-up/) but they
still seem so lofty compared to basic ergonomic capabilities.

There is some work on keyword generics that looks horrendous, but maybe would solve this problem. I hope they can work on it.

# More things I have found that annoy me.

I have a nice easy to make struct.

```rs
struct Easy {
    thing: u32,
}

impl Easy {
    fn new() -> Self {
        Self {
            thing: 12,
        }
    }
}
```

Cool! But, its just about to get slightly more complicated. `Easy` needs a reference.

```rs
struct Easy<'a> {
    thing: u32,
    handle: &'a [u8],
}

impl<'a> Easy<'a> {
    fn new() -> Self<'a> {
        Self {
            thing: 12,
            handle: todo!() // this is done better in real code I promise.
        }
    }
}
```

But, alas! `Self<'a>` is not valid! We need to switch it to `Easy<'a>`. Of course this is a small nit,
but what the heck! This is exactly what I'm talking about. There are nice little sugars that we are allowed
to use just until it becomes code that _actually needs to do anything_. Then you can't use the sugar.

Whats the point of having the sugar in the first place then?!

- TODO: reference `registers of Rust` -- https://without.boats/blog/the-registers-of-rust/
- TODO: Find the keyword generics work, link to it.
