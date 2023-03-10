+++
slug = "crafting-semantics-3"
title = "Crafting Semantics 3: More Fundamentals"
description = "Variable binding, continuations, multiple arguments!"
date = 2021-01-21T12:15:00-05:00
draft = false
[taxonomies]
tags = ["PLT", "Computer Science", "Semantics", "Crafting Semantics"]
[extra]
generate_toc = false
+++

This series of posts revolves around creating operational semantics of the Scheme programming language from the ground up, starting with the lambda calculus.

If you have not read the introductory post, you can find it [here](@/post/08-crafting-semantics-0.md), and see the index of this series [here](/tags/crafting-semantics/).

# Intro

Trucking along, we are gonna add some more features that make our language much more usable. Lets list them out:

- Let-expressions to bind variables.
- Multi-argument functions
- First-class continuations
- Variable mutation

These features are pretty integral to modern Scheme programming. After we implement these we will be one step closer to a bog-standard Scheme that anyone can implement in 1 line of Python with `import scheme_interpreter`[.](https://xkcd.com/353/)

## Recap

Lets take a look at the machine transitions that we have so far, to give a quick refresher of where we are at.

### Old Eval Rules

These rules evaluate syntax until a value is able to be produced by our atomic-evaluation function {% katex(block=false) %}\mathcal{A}{% end %}.

{% katex(block=true) %}
E \langle \text{\ae} , \rho , \sigma , \kappa \rangle \\
\leadsto
A \langle v , \rho , \sigma , \kappa \rangle \\ \\
\begin{aligned}
\text{where }
v &\triangleq \mathcal{A}(\varsigma)
\end{aligned}
{% end %}

{% katex(block=true) %}
E \langle (\texttt{if} \; e_c \; e_t \; e_f) , \rho , \sigma , \kappa \rangle \\
\leadsto
E \langle e_c , \rho , \sigma , \kappa' \rangle \\ \\
\begin{aligned}
\text{where }
\kappa' &\triangleq \textbf{cond}(e_t , e_f , \rho , \kappa)
\end{aligned}
{% end %}

{% katex(block=true) %}
E \langle (e_f \; e_0) , \rho , \sigma , \kappa \rangle \\
\leadsto
E \langle e_f , \rho , \sigma , \kappa' \rangle \\ \\
\begin{aligned}
\text{where }
\kappa' &\triangleq \textbf{arg}(e_0 , \rho , \kappa)
\end{aligned}
{% end %}

### Old Apply Rules

Once our control is a value, we have reached an apply state. From here, we look to our continuation for... continuation.

{% katex(block=true) %}
A \langle v , \rho , \sigma , \kappa \rangle \\
\leadsto
E \langle e*f , \rho*{\kappa} , \sigma , \kappa' \rangle \\ \\
\begin{aligned}
\text{where }
\kappa &= \textbf{cond}(e*f , e_f , \rho*{\kappa} , \kappa') \\
v &= \texttt{\#f}
\end{aligned} \\
A \langle v , \rho , \sigma , \kappa \rangle \\
\leadsto
E \langle e*t , \rho*{\kappa} , \sigma , \kappa' \rangle \\ \\
\begin{aligned}
\text{where }
\kappa &= \textbf{cond}(e*t , e_f , \rho*{\kappa} , \kappa') \\
v &\;≠ \texttt{\#f}
\end{aligned}
{% end %}

{% katex(block=true) %}
A \langle v , \rho , \sigma , \kappa \rangle \\
\leadsto
E \langle e , \rho*{\kappa} , \sigma , \kappa'' \rangle \\ \\
\begin{aligned}
\text{where }
\kappa &= \textbf{arg}(e , \rho*{\kappa} , \kappa') \\
\kappa'' &\triangleq \textbf{fn}(v , \kappa')
\end{aligned} \\
%
A \langle v , \rho , \sigma , \kappa \rangle \\
\leadsto
E \langle e*b , \rho*{\lambda}' , \sigma' , \kappa' \rangle \\ \\
\begin{aligned}
\text{where }
\kappa &= \textbf{fn}(((\lambda \; (x) \; e*b) , \rho*{\lambda}) , \kappa') \\
a &\triangleq alloc(\sigma) \\
\rho*{\lambda}' &\triangleq \rho*{\lambda}[x \mapsto a] \\
\sigma' &\triangleq \sigma[a \mapsto v]
\end{aligned}
{% end %}

{% katex(block=true) %}
A \langle \varsigma \rangle \leadsto A \langle \varsigma \rangle \\ \\
\begin{aligned}
\text{where }
\kappa &= \textbf{mt}
\end{aligned}
{% end %}

# The Next Machine

Luckily, we don't have any big roadblock here, we can simply implement these new features one by one! Lets start with our domains:

## Syntax Domains

These will again be remarkably similar, we are only adding a few things to our language.

{% katex(block=true) %}
\begin{aligned}
% expressions
e \in \textsf{Exp} &::= \text{\ae} \\
&| \; (\texttt{if} \; e \; e \; e) \\
&| \; (\texttt{let} \; ([x \; e] \; ...) \; e) \\
&| \; (\texttt{call/cc} \; e) \\
&| \; (\texttt{set!} \; x \; e) \\
&| \; (e \; e \; ...) \\
\text{\ae} \in \textsf{AExp} &::= x \;|\; lam \;|\; n \;|\; b \\
% variables
x \in \textsf{Var} &\triangleq \text{The set of variables} \\
% lambdas
lam \in \textsf{Lam} &::= (λ \; (x) \; e) \\
n \in \mathbb{Z} &\triangleq \text{The set of integers } \\
b \in \textsf{Bool} &::= \texttt{\#t} \;|\; \texttt{\#f}
\end{aligned}
{% end %}

We have added 3 expression types, the `let`, `call/cc`, and `set!` expressions. We will discuss and implement them soon. Also of note here is that we changed our 'untagged' function call syntax to allow any non-zero number of expressions.

From our prior semantics, I will have to change the rules related to function calls to accomodate this change. However, the other rules can stay in our semantics unharmed.

## Semantic Domains

Our semantic domains are similarly similar, only a few additions and one slight change.

{% katex(block=true) %}
\begin{aligned}
% Machine
\varsigma \in \Sigma &\triangleq
E\langle \textit{Eval} \rangle + A\langle \textit{Apply} \rangle \\
\textit{Eval} &\triangleq \textsf{Exp} \times \textit{Env} \times \textit{Store} \times \textit{Kont} \\
\textit{Apply} &\triangleq \textit{Val} \times \textit{Env} \times \textit{Store} \times \textit{Kont} \\
% Env
\rho \in \textit{Env} &\triangleq \textsf{Var} \rightarrow \textsf{Addr} \\
% Store
\sigma \in \textit{Store} &\triangleq \textsf{Addr} \rightarrow \textsf{Val} \\
% Address
a \in \textit{Addr} &\triangleq \mathbb{N} \times \mathbb{N} \\
% Value
v \in \textit{Val} &\triangleq \textit{Clo} + \mathbb{Z} + \textsf{Bool} + \textit{Kont} \\
% Closures
clo \in \textit{Clo} &\triangleq \textsf{Lam} \times \textit{Env} \\
% Continuation
\kappa \in \textit{Kont} &::= \textbf{mt} \\
&| \; \textbf{cond}(e , e , \rho , \kappa) \\
&| \; \textbf{callcc}(\kappa) \\
&| \; \textbf{set}(a , \kappa) \\
&| \; \textbf{call}(\overrightarrow{v} , \overrightarrow{e} , \rho , \kappa) \\
\end{aligned}
{% end %}

Changes I made here were to the `Val`, `Kont`, and `Addr` domains. Now, continuations can be a value held in a variable, to obtain one, you must go through the new `callcc` Kontinuation. We added 3 continuation types: for `call/cc`, `set!`, and for the multi-arg `call`. I removed the old continuations pertaining to function calling. Finally, the second number added to the address domain is required to support multiple argument functions.

The syntax of the variables inside the `call` continuation may be new. The overhead-arrow means the variable is a list. When we call a function, we need to keep track of the values that we have processed, and which expressions we have yet to process. Therefore, the first argument is a list of values, which correspond to the evaluated arguments of the call-list. The second argument is that list of unevaluated expressions. We will discuss how they work when we implement the call semantics.

## Helper Functions

Last, let's recapitulate our helper functions.

{% katex(block=true) %}
\mathcal{A} : \textit{Eval} \rightarrow \textit{Val} \\
\begin{aligned}
\mathcal{A}(\langle n , \_ , \_ , \_ \rangle) &\triangleq n \\
\mathcal{A}(\langle b , \_ , \_ , \_ \rangle) &\triangleq b \\
\mathcal{A}(\langle x , \rho , \sigma , \_ \rangle) &\triangleq \sigma(\rho(x)) \\
\mathcal{A}(\langle lam , \rho , \_ , \_ \rangle) &\triangleq (lam, \rho) \\
\end{aligned}
{% end %}

{% katex(block=true) %}
inj : \textsf{Exp} \rightarrow \Sigma \\
inj(e) \triangleq E\langle e , \varnothing , \varnothing , \textbf{mt} \rangle \\ \\
\; \\
alloc : \textit{Store} \times \mathbb{N} \rightarrow \textit{Addr} \\
alloc(\sigma, n) \triangleq (|\sigma|, n)
{% end %}

Only a small change to the `alloc` function to allow the second argument. This second number is used as an 'offset' to the address, and will be utilized when we call functions.

# Transfer Rules

Now that we have defined our domains, lets start writing transition rules!

## Let Expressions

If you are an astute computer scientist, you will know of the isomorphism between function calls and let expressions. We will utilize it to create a dead-easy let implementation here.

What I mean to say is that a `let` expression in Scheme is equivalent to calling a function. Here is an example to illustrate my point:

```scm
(let ([x 1] [y 2])
  (if x y 3))
```

This expression binds 2 variables, `x` and `y`, where they are usable in the `if` expression immediately after. In a standard scheme implementation, this expression is _semantically equivalent_ to:

```scm
((λ (x y) (if x y 3)) 1 2)
```

The difference is only in _style_. The first expression conveys the meaning of binding variables to values and then using them in an enclosed expression. The second is about calling functions to return some value. For the lazy semanticist, however, we can easily implement `let` in terms of this function call.

{% katex(block=true) %}
E \langle let , \rho , \sigma , \kappa \rangle \\
\leadsto E \langle call , \rho , \sigma , \kappa \rangle \\ \\
\begin{aligned}
\text{where }
let &= (\texttt{let} \; ([x_s \; e_s] \; ...) \; e_b) \\
call &= ((\lambda \; (x_s \; ...) \; e_b) \; e_s \; ...) \\
\end{aligned}
{% end %}

This rule is a simple syntactic transformation. If we wanted, we could use a whole `let` continuation frame, and evaluate it so similarly to a regular function call that it would bore everyone. Trust me, I've done it, it is quite tiresome! But if you want to grow your semantic-construction chops, then please implement `let` explicitly! I would be happy to commend you on your effort, dear reader.

## Call With Current Continuation

Call with current continuation, or `call/cc` for short, is a way of obtaining the continuation of the current state, and using it like a regular value. I have [written about continuations before](https://thedav.is/post/continuations-as-return/), so I will be a bit more straightforward with my implementation notes here. In my experience though, I did not truly understand continuations until I implemented this feature in an abstract machine.

Also, I am switching to implementing the whole feature at once, instead of writing out all eval rules and then all apply rules. I think this method is a bit easier for understanding how a feature works, as you can see how they work in concert, side by side.

{% katex(block=true) %}
E \langle (\texttt{call/cc} \; e) , \rho , \sigma , \kappa \rangle
\leadsto E \langle e , \rho , \sigma , \kappa' \rangle \\ \\
\begin{aligned}
\text{where }
\kappa' &\triangleq \textbf{callcc}(\kappa) \\
\end{aligned}
{% end %}

{% katex(block=true) %}
A \langle v , \rho , \sigma , \kappa \rangle
\leadsto E \langle e*b , \rho' , \sigma' , \kappa' \rangle \\
\begin{aligned}
\text{where }
\kappa &= \textbf{callcc}(\kappa') \\
v &= ((\lambda \; (x) \; e_b) , \rho*\lambda) \\
a &\triangleq alloc(\sigma, 0) \\
\rho' &\triangleq \rho\_\lambda[x \mapsto a] \\
\sigma' &\triangleq \sigma[a \mapsto \kappa']
\end{aligned}
{% end %}

Here, we specify that call/cc can only take a one-arg function, and fills its argument with the current continuation. The name makes a lot of sense now! Call the given function... with the current continuation!

What can be done with the continuation value though? To find out, read on! We will cover that when we implement our `call` continuation!

## Mutation

Mutation is the altering of live variables. Up to this point, variables have been immutable. You could shadow a variable, but once the shadow goes out of scope, the original value will be returned. If we wanted to mutate a variable for real, we need language support. Enter the `set!` expression!

{% katex(block=true) %}
E \langle (\texttt{set!} \; x \; e) , \rho , \sigma , \kappa \rangle
\leadsto E \langle e , \rho , \sigma , \kappa' \rangle \\
\begin{aligned}
\text{where }
\kappa' &\triangleq \textbf{set}(\rho(x) , \rho , \kappa) \\
\end{aligned}
{% end %}

{% katex(block=true) %}
A \langle v , \rho , \sigma , \kappa \rangle
\leadsto A \langle \sigma(a) , \rho , \sigma' , \kappa' \rangle \\
\begin{aligned}
\text{where }
\kappa &= \textbf{set}(a , \kappa') \\
\sigma' &\triangleq \sigma[a \mapsto v]
\end{aligned}
{% end %}

So mutation modifies _only_ the store, which is new for us, usually we alter both in tandem. So that's fun.

Anyway, the semantics of `set!` are very simple. In these semantics, I return the old value of the variable, but usually set! returns `Void`. You can do that: add a `Void` constant to your values domain, and return that. I just felt like keeping the semantics a little smaller.

## Function Calls

Lastly, we need to implement calls. This will include continuations, so stay tuned!

{% katex(block=true) %}
E \langle (e_f \; e_s \; ...) , \rho , \sigma , \kappa \rangle
\leadsto E \langle e_f , \rho , \sigma , \kappa' \rangle \\
\begin{aligned}
\text{where }
\kappa' &\triangleq \textbf{call}(\epsilon , e_s , \rho , \kappa)
\end{aligned}
{% end %}

Here, when we create the `call` continuation, we initialize our list of finished values (our 'done' list) with epsilon `ϵ`, which we use as the empty list. We also mark our arguments e{{ subscript(sub="s") }} as the 'todo' list of expressions. If no arguments are given (e.g. in the expression `((λ () 3))`), then it will of course by empty.

We next need a rule for the in-between states of 'finished evaluating an argument, but have more to do'

{% katex(block=true) %}
A \langle v , \rho , \sigma , \kappa \rangle
\leadsto E \langle e , \rho*\kappa , \sigma , \kappa'' \rangle \\
\begin{aligned}
\text{where }
\kappa &= \textbf{call}(\overrightarrow{v} , e :: \overrightarrow{e}
, \rho*\kappa , \kappa') \\
\kappa'' &\triangleq \textbf{call}(\overrightarrow{v} +\hspace{-12mu}+\, [v] , \overrightarrow{e} , \rho\_\kappa , \kappa') \\
\end{aligned}
{% end %}

In this case, we have finished evaluating an argument, but still have unevaluated arguments left. This is notated by the double-colon operator which denotes `e` as the head of the todo-list, and the `e` with an arrow as the tail of the list. The double-plus sign symbol is a list-concatenation operator.

{% katex(block=true) %}
A \langle v , \rho , \sigma , \kappa \rangle
\leadsto E \langle e*b , \rho' , \sigma' , \kappa' \rangle \\
\begin{aligned}
\text{where }
\kappa &= \textbf{call}(\overrightarrow{v} , \epsilon , \rho*\kappa , \kappa') \\
\overrightarrow{v} +\hspace{-12mu}+\, v &= v*h :: \overrightarrow{v} \\
v_h &= ((\lambda \; (\overrightarrow{x}) \; e_b) , \rho*\lambda) \\
a*i &\triangleq alloc(\sigma, i) \\
\rho' &\triangleq \rho*\lambda[\overrightarrow x_i \mapsto a_i] \\
\sigma' &\triangleq \sigma[a_i \mapsto \overrightarrow v_i] \\
\end{aligned}
{% end %}

Here, we have finally utilized our new `alloc` functions offset feature! It's needed here because the amount of elements in the old store will remain constant for the entire transition, so we need a way to differentiate each variables address in the new store.

There is an implicit iteration here, with the `i` variable used. This is a nicety of the pseudo-code nature of these semantics, that we do not have to write out what to do any more explicitly than this. `i` is a number up to the amount of formal parameters of the function, so if we are calling a 3 argument function, then there will be 3 iterations of each of the variables using the `i` subscript.

Overall, this is almost completely the same as the old calling semantics, but with additions to allow for multiple parameters.

Finally, the long awaited rule for using continuations! You really stuck it out just for this, I'm sure! The exciting conclusion of todays semantics!

Without further ado

The semantics

For

Continuation Calling

I'm not sure why I'm stalling this ....

{% katex(block=true) %}
A \langle v , \rho , \sigma , \kappa \rangle
\leadsto A \langle v , \rho , \sigma , \kappa'' \rangle \\
\begin{aligned}
\text{where }
\kappa &= \textbf{call}(\overrightarrow{v} , \epsilon , \rho\_\kappa , \kappa') \\
\overrightarrow{v} &= [\kappa''] \\
\end{aligned}
{% end %}

Actually nice and simple! Continuations can be used like functions in Scheme. When they are called with an argument, the Kontinuation of the next state is set to the continuation being 'called'. This type of continuation is called an 'undelimited escaping continuation', which basically means its goto... so don't go crazy with it!

# Example

We have implemented some great features here today! Lets do a quick example to showcase them!

{% katex(block=true) %}
e*0 = (\texttt{call/cc} \; (\texttt{lambda} \; (k) \; (\texttt{let} \;
([\text{u} \;3] \; [\text{n} \; (k \;13)])\; 55))) \\
\varsigma_0 = inj(e_0) = E\langle e_0 , \varnothing , \varnothing , \textbf{mt}\rangle \\ \\
\varsigma_n = step(\varsigma*{n-1}) \\
\;\\
\varsigma*1 = E\langle
(\lambda \; (k) \; (\texttt{let} \; ([\text{u}\; 3] \;
[\text{n} \; (k \; 13)]) \; 55)) ,
\varnothing , \varnothing , \textbf{callcc}(\textbf{mt})
\rangle \\
\varsigma_2 = A\langle
((\lambda \; (k) \; (\texttt{let} \; ([\text{u}\; 3] \;
[\text{n} \; (k \; 13)]) \; 55)) ,
\varnothing) ,
\varnothing , \varnothing , \textbf{callcc}(\textbf{mt})
\rangle \\
\varsigma_3 = E\langle
(\texttt{let} \; ([\text{u}\; 3] \;
[\text{n} \; (k \; 13)]) \; 55) ,
\{k : (0 , 0) \}, \{(0, 0) : \textbf{mt} \}, \textbf{mt}
\rangle \\
\varsigma_4 = E\langle
((\lambda \; (\text{u} \; \text{n}) \; 55) \; 3 \; (k \; 13)) ,
\{k : (0 , 0) \}, \{(0, 0) : \textbf{mt} \}, \textbf{mt}
\rangle \\
\kappa_1 = \textbf{call}(\epsilon , [3 , (k \; 13)] , \{k : (0 , 0)\}
,\textbf{mt}) \\
\varsigma_5 = E\langle
(\lambda \; (\text{u} \; \text{n}) \; 55) ,
\{k : (0 , 0) \}, \{(0, 0) : \textbf{mt} \},
\kappa_1
\rangle \\
\varsigma_6 = A\langle
((\lambda \; (\text{u} \; \text{n}) \; 55) , \{k : (0 , 0) \}) ,
\{k : (0 , 0) \}, \{(0, 0) : \textbf{mt} \},
\kappa_1
\rangle \\
clo = ((\lambda \; (\text{u} \; \text{n}) \; 55) , \{k : (0 , 0) \}) \\
\kappa_2 = \textbf{call}([clo] , [(k \; 13)] , \{k : (0 , 0) \} , \textbf{mt}) \\
\varsigma_7 = E\langle
3,
\{k : (0 , 0) \}, \{(0, 0) : \textbf{mt} \},
\kappa_2
\rangle \\
\varsigma_8 = A\langle
3,
\{k : (0 , 0) \}, \{(0, 0) : \textbf{mt} \},
\kappa_2
\rangle \\
\kappa_3 = \textbf{call}([clo , 3],\epsilon , \{k : (0 , 0) \} , \textbf{mt}) \\
\varsigma_9 = E\langle
(k \; 13),
\{k : (0 , 0) \}, \{(0, 0) : \textbf{mt} \},
\kappa_3
\rangle \\
\kappa_4 = \textbf{call}(\epsilon , [13] , \{k : (0 , 0) \} , \kappa_3) \\
\varsigma*{10} = E\langle
k,
\{k : (0 , 0) \}, \{(0, 0) : \textbf{mt} \},
\kappa*4
\rangle \\
\varsigma*{11} = A\langle
\textbf{mt},
\{k : (0 , 0) \}, \{(0, 0) : \textbf{mt} \},
\kappa*4
\rangle \\
\kappa_5 = \textbf{call}([\textbf{mt}] , \epsilon , \{k : (0 , 0) \} , \kappa_3) \\
\varsigma*{12} = E\langle
13,
\{k : (0 , 0) \}, \{(0, 0) : \textbf{mt} \},
\kappa*5
\rangle \\
\varsigma*{13} = A\langle
13,
\{k : (0 , 0) \}, \{(0, 0) : \textbf{mt} \},
\kappa*5
\rangle \\
\varsigma*{14} = A\langle
13, \{k : (0 , 0) \}, \{(0, 0) : \textbf{mt} \}, \textbf{mt}
\rangle \\
{% end %}

I separated out the longer continuations because they were getting LONG!

Alas, for this example, in the end, most of that computation was perfectly useless. But it happened, because this is a NO OPTIMIZATION ZONE! No optimizations in 3 days so far, a new warehouse record. It's hard to find comedy in Computer Science sometimes, sorry. I have been telling that '2 hard problems in CS' joke for near 10 years...

As you see, the machine performs admirably up to these new inputs. I did not feature `set!`, because this example was crazy enough! Make a `set!` example yourself, and write out the states by hand, it really helps understand the machine better!

# Conclusion

Another briskly paced post today! I hope you gained some intuition of these machines by this repeated style of implementation. If you think that it's a bit boring, then good! That means you have it down, and this repetition is simply icing on the cake of your semantic knowledge. There will be probably one more post of this caliber before I start to crank it up with more esoteric stuff, so savor the boredom while it lasts!

Next post, I will add other callable types, such as primitives and variadic functions. After that, the machine should be about as done as I want it to be, and our concrete interpreter will be finished. I have future plans though! I want to write about abstract interpretation, and static analysis. I will convert our 'concrete semantics' into 'abstract semantics', so that we can statically analyze programs in our language.
