+++
slug = "abstract-machines"
title = "Abstract Machines: Interpreters for Computer Scientists"
description = "Abstract Machines from C to Z"
date = 2020-11-03T12:15:00-05:00
draft = false
[taxonomies]
tags = ["PLT", "Computer Science", "Interpreters", "Abstract Machines", "Continuations"]
+++

THIS IS A DRAFT! It'll be published 'for real' soon. If you have feedback,
let me know!
------

So im a PhD student now, so I need to write about cool computer science things!
As part of my learnings, I have been writing a bunch of 'Abstract Machines'.
The way that I think of Abstract machines is that they are are how
computer scientists do programming languages research without computers.
I mean, they have to use _something_ to write their papers.

> "Computer Science is no more about computers than astronomy is about telescopes"
> * Edsger Dijkstra

We love computers, but they are merely a tool of computing. The real study
of computation can be done without them, and the theories of how programming
languages function is not discluded from that. So how do computer scientists
study interpreters without a computer? The theory of
abstract machines is a big way in doing that.


# How to Compute #

What does it mean to compute something? Humans are pretty good at just looking at things
and formulating an answer. For example, you dont use a sorting algorithm when matching
socks after your laundry is finished. But computers can't. They are given
precise instructions on what to do to accomplish something. So how can we model that,
and use it to inform the science behind computation?

We can use 'abstract machines' to model computation. They are functions that take program states, and return some value. Program states can be composed of many different things. The simplest abstract machines simply use the syntax of the language. Others include a mapping of variables to values, so we can keep state around. We will describe such machines, and what kind of languages they can describe.

These machines are interpreters. They are called 'abstract machines' because the theory on them is not specific to any exact language. You can make an abstract machine for whatever you want: Lisp, Java bytecode, RISC-V assembly language...

# Digression: Operational Semantics #

Operational Semantics are how we can write semantics of a language
using pen and paper. Using a simple syntax, we can get the idea of
'if the syntax looks like this, it can be evaluated into this'.

The ideas of semantics work for both compilers and interpreters. It is pretty easy to take the operational semantics and turn them into 'real' functions in your implementation language of choice.

## Big Step ##

Big step evaluations have the type `State -> Value`,
meaning that you give them a state, and it will tell you which value
it exactly evaluates to. These are nice and simple generally, because they
give you the values in a single step.

To use a small example expression, `if cond then e_true else e_false`
there are two rules that will be used.

1. If cond evaluates to `true`, then the result is what `e_true` evaluates to.
2. If cond evaluates to `false`, then the result is what `e_false` evaluates to.

So it fully evaluates all expressions, and returns the result in a single step.
A pretty large step, as it recursively spirals into its constituent parts. But,
a single step nontheless!

I like using big step when thinking exactly about what expressions _do_.

## Small Step ##

Small step semantics have the type `State -> State`. They will
show you what to do step by step to evaluate a term. They work iteratively,
explicitly, to show how a given state is computed.

For example, if the term is `if cond then e_true else e_false`,
There will be a few different rules.

1. If cond is an atomic value, and that value is `true`, the resulting state is `e_true`.
2. If cond is an atomic value, and that value is `false`, the resulting state is `e_false`.
3. If cond is not an atommic value, then evaluate it to `cond'` , and return `if cond' then e_true else e_false`.

An atomic value is a value that can not be broken up any more. This means a datatype, not a complex expression. In these simple machines I show, the only datatype is a number.

By going from a state to a next state, small step mechanics more closely follow
how our computers work. They dont evaluate to values directly, they just... keep going.

This may confuse a new reader, if it keeps going, how do we know its done? Big step rules
directly result in a value, full stop. How do we know a state in small step semantics are finished?
Well, we use what is called a 'fixpoint', or more simply, we evaluate until there isnt a meaningful change in the state after running. If we evaluate a math expression enough times,
it will decompose into a single number, upon which evaluation will lead to itself. That means there is no more work to be done, and evaluation stops.

Small step semantics are a bit more precise in my opinion, and they are much easier to translate
to _real_ interpreters. But it is very useful to understand both styles, they have different uses. Using small steps, we can also more closely trace how an expression is evaluated.


# A Simple Abstract Machine, C #

I dont mean the the C language, especially because I would not use simple to describe it!
C in this case stands for 'control'. You may remember things like 'if' are called 'control flow
operators'. Control is the currently running 'thing' in your program. This machine will be called
the C machine because you only need control to represent the state of the program.

C machines are not capable of much, only simple rewriting of expresions, because they dont have any information other than the program's control itself to go off of.
One kind of language we can formalize with a C machine is that of mathematical expressions.

Here is a big-step semantics of type {{ katex(body="MathExp \rightarrow \mathbb{Z}") }} (takes a math expression and returns an integer). With the `State` being only a math expression, we can already do simple math:

{{ katex(body="Addition:") }}
{% katex(block=true) %}
\frac{e_1 \rightarrow n_1 \;,\; e_2 \rightarrow n_2 \;,\; n_1+n_2 = n }
	 {e_1+e_2 \rightarrow n}
{% end %}

<!--
{{ katex(body="Multiplication:") }}
{% katex(block=true) %}
\frac{e_1 \rightarrow n_1 \;,\; e_2 \rightarrow n_2 \;,\; n_1 * n_2 = n }
	 {e_1+e_2 \rightarrow n}
{% end %}
-->

This rule, of which machines are composed of many, shows how to add expressions to end up with a number. You can understand it by reading the half under the bar as 'this is what we start and end with' and the half above the bar as 'these must be true to use these semantics'. You read {{ katex(body="\rightarrow") }} as 'evalutes to'.

So for addition (and similarly for the multiplication rule):

1. If we have some 'control' that looks like '{{ katex(body="e_1 + e_2") }}' (this is from the bottom left, before the arrow)
2. if {{ katex(body="e_1") }} evaluates to some number {{ katex(body="n_1") }} (the first expression above the bar),
3. if {{ katex(body="e_2") }} evaluates to some number {{ katex(body="n_2") }} (the second expression above the bar),
4. if {{ katex(body="n_1") }} added to {{ katex(body="n_2") }} is equal to some number {{ katex(body="n") }} (the third expression above the bar).
5. THEN we know that the expression in step 1 evaluates to {{ katex(body="n") }}.


This may seem a bit backwards, we implement adding by adding? Well, the key is that expressions are complex, they can be composed of other expressions, or just be values. These rules show how to do math on expressions, by first evaluating them to values. Then once they are values, it is quite easy to do math operations on them.

Note the distinction between the arrow {{ katex(body="\rightarrow") }} and {{ katex(body="=") }} here. {{ katex(body="\rightarrow") }} is saying "left evaluates to right by virtue of applying this machine's rules." and {{ katex(body="=") }} is saying "you can substitute this expression for this value". Authors of semantics like these love to use different cool looking arrow symbols, they all mean the same thing. Usually in big step they use a cool down-facing arrow like {{ katex(body="\Downarrow") }}, and in small step they will use a more boring arrow like {{ katex(body="\rightarrow") }}.

You could also encode some rules for precendence (so that `1 + 2 * 3` evaluates correctly), but I would leave that to a parser, which feeds a normalized tree into an abstract machine. In these examples, I will use simple text-based controls, but they dont have to be text! More on that later.

So, this machine only needs 'control' to properly evaluate its programs, but the programs
need be very trivial in a C machine. What if we want to add variables? Well, to have
variables we need a place to store them. And so, the CE machine is born.

### Example ###

Lets evaluate a simple math expression to show how you can use these rules to prove that expressions are evaluated correctly using a machines rules.


{% katex(block=true) %}
\frac{\frac{7 \rightarrow 7 \; 3 \rightarrow 3 \; 7 + 3 = 10}{7 + 3\rightarrow 10}  \scriptsize{\mathbf{Addition}} \;\;\; \frac{}{4 \rightarrow 4} \;\;\; 10 + 4 = 14}
	 {7+3+4 \rightarrow 14} \scriptsize{\mathbf{Addition}}
{% end %}

Here, at the first, bottom most level, {{ katex(body="e_1 = 7 + 3")}} and {{ katex(body="e_2 = 4")}}. Then we need to prove that `7 + 3 = 10`, and we do that with another application of the addition rule! We could have chosen `3 + 4` to be be {{ katex(body="e_2")}}, but it doesnt matter for addition, and we leave issues like that to a parser. I noted each level with the rule that was used to evaluate it. It is generally showed like this, but I usually dont show them. I only have so much horizontal space on this webpage!


# Environments with the CE machine. #

To evaluate variables, we need to be able to keep track of what value they hold at a given program point. in a C machine, if we are given `a + 2`, we have no way of know what `a` is, because its not a number, and we can only deal with syntax as we see it. But if we gave a machine both `a + 2`, the control, and a mapping `{a : 4}`, an environment, we can evaluate the expression to 6!

So, a big-step CE machine doesnt just have `MathExp` (C) for state anymore, we need an `Env` (E) to accompany it! The function is now of type {{ katex(body="(MathExp \times Env) \rightarrow Z") }}. This means that our machine will take 2 arguments, a math expression and an environment, and it will return a computed value.

{{ katex(body="Var-Lookup:") }}
{% katex(block=true) %}
\frac{\rho[var] = n}
	 {(var, \rho) \rightarrow n}
{% end %}

This simply states that if the expression is a variable, not an artithmetic expression,
the value it returns is what the environment says it is. We use the greek
letter rho ('ρ') (not the letter 'p') to represent the environment. This is what is used
in the literature, and its always best to follow along with norms to avoid confusion!

We dont have variable binding yet, but you can imagine an expression like:
`m*c*c` with an environment `{m : 12 c : 299792458}`, which will return some number for us.
We have made a calculator with predefined constants! We can put pi in there,
or tau if you are a lunatic...

# We have EVERYTHING we need now! #

Wow, it seems like we can do a lot with just a control and an environment. We could further extend this to things like variable assignment (again, these are big-step semantics):

{{ katex(body="\mathbf{Assignment:}") }}
{% katex(block=true) %}
\frac{e_1 \rightarrow n_2 \;,\; \rho_2 = (\rho + \{var : n_2\}) \;,\; (e_2, \rho_2) \rightarrow n}
	 {(var := e_1 \;\text{in}\; e_2 \;,\; \rho) \rightarrow n}
{% end %}

This tells us that when we assign a variable, it will be available in the next expression.

It seems that these two components of a state are enough to be wildly dangerous with. Soon enough, your semantics will be modeling a real language, with conditions, and inequalities, oh my! But, there are two big problems that you may face.

First, your big step semantics may limit you. Their stringent requirements that their sub-expressions be terminating can cause issues in a turing-complete environment. And a small-step semantics can provide more granularity of control. For that reason, we will be using small-step semantics from now on.

Also, as your language gets more and more complicated, the constructs of control and environment may be overburdened with responsibility. What can we do to simplify our understanding of these machines?

# What next? Kontinuations! #

One way to alleviate the burden is to add a new construct to our machines: The continuation.
A continuation is a way of showing 'future work' to be done. For example, when we implement
our assignment operation, we can delegate the work of executing the second expression to the
continuation:


{{ katex(body="\footnotesize{\mathbf{Assign-Exp}}:") }}
{% katex(block=true) %}
\footnotesize{
\frac{}
	 {(v := e_1 \;\text{in}\; e_2 , \rho , \kappa)
	 \rightarrow (e_1 , \rho , \text{assign}(v, e_2, \kappa))}
}
{% end %}

{{ katex(body="\footnotesize{\mathbf{Assign-Kont}}:") }}
{% katex(block=true) %}
\frac{e \text{ is atomic} , \rho_2 = (\rho + \{v : \text{e} \})}
	 {(e , \rho , \text{assign}(v, e_2 , k_{next} ))
		\rightarrow (e_2 , \rho_2 , k_{next})}

{% end %}

There is quite a bit more to unpack here! First, our state has a third argument. Our type signature is now {{ katex(body="(C, E, K) \rightarrow (C, E, K)") }}. The third argument is a continuation, it is
useful in small step semantics, so we can focus on evaluating expressions. When we are done, we know what to do next.

Next, the change to small step brings a couple of differences. Instead of returning a fully evaluated value as before, we now return states. Big step semantics are nice for simple programs, but when things get more complex, we want finer-grained control, so we switch to small-step.

The above semantics show that when we see an assignment expression, we simply return the {{ katex(body="e_1") }} expression as the control for the next state. The key is that we save a new 'continuation frame' along with that control. This signifies that after that expression is fully evaluated, we continue by assigning it to a variable, and then execute the expression {{ katex(body="e_2") }}.

Another notable thing is that, inside of that 'assign' continuation frame, we store the old continuation. This recursive format is necessary when nesting complex expressions. Next, we use an example with nested assignment expressions, and the recursive nature of the continuations is our life-jacket.

## Example ##

If we had some expression:

`x := 4 in (x + 1)`, we would start with the `assign-exp` rule,
which simply gives us a new state, it doesnt directly evaluate anything to a base value.
The new state says that we need to evaluate `4` with the same environment as before,
but we change the continuation, to store the values in the we need to use after the `4` is
fully evaluated (which it is, but we cant see that far ahead! One small step at a time!).
After the `assign-exp` a state that looks like `(4 , env , assign(...))` is returned.
We immediately see that the `assign-kont` rule can be applied, as the control is a number,
and we have an `assign` continuation in the `K` position. So by applying that,
a state `(x + 1, env2 , old_kont)` is given to us, and with `x` in the environment mapped to `4`.

What is `old_kont` in this example? As you see from the `assign-exp` rule, one of the main things
that a continuation does is store the previous one, like a linked-list. Continuations are the 'next thing to do', so after the current continuation is used, we do what the old continuation was.

For example, an program that looks like:


{% katex(block=true) %}
x := (y := (z := 3 \;\text{in}\; z) \;\text{in}\; (y + y)) \;\text{in}\; x
{% end %}


Here is what the states will look like over the course of 3 applications of `assign-exp`:

```
(x := (y := (z := 3 in z) in (y + y)) in x , {} , NONE)
-> ((y := (z := 3 in z) in (y + y)) , {} , assign(x , x , NONE))
-> ((z := 3 in z) , {} , assign(y , y + y , assign(x , x , NONE)))
-> (3 , {} , assign(z , z , assign(y , y + y , assign(x , x , NONE))))
```

Then if we apply `assign-kont` a couple times, with omitted `addition` and `var-lookup` rules:

```
-> (z , {z : 3} , assign(y , y + y , assign(x , x , NONE)))
-> (3 , {z : 3} , assign(y , y + y , assign(x , x , NONE)))
-> (y + y , {z : 3 , y : 3} , assign(x , x , NONE))
...
-> (6 , {z : 3 , y : 3} , assign(x , x , NONE))
-> (x , {z : 3 , y : 3 , x : 6} , NONE)
-> (6 , {z : 3 , y : 3 , x : 6} , NONE)
```

### Interlude: Injection ###

Note above that there is an 'initial' state that we use when we start evaluating an expression. We wrap the expression with an empty environment ('{}'), and an 'empty' contination ('NONE'). This is usually done with whats called an injection function:

{% katex(block=true) %}
inject(e) = (e \;,\; \{\} \;,\; \text{NONE})
{% end %}

This gives us the initial state from an expression. The initial state can of course be changed to your needs. adding initial environment values or constants, for example.

### Back To The Example ###

We started with a NONE continuation, meaning have nothing to do next (end of program!).
We then slowly build up continuations. *Continuations are turned to for guidance once control is atomic*. Atomic here means that it cant be broken down any more (computer scientists dont have quarks yet). Once we evaluate a continuation, the cycle continues, evaluate the control until it is atomic again. Eventually (if your program terminates!), we will be faced with an atomic control, and a NONE continuation. This means that we have finished evaluation, as there is nothing left to do! That is known as a fixpoint, which is a term taken from math meaning, if we run it another step, nothing will change: `f(x)` evaluated to `x`.

This is a good example of the differences between small and big step evalaution models.
Small step is a scalpel, where big is a cudgel. They may be more effective than the other, depending
on what youre doing.

# Other Continuation Types #

We have demonstrated two different continuation types, "NONE", and "ASSIGN".
One signifies the end of computation, and one tells us how to add variables to the environment.
What if we want to add a conditional to our language? It is very easy with our language!

Lets compute this text:

{% katex(block=true) %}
\text{if}\; c \;\text{then}\; t \;\text{else}\; f
{% end %}

This will evaluate `c`, and once a value is computed, it checks its value. If the value is `0`, it will take the `else` branch, otherwise it will take the `then` branch. If we had a more complex language with booleans, we could use those. Or really, we could do almost anything! Make your own language, make it weird!

{{ katex(body="\text{if-exp}:") }}
{% katex(block=true) %}
\frac{}
	 {((\text{if}\; c \;\text{then}\; t \;\text{else}\; f) \;,\; \rho , \kappa)
	 \rightarrow (c , \rho , \text{ifk}(t , f , \kappa))}
{% end %}

{{ katex(body="\text{if-kont-t}:") }}
{% katex(block=true) %}
\frac{v \text{ is atomic} , v \;\text{!=}\; 0}
	 {(v , \rho , \text{ifk}(t , f , \kappa_{next}))
	 \rightarrow (t , \rho , \kappa_{next})}
{% end %}

{{ katex(body="\text{if-kont-f}:") }}
{% katex(block=true) %}
\frac{v \text{ is atomic} , v = 0}
	 {(v , \rho , \text{ifk}(t , f , \kappa_{next}))
	 \rightarrow (f , \rho , \kappa_{next})}
{% end %}

Here, when it is time to check the continuation for guidance, we will next evaluate
one of the branches from the `ifk` continuation 'frame' based on the controls value.

The idea of small step + continuation can be very similar to big-step. this CEK machine
is basically saying 'evaluate this to a value, then do something else'. Big-step says
that but in a slightly more compact way, involving more inference rules on the top half of the
big bar.

## Another Example ##

Lets do another simple example of continuations, just to hammer them in!

We will show that:
{% katex(block=true) %}
\scriptsize{
\frac{}
	 {(x := (\text{if} \; (1 + 1) \; \text{then} \;7\; \text{else} \;12) \; \text{in} \; x \;,\; \{\} \;,\; NONE)
	 	\rightarrow (7, \{\}, NONE)}
}
{% end %}

```
(x := (if (1 + 1) then 7 else 12) , {} , NONE)
-> (if (1 + 1) then 7 else 12 , {} , assign(x, x, NONE))
-> ((1 + 1) , {} , ifk(7, 12, assign(x, x, NONE)))
-> (2 , {} , ifk(7, 12, assign(x, x, NONE)))
-> (7 , {} , assign(x, x, NONE))
-> (x , {x : 7} , NONE)
-> (7 , {} , NONE)
```

If you have been paying close attention to continuations, they kind of act like a fine-grained _stack_. Instead of functions being the level that we create frames of, its individual instructions. The idea of continuations


# The Big Idea #

The abstract machines are the C, CE, and CEK *ideas* that we have talked about.
They are the types of state used when implementing an abstract machine. The resulting
machine, however, is a *concrete interpreter* for your programming language.

So what is wih all this trouble? Creating a tiny interpreter is easy! Using abstract machines
offers us a way to build new features incrementally, and concisely.

The key is that most 'simple' interpreters are 'meta-circular', meaning they are implemented
using the features and runtime of the host language. *MORE EXAMPLES?*.
`(loop (print (eval (read))))` is a lisp interpreter in lisp, but it requires a bunch of lisp machinery, and assumes a lot about the lisp runtime. This is very limiting!

These Abstract Machines provide a way to form an independent interpreter for your language,
that doesnt necessarily depend on the runtime of your host language. Also, using
operational semantics can help you to formalize how your language evalautes, and be sure that your implementation is correct!

But more than all of that, this is how computer scientists can model computation and semantics.
Computer science is older than computers. One of the oldest 'languages' that we have is the [lambda calculus](wiki-lambda-calc), which was originally a pen-and-paper tool for modeling computation. It is now the primary system that computer scientists use when discussing new basic machinery for studying computation.

# The Future #

Adding even more complex language features is a necessity for formalizing a real language. One key feature is of exception handling: try-catch and the like. A solution used for advanced control flow such as try-catch is to bring continuations to first-class status. Continuations are very powerful constructs, and can be used to implement exception handling schemes. I am writing another post on what continuations _are_, becuase they are very poorly known in the world outside of programming panguages research.

Abstract Machines can themselves be abstracted, to form interpreters that are non-deterministic. These interpreters can be used to see what possible states a program can reach. Using this information, static analyses of programs can be conducted, meaning optimizations, warnings, etc.. The ideas of abstract AMs is still new, and a topic of current research.


# Conclusion #

Abstract Machines are a way to formally define computation for terms. When mapped to 'the real world' that means an interpreter for your language. They are a wonderful way of explicitly showing how programs are executed to reach a final value.


# Appendix #

{{ katex(body="") }}

{{ katex(body="\rho:") }} 'rho', is an environment, used to map variables to values.

{{ katex(body="\kappa:") }} 'kappa', is a continuation, the next thing to do, after the current thing is evaluated.

{{ katex(body="") }}

{{ katex(body="") }}

{{ katex(body="") }}
