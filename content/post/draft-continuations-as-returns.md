+++
slug = "continuations-as-return"
title = "Continuations as First Class Return"
description = "One use for continuations"
date = 2020-11-30T12:15:00-05:00
draft = false
[taxonomies]
tags = ["PLT", "Computer Science", "Continuations"]
+++

This post can serve as an extra-light introduction to continuations.
If you have not heard of, or are confused by continuations,
this post may be for you!

This will be the first post of a series on continuations.
We start with a short introduction to the idea of first-class control.
In the future, I may introduce topics like `dynamic-wind`, or maybe just more interesting uses of continuations, like ambiguous functions.
I eventually want to get to the downsides of these undelimited continuations, and then introduce
delimited continuations. If none of that made sense, awesome! Enjoy!

# First Class #

You may be familiar with the concept of first class functions. Where you can use functions as regular-old values, and treat them like anything else in a language.

```python
def foo(a):
    ...
def bar(b):
    ...
...
if x < y:
    which = foo
else:
    which = bar

value = which(x)
```

Here we decide which function to use based on some condition. We can also have functions take functions as arguments.

```python
def add1(x):
    return x + 1

better = map(add1, [1,2,3,4])
# better == [2,3,4,5]
```

Functions are just like any other value in many modern languages. They are at the same status as integers, or strings.
This is really nice, and programmers have decided that this is overall a nice-to-have feature.

So, lets go further! Let's make more things first-class.

# Return #

What does it mean to have a first class return? It means promoting an important control-flow primitive into something that programmers have power over.
By having a first class return, we turn the idea of returning into a value that can be passed around, same as an integer, or a function.


Lets pretend our language no longer has a return statement, and we can only return by using first-class return values. Lets have `return` be the
final argument to any function.

```python
# We call the return argument `exit`
# in the main function.
def main(exit):
    compute(12, exit)

def compute(x, return):
    y = x / 3
    return(y)
```

In the `main` function, we are given a value that we named `exit` instead of `return`. Of course, these are variables so we can call them whatever
they want. This `exit` argument, when called, will take you to the exited state of the program, when given a return value. Much like how
in `C` we can return an integer at the end of the `main` procedure, and the caller of the C program can use that value however it wants.

The `compute` function is almost identical to one in a current programming language. The difference is that we have `return` as an argument now,
a value. We call the `return` argument like a function, ***but they are different***. these values do not go back eventually like a function would.
When we call `y = foo(x)`, eventually `foo` will return and `y` will be filled with some value. But in these special `return` things,
we alter the 'control' of the program to somewhere else.

Lets call these values `continuations`. As in, where to 'continue' to by calling it.

A great thing about having continuations is that they can be passed around like any value, so we can return from some deeply nested function easily if need be.

However, right now, the only continuation we have seen is the `exit` continuation, that is provided as a way to quit the program.
How do we get any continuation? If I want to call `var = foo(42, ???)` How do I get a continuation that will return and then fill in `var`?
Lets use an operator called `cc`, the 'current continuation':

```python
def compute(x, return):
    y = x / 3
    return(y)

def main(exit):
    y = compute(12, cc)
    print("Got: {y}", cc)
    exit(9001)
```

This `cc` operator reckons what the current computation is, and creates a continuation for that. In our line `y = compute(12, cc)`, `cc` knows that after
the function ends, it is going to place the returned value into the variable `y`. The `cc` in the call to `print` is used so that the program
will simply continue running, as no variable is assigned anywhere. Then we use the `exit` continuation to end the program with a nice and big number.

With the `cc` operator, we can now fulfill our goal of 'early return' semantics.


```python
# In the world where this program exists,
# 73 is a _VERY BAD NUMBER_, dont trust it.
# We must make sure all input does not contain 73.

# If an illegal number is found, we bail
# out to `bad_return` with an error message
# Otherwise, we return to `good_return`
# with the value.
def sanitize(x, bad_return, good_return):
    if x - 1 == 72:
        bad_return("NO EVIL ALLOWED HERE")
    else:
        good_return(x)

def get_value_from_world(return):
    value = get_maybe_dangerous_input(cc)
    good = sanitize(value, return, cc)
    return("Got good value {good}!")

def main(exit):
    important_val = get_value_from_world(cc)
    prin(important_val, cc)
    exit("nothing bad going on here")
```

Here, we are able to exit out of our computation if we find ourselves in a tricky situation.
Normally, we may accomplish this through an exception-based system. You would have a convoluted
try-catch system just to watch for a single error-case... good luck getting through code review!
But now, we have the power to bail out without having an extra system!

# Conclusion #

Continuations are really powerful, and still under active research!
Having first-class control is really cool. They are basically a `goto`,
but more computer-sciencey.

Current research on continuations includes making them safer and more efficient.
Perhaps in the future, `return` statements will simply be a syntactic sugar
for an implicit argument given to functions. That way, you can take multiple
return points as arguments, and then decide where you want to go next,
