+++
slug = "wtf-are-continuations"
title = "WTF Are Continuations?"
description = "The control flow operator no one will teach you."
date = 2020-11-23T12:15:00-05:00
draft = true
[taxonomies]
tags = ["PLT", "Computer Science", "Lisp", "Continuations"]
+++

Continuations are weird! Write a blog post about them, Davis!

pictures from this paper are nice but could use more examples/description
https://www.cs.utah.edu/plt/publications/icfp07-fyff.pdf

TODO:
* Finish writing

--------

In my [last post](@/post/06-abstract-machines.md), I talked about abstract machines. These machines use continuations to decide what to do after evaluating a value. This post will expound on the idea of continuations from both theoretical and practical perspectives.

# Continuations #

As I talked about in my Abstract Machines post, a continuation is a thing that represents the 'rest of the program', or, more locally, 'where to go next'.
Continuations may be thought of like traditional `return` statements. They can be used as a low level building block of control flow primitives. Lets take a look at a simple program in a nondescript generic language that people know.

```python
def foo():
    return 42

def main():
    c = foo()
    print(c)
```

This is a regular program with regular return flow. We call a function, and it returns a value that it computes back to the caller. Then the callers work continues until _it_ returns.

As I mentioned, continuations can be used to implement return statements. So lets use our fake not real language to show how that would look.

```python
def foo(ret):
    b = 42
    # Transport back to the `ret` continuation
    # and give it that value.
    ret(b)
    # Control never gets here! Its dead code
    # from here on out! We can do all the
    # crazy stuff we want!!!!
    9 / 0

def main():
    c = callcc(foo)
    print(c)
```

Lets unpack this! First, our function `foo` now takes some argument, that we are using like a function. In fact, when we use it, its treated as a return. Languages with first-class continuations use functions to represent (or 'reify' them). So `ret` is of type `continuation`, but we treat it like a 1-argument function. This 'function' _does not return_ to execute the next line. Continuations when used like this are just like a `return` statement, because they will transport control back to the caller of the function.

We used a special function '`callcc`' to make this happen, what is it? It stands for 'Call with Current Continuation'. It means that it will call the given 1-parameter function, with the current continuation as its parameter. As I keep saying a continuation is really the thing to do 'next'. What that means here is that we are giving the idea of 'what to do next' to `foo`.
When we use the continuation (use `ret` as a function), we go back to that 'next', which is the line `c = callcc(foo)`. So we transport to that point, and fill it with the value given to the continuation (in our case, 42).

Most descriptions of continuations talk about 'holes' and stuff, but that really never made sense to me. I mean, you can say the same thing about just plain function calls and `return`! When you call a function it makes a hole, and when the function returns, it fills the hole with that value. I would say that the key insight is to understand that continuations can be thought of as a first-class return! To imagine why anyone would care about such malarky, I think a quick look at history may help.

## First Class Functions ##

In the olden days of computing, when code was fast but computers were slow, functions were
big ugly things that had to known _ahead of time_ to do anything with. If I wanted to decide between calling 2 functions I had to be _very_ explicit about it.

```c
void function1(int a, int b, int c) { ... }
void function2(int a, int b, int c) { ... }

...

if (some_condition) {
    function1(x,y,z);
} else {
    function2(x,y,z);
}
```

But then, there was an epiphany.

> "What if we were able to use functions as variables and values?"

Soon after, JavaScript happened and the world ended. But, _right before that_, there was a beautiful utopia of first class functions. We could write code that was more concise! And functional programmers could seem really cool by writing one liners.

```c
void function1(int a, int b, int c) { ... }
void function2(int a, int b, int c) { ... }

...

Function f;
f = some_condition ? function1 : function2;
// such deduplication, much understandable, wow.
f(x,y,z);
```

We could even start writing code about what we want done, not necessarily how we want it done:

```python
def add1(value):
    return value + 1

values = [1,2,3,4,5]

incremented = map(add1, values)
```

## First Class Return ##

Programmers felt great power in passing around functions like simple values. Next, they thought,
'what if we made everything first-class?' And hence, They started on a road that leads to continuations. As shown, continuations are a first class 'return'.
That means they are 'reified' (represented) as values that can be placed into variables, and used like any other variable.

From now on, `return` is not a special thing, we will be using continuations to return from functions.

```
# This program takes place in a world that
# shuns 73, But 73 tries to find its way
# into programs all the time.

def get_half(value, return_bad, return_good):
    """
    Compute the half of a given value.
    Will continue to `good` if the
      inputted number is safe.
    Will continue to `bail` if the
      inputted number is evil.
    """
    if value == 73:
        return_bad("NICE TRY, 73!")
    return_good(value / 2)

# We need to give every function call
# a continuation parameter, so they know
# where to return to.
# We do this by using callcc.
# Not every function call requires the
# current continuation, sometimes we just
# give functions a continuation we already have.

def do_work(return):
    # Who knows what number this will give us!?
    num = callcc(get_value_from_internet)

    def get_half_k(good):
        # Calling `return` in `get_half`
        # is like calling return in `do_work`
        get_half(num, return, good)
    half = callcc(get_half_k)
    return("Cool! " + half)

def main(exit):
    exclamation = callcc(do_work)
    print(exclamation, exit)
```

In this contrived example, we use our first class `return` variables to bail out of nested functions if things get weird. If we wanted to do something similar in a language like Java we would need some a lot of `try`/`throw`/`catch` machinery, and a lot of alcohol to give us the courage to bring it to code review. We also need to provide a continuation for every function call, so functions have a place to return to.

The idea of first-class continuations is a lot less trodden than first class functions. There are not cool things like `map` or `fold` to show the elegance of them so simply.

However, their usage as a low-level control-flow building-block is on the up and up! Continuations can be used to implement `return` in your language.
They can be used to implement `try/catch`. They are basically a more safe  `goto` (if you don't know what `goto` is, then do not look it up.
Rejoice in your ignorance of the Cthulhu of programming).
By using simple continuations to build these complex features, their implementations become more straightforward,
and programmers can reach for the more powerful machanisms if they need them.

Sadly though, continuations up to now are a bit too weak to implement these constructs well. Lets talk about what hampers these continuations and what we can do to make them even _MORE_ powerful.

## The Weakness of the Continuation #

These continuations I have been talking about are 'multi-shot, undelimited, escaping' continuations. There are a bunch of issues with them,
from understandability, to performance problems, to composability. Continuations are still an area of active research,
and there exists better abstractions for continuations than `callcc`.

When we use a 'current continuation', we are passing the _entire_ 'rest of the program' to
the function. What does this mean in practice? Lets look at an example program:

```python
# Really amazing code that teaches soooo much to people
# This code shows how continuations have to recompute things
# And that can be _realllyyy_ bad.
```

This is quite inefficient when we are looking to implement things like `raise exception` as a call to a continuation.

## (De)limiting Your Continuations ##

What we can do is limit a continuation to only a portion of the program. This way, when the continuation is called, we don't need to recompute so many things.

Delimited continuations are interesting, as they are more complex, and MUCH more powerful than standard continuations. To use delimited continuations, we require more setup than the standard `callcc`. More words here.


# Real Life Continuations #

Most work done on continuations in a real language happens inside of Scheme. My language of choice when doing continuation stuff is [Racket's control library](https://docs.racket-lang.org/reference/cont.html)

> Continuations allow the implementation of nonlocal exits, backtracking [14,29], coroutines [16], and multitasking [10,32].
* The Scheme Programming Language, 4th Edition

-----

OG PLAN that sucked because no one cares about CPS.

1. Describe CPS
2. Convert some sample programs into CPS
3. Describe how a 'real' continuation can be reified into a Kontinuation object.
4. Describe call/cc
5. Describe some uses of call/cc
6. Describe drawbacks of call/cc
7. Say 'but delimited continuations are more powerful! And less drawback to programmer'
8. Describe Prompts and abort
9. Describe call/comp
10. Lots of example code and pictures :)
