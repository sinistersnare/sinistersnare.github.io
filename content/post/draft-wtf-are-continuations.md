+++
slug = "wtf-are-continuations"
title = "WTF Are Continuations?"
description = "The control flow operator no one teaches you."
date = 2020-11-09T12:15:00-05:00
draft = true
[taxonomies]
tags = ["PLT", "Computer Science", "Lisp", "Continuations"]
+++


Continuations are weird! Write a blog post about them, Davis!

pictures from this paper are nice but could use more examples/description
https://www.cs.utah.edu/plt/publications/icfp07-fyff.pdf

In my [last post](@/post/06-abstract-machines.md), I talked about abstract machines. These machines use continuations to decide what to do after evaluating a value. This post will expound on the idea of continuations from both theoretical and practical perspectives.

# Continuations #

As I talked about in my Abstract Machines post, a continuation is a thing that represents the 'rest of the program', or, more locally 'where to go next'.
Continuations overpower traditional `return` statements, but are much more obscure, as their power comes with great responsibility. Lets take a look at a simple program in a nondescript generic language that people know.

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
    ret(b) # Transport back to the `ret` continuation and give it that value.
    # Control never gets here!
    # We can do all the crazy stuff we want!!!!
    9 / 0

def main():
    c = callcc(foo)
    print(c)
```

Lets unpack this! First, now our function `foo` takes some argument that we seem to be using as a return construct. But its just a function! In fact, languages with first-class continuations use functions to represent them. So, `ret` is of type `continuation`, but we treat it like a function that takes 1 argument. This 'function' _does not return_. Continuations when used like this are just like a `return` statement, because they will transport control back to the caller of the function.

We used a special function '`callcc`' to make this happen, what is it? It stands for 'Call with Current Continuation'. It means that it will call the given function, and gives that function the current continuation as an argument. As I keep saying a continuation is really the thing to do 'next'. What that means here is that we are giving the idea of 'what to do next' to `foo`.
When we use the continuation (use `ret` as a function), we go back to that 'next', which is the line `c = callcc(foo)`. So we transport to that point, and fill it with the value given to the continuation (in our case, 42).

Most descriptions of continuations talk about 'holes' and stuff, but that really never made sense to me. I mean, you can say the same thing about just plain `return`! When you call a function it makes a hole, and when the function returns, it fills the hole with that value. I would say that the key insight is to understand that continuations can be thought of as a first-class return! To imagine why anyone would care about such malarky, I think a quick look at history may help.

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
f(x,y,z); // such deduplication, much understandable, wow,
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
'what if we made everything first-class?' And hence, They started on a road that leads to continuations. As shown, continuations are a first class 'return', one that can be used as a variable. So, lets use it like one.

Note: From now on, `return` is not a thing, we will be using continuations to return from functions.

```python
# This program takes place in a world that shuns 73,
# But 73 tries to find its way into programs all the time.

def get_half(value, good, bail):
    """
    Compute the half of a given value.
    Will return to `good` if the inputted number is safe.
    Will return to `bail` if the inputted number is evil.
    """
    if value == 73:
        bail("NICE TRY, 73, YOU'RE NOT GETTING PAST ME")
    good(value / 2)


def do_work(ret):
    # Who knows what number this will give us!?
    num = get_value_from_internet()

    def get_half_k(good):
        """
        A Helper function so we can use callcc
        on get_half. A real language with callcc
        has better facilities than this
        fake language for doing this.
        """
        get_half(num, good, ret)
    # calling `ret` in `get_half` is like calling
    # return in this function,
    # which originally takes the continuation
    half = callcc(get_half_k)
    ret("Cool, the internet gave us double of " + half)

def main():
    exclamation = callcc(do_work)
    print(exclamation)
```

In this contrived example, we use our first class `return` variables to bail out of nested functions if things get weird. If we wanted to do something similar in a language like Java we would need some a lot of `try`/`throw`/`catch` machinery, and a lot of alcohol to give us the courage to bring it to code review.

So, in this contrived example, we use our first class `return` to bail out of a nested computation when things get weird (73 is a pretty weird number[!](https://en.wikipedia.org/wiki/73_(number))). This is obviously a contrived example. The idea of first-class continuations is a lot less trodden than first class functions. There are not cool things like `map` or `fold` to show the elegance of them so simply.

Howevever, their usage as a low-level control-flow building-block is on the up and up! Continuations can be used to implement `return` in your language. They can be used to implement `try/catch`. They are basically a more safe  `goto` (if you don't know what `goto` is, then dont look it up. Rejoice in your ignorance of the Cthulu of programming). By using simple continuations to build these complex features, their implementations become more straightforward, and programmers can reach for the more powerful machanisms if they need them.

Sadly though, continuations up to now are a bit too weak to implement these constructs well. Lets talk about what hampers these continuations and what we can do to make them even _MORE_ poweful.


## The Weakness of the Current Continuation #

When we use a 'current continuation', we are passing the _entire_ 'rest of the program' to
the function. What does this mean in practice? Lets look at an example program:

```python
# Really amazing code that teaches soooo much to people
# This code shows how continuations have to recompute things
# And that can be _realllyyy_ bad.
```

This is quite inefficient when we are looking to implement things like `raise exception` as a call to a continuation.

## (De)limiting Your Continuations ##

What we can do is limit a continuation to only a portion of the program. This way, when the continuation is called, we

Delimited continuations are interesting, as they are more complex, and MUCH more powerful than standard continuations. To use delimited continuations, we require more setup than the standard `callcc`. More words here.


# Real Life Continuations #

Most work done on continuations in a real language happens inside of Scheme. My language of choice when doing continuation stuff is [Racket's control library](https://docs.racket-lang.org/reference/cont.html)

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
