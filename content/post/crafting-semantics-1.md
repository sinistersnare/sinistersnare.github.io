+++
slug = "crafting-semantics-1"
title = "Crafting Semantics 1: Lambda Calculus"
description = "CESK And λ"
date = 2021-01-06T12:15:00-05:00
draft = false
[taxonomies]
tags = ["PLT", "Computer Science", "Semantics", "Crafting Semantics"]
[extra]
generate_toc = false
use_katex = true
+++

This series of posts revolves around creating operational semantics of the Scheme programming language from the ground up, starting with the lambda calculus.

If you have not read the introductory post, you can find it [here](@/post/crafting-semantics-0.md), and see the index of this series [here](/tags/crafting-semantics/).

# Intro #

Hi, in this post we will be implementing a CESK Abstract Machine for the lambda calculus (or simply 'λ'). First, we need to define all of what an 'abstract machine' is, what semantics are, and the syntax we will be using. So this post may be a bit long. Future posts are likely to be shorter!

If you know all of the intro stuff already, but dont know how to define semantics for the lambda calculus, feel free to skip to [here](@/post/crafting-semantics-1.md#the-machine)

# CESK #

The type of abstract machine we will be creating is called 'CESK'. It stands for **C**ontrol, **Environment**, **Store**, and **Kontinuation** (C was already taken). For a language as simple as the λ-calculus, we dont need all of this machinery, but as we build features for this machine into a real scheme, it will be nice to have the extra features provided by the Store and Kontinuation pieces.

The control of a machine is the current instruction that is being evaluated. For the λ-calculus, this will simply be the syntax. For a more complex machine, like the JVM, this could be the bytecodes and an index into the current instruction. For a CPU, it may be an instruction pointer and the binary program text. When you hear the word 'control flow' it is referring to this component.

The environment is the set of variables that can be referenced. We will use a simple key-value mapping (dict, hash, etc.) to represent our environment. The keys of the mapping will be the variable names, and the value will be the address of where to find that variables value.

The store is where values are actually held. If you have an address, you can access the store to get its corresponding value. We again use a key-value mapping, from address to value.

The kontinuation is what happens 'next', after we finish evaluating an expression. We will use a special continuation frame object to track this. In many languages, this kind of thing is called a '{{ elink(text="call-stack", to="https://en.wikipedia.org/wiki/Call_stack") }}'. When a function is called, the 'stack' is added to with the current function. In the future, We will augment it to track more things, such as conditionals, let bindings, and variable mutation.

It is used to represent a fine grained call-stack. But instead of only keeping track of function calls, it tracks many other things, such as conditionals and let bindings.

# The λ of Computer Science #

λ, spelled 'lambda' in english, is a greek letter which is ubiquitous in the computing sciences. It refers to computation itself.

The lambda calculus is a very simple language. Created before modern computers, its goal was to express logic formally. Now, we can use it as a basis for a small and simple programming language. Its {{ elink(text="Wikipedia Page", to="https://en.wikipedia.org/wiki/Lambda_calculus") }} is chock-full of great stuff, but I will give it a quick introduction.

The lambda calculus has 3 forms

{% katex(block=true) %}
\begin{aligned}
% expressions
e &::= x  \\
  & | \; (e\;e) \\
  & | \; (\lambda \; (x) \; e) \\
x &::= \; \text{some variable} \\
\end{aligned}
{% end %}

This syntax means, an expression (we are just calling it `e`) can be three things. It could be some variable, that we are calling `x`. It could also be an 'application' with 2 expressions in it. Finally, It may be an 'abstraction' that takes some variable and some expression.

Both `e` and `x` are what are called 'metavariables', meaning they are variables to be used in the grammar, and will be replaced in a real text. An example λ-calculus program may be:

{% katex(block=true) %}
((\lambda \; (q) \; (\lambda \; (b) \; q)) \; (\lambda \; (\text{blerp}) \; \text{WORD}))
{% end %}

This is a program! At this moment, it doesnt do anything, beacuse we have not given it any _semantics_! Semantics are what give program text meaning. Maybe in my semantics, I will say, "If a program looks like `((λ (q) (λ (b) q)) (λ (z) z))`, then format the Hard Drive!". I would not say thats a very moral semantics, and it places a weird dependency on something called a 'hard'... 'drive'... but it's a semantics!

Given a reasonable (and standard, time honored) semantics, these three can perform any computation. We will implement semantics for the lambda calculus in this post, and add on to it in the future to make an actually useful language.

So lets get started!

# The Machine #

First, we need to define our _domains_. These are the things that we actually use to implement our machines. A simple domain that you may be familiar with is the set of Integers. starting at 0, you can go forward by 1, or backwards by 1, to infinity (and negative infinity). Our domains include 'syntactic domains', which are domains seen in the progrm text, and 'semantic domains', for determining meaning.

## Syntax ##

The syntactic domain is our grammar from above, but lets expand on it a bit for our sake. We will also be using a more mathy notation, in addition to the {{ elink(text="BNF", to="https://en.wikipedia.org/wiki/Backus–Naur_form") }} above.


{% katex(block=true) %}
\begin{aligned}
% expressions
e \in \textsf{Exp} &::= x  \\
                   &| \; (e\;e) \\
                   &| \; lam \\
% variables
x \in \textsf{Var} &\triangleq \text{The set of variables} \\
% lambdas
lam \in \textsf{Lam} &::= (λ \; (x) \; e) \\
\end{aligned}
{% end %}

To read this notation, you need to take a look at the three parts. First, is the name of the metavariable. For the first line, the metavariable is `e`. When you see `e` in use, it is referring to this domain. Next is the name of the domain. Third, you have the definition. I use BNF style or 'definitional equality' by my own choice. the `∈` symbol means 'in', or 'is a member of domain'. So the first line reads, "`e` is a member of the domain 'Exp', which is defined as these three productions".

There are 3 domains here, expressions, variables, and lambdas. These are the same as above, but now we have the name of the sets used, instead of just the metavariable names. If we see any `e`, then it is in the `Exp` domain. The same goes for `x` and `Var`. We may see multiple `e` metavariables used, but in this context, they can be filled in with different values. Later, when we are writing the semantics, we will differentiate metavariables of the same domain with subscripts or tick-marks.

I also factored the lambda 'production' in the grammar into its own domain. This will be helpful in the semantic domain definitions.

The equal sign with the delta-triangle over it just means 'is defined as'. In Computer Science and Math, `=` may mean 'is the same as' or 'is defined as', so we use the Δ to differentiate the two.

Sometimes `::=` is used, and sometimes our `=` with `Δ` is used, why? Because using notation in this way is helpful. There arent strict rules here, and I found it useful to use BNF style for some domains, and definitional-equality for others. If you dont like it, you could perhaps give each production in the BNF grammar its own domain, and use a '{{ elink(text="sum type", to="https://en.wikipedia.org/wiki/Tagged_union") }}' to define everything in terms of definitional equality.

## Semantics ##

The semantic domains include the definitions for the machine parts themselves. Exciting!

{% katex(block=true) %}
\begin{aligned}
% Machine
\varsigma \in \Sigma &\triangleq \textsf{Exp} \times \textit{Env} \\
					 & \times \textit{Store} \times \textit{Kont} \\
% Env
\rho \in \textit{Env} &\triangleq \textsf{Var} \rightarrow \textsf{Addr} \\
% Store
\sigma \in \textit{Store} &\triangleq \textsf{Addr} \rightarrow \textsf{Val} \\
% Address
a \in \textit{Addr} &\triangleq \mathbb{N} \\
% Value
v \in \textit{Val} &\triangleq \textit{Clo} \\
% Closures
clo \in \textit{Clo} &\triangleq \textsf{Lam} \times \textit{Env} \\
% Continuation
\kappa \in \textit{Kont} &::= \textbf{mt} \\
						& | \; \textbf{arg}(e, \rho, \kappa) \\
						& | \; \textbf{fn}(v, \rho, \kappa) \\
\end{aligned}
{% end %}

So there are a lot of pieces here! Lets go through them! Dont worry if they dont make perfect sense just yet, it will make more sense when they are used in context in the next section.

First, the state definition itself. We have 4 components as previously defined. We use a '{{ elink(text="product type", to="https://en.wikipedia.org/wiki/Product_type") }}' to say 'One of each'. The domain is called Σ, or 'sigma' (uppercase). When we only have one state, (much as we would have one number in the domain of 'Integer'), we use ς, or 'varsigma' (i dont understand ancient greek enough to get why its called that). To form a state, you take one of each of the constituent parts. Our machine takes a state as input, and returns a state.

Next, we need to define the environment and store. In computer science jargon, a map is simply a 'partial function' from the input to the output. For the environment, the function takes a `Var`, and returns its `Addr`. The same is true of the store, which takes the address, and returns the value that it points to. The store isn't particularly useful in this machine, but when we implement things like mutation, it will be good to have around.

Third, the address and value sets. In this simple machine, addresses will be very simple, we will use numbers to define them (the set with the fancy `N` is integers starting at 0 and going up to infinity).

Values in this machine are '{{ elink(text="closures", to="https://en.wikipedia.org/wiki/Closure_(computer_programming)") }}'. Closures are a key part of higher order languages, such as Scheme, and are defined as a syntactic function (in our case the abstraction form), and an environment. In more advanced machines, values will be able to take on many different types, including numbers, strings, even continuations!

Finally, our definition of continuations. If you look closely, its a kind of linked list, meaning that a continuation has another continuation attached to it, until you get to the `mt` continuation, the end. Other than `mt`, there are two important 'continuation frame' types. The `arg` continuation means that after we finish the current computation, we must evaluate the argument to the application. The `fn` frame tells us that after the current computation, we need to execute the function with the argument.

## Injection And Allocation ##

As I mentioned earlier, our machine takes a state and returns a state, so how do we know what the 'first' state is? To determine that, we create an 'injection function'. This takes the program text as input, and returns the initial machine state that will evaluate it. Ours is quite simple:

{% katex(block=true) %}
inj : \textsf{Exp} \rightarrow \Sigma \\
inj(e) \triangleq (e , \emptyset , \emptyset , \textbf{mt}) \\
{% end %}

The top line is the type of the function `inj`, which states that it is a function that takes an expression, and returns a state. The next line is the definition, you will see that it takes an `e`, and returns a state, with the `e` as the control, empty sets for the environment and store, meaning that there are no mappings. the starting continuation is 'mt', meaning that there is nothing left to do after it is encountered.

We also need a way to make an address. A good allocator gives us an unused address, so that we dont step on any other variables toes. Lets define a simple alloc here:


{% katex(block=true) %}
alloc : \textit{Store} \rightarrow \textit{Addr} \\
alloc(\sigma) \triangleq |\sigma| \\
{% end %}

We define alloc as simply, 'the amount of items in the store'. If the store is empty, the address return will be `0`, if there are 12 items, the address will be `12`. As long as we never implement garbage collection, this is guaranteed to always give us a clean, unused address!

The starting state is used to create the next state, and the state after that, until we reach the end of the program (or infinite loop! Thanks halting problem!). This is called a 'state machine'. If you took a few computer science courses, you may be familiar with 'finite state machines'. A programming language can be thought of as an 'infinite state machine', because we have _no idea_ if it will end! Exciting! Mysterious!


# Transitions #

The machine we will be making is based off of a multitude of 'state transition functions', that say "if the state looks like this, do that". When you combine all of these functions, you get a working machine, or what a lay-prorammer may call an 'interpreter'!

So, without further ado, lets write out some state transition functions! We begin with something simple, variable lookup:

{% katex(block=true) %}
(x , \rho , \sigma , \kappa) \leadsto (lam , \rho_\lambda , \sigma , \kappa) \\
\begin{aligned}
\text{where } \sigma(\rho(x)) &= (lam , \rho_\lambda) \\
\end{aligned}
{% end %}

We have finally defined our first semantic! If our control is some variable, then we need to look it up in the environment and store. If we find that they lead to a closure (a lambda and an environment), then we use them in the resulting state. I use the funky arrow cause I think it looks funny. I call it 'drunk arrow'. You can read it as 'leads to'.

Note that I used a regular `=` and i said 'if we find' above. In the 'where' clause, I am not stating what the variable lookup will be, but making a query. Luckily, the only thing that our store can hold at the moment is a closure, so its likely that the query succeeds.

But there is also the case that the variable does not exist. If the variable is not found, then this transition function does not go into effect. We call such a state a 'stuck state', there is no usable transition, so the state never changes. This can mean that we are 'done', and that there is no more computation left, or it could indicate some error. You could of course implement some semantic such as:

{% katex(block=true) %}
(x , \rho , \sigma , \kappa) \leadsto \text{ERROR-STATE} \\
\begin{aligned}
\text{where } \rho(x) &= \text{NO-ENTRY-FOUND} \\
\end{aligned}
{% end %}

But then we would have to add error types to the state definition, and a lot more transitions to describe errors. Thats no fun, so I will leave boring stuff like that to 'real' interpreter writers. Let's just assume all programs given to our machine are 'good' and dont get into any bad stuck states.

So if our machine consists only of the one semantic, it will never be used, because our environment and store are never added to, so no variable will ever be found. Let's add some more semantics to alleviate that issue.

{% katex(block=true) %}
((e_f \; e_a) , \rho , \sigma , \kappa) \leadsto (e_f , \rho , \sigma , \kappa') \\
\begin{aligned}
\text{where } \kappa' &\triangleq \textbf{arg}(e_a , \rho , \kappa) \\
\end{aligned}
{% end %}

Now we can evaluate an 'application' form. This is when well-defined semantics are really important. In our machine, we evaluate the first expression before the second. We are giving an explicit order of evaluation here. Why is the order of evaluation important? In more complex languages with mutable state, you can have undefined behavior if the order of evaluation is undefined. I will leave further research as an exercise to the esteemed reader.

We also change the continuation in the resultant state. The new continuation contains the second expression of the application, and the environment in which to evaluate the expression. It also contains the old continuation, so we can know what to do after we finish evaluating the current control.

{% katex(block=true) %}
(lam , \rho , \sigma , \textbf{arg}(e_a , \rho' , \kappa))
\leadsto (e_a , \rho' , \sigma , \textbf{fn}(lam , \rho , \kappa)) \\
{% end %}

This input state is more complex than the prior. If we have a value for the control (in our case, the control is a lambda), and if the current continuation is an `arg` frame, then we transition as shown. Wht this transition 'means', is that we are finished evaluating the left side of the application, and are now going to evaluate the right side.

Also pay attention to the environments, and what goes where. For the resulting state, we use the env found in the continuation, but in the resulting continuation, we use the environment given in the state. This is because the closure we are creating by pairing the lambda (control) requires the env it was found in.  But when we evaluate the right side of the application (e{{ subscript(sub="a") }}), we need to use the same environment that we originally used when evaluating the left side.

Take a little bit to think on that. The fact that we need to use the same environment for both elements of the application, and why the env that gets paired with the lambda is the one that it is.

After you understand that, lets finish this out with the final transition function for today.

{% katex(block=true) %}
(lam , \rho , \sigma , \textbf{fn}(lam' , \rho' , \kappa))
\leadsto (e , \rho'' , \sigma' , \kappa) \\
\begin{aligned}
\text{where } lam' &= (λ \; (x) \; e) \\
			  a &\triangleq alloc(\sigma) \\
			  \rho'' &\triangleq \rho'[x \mapsto a] \\
			  \sigma' &\triangleq \sigma[a \mapsto (lam , \rho)]
\end{aligned}
{% end %}

At this point, we have a lambda as the control, and a `fn` continuation frame. It is officially time to apply the application! The first part of the continuation frame is the function, and the current control is the argument. So we place the functions body as the new control, and add its argument (paired with the environment it was found in to form a closure) to the env/store.

This is the most complex function in this machine. Make sure to internalize that in this machine, the only value is the closure. So, when we see a lambda, we have reached a value (when combined with an env). There {{ elink(text="are ways", to="https://en.wikipedia.org/wiki/Church_encoding") }} to ues closures to represent common datatypes such as numbers, or lists. These ways are how lambda calculus continues to be used as the basis for minimalistic languages such as scheme. But it makes programs hard to read, so we add integers anyways!

# The Completed Machine #

And just like that, we have the 4 transition functions that define a standard 'call-by-value' lambda calculus. Lets put them together for posterity:

{% katex(block=true) %}
(x , \rho , \sigma , \kappa) \leadsto (v , \rho_\lambda , \sigma , \kappa) \\
\begin{aligned}
\text{where } \sigma(\rho(x)) &= (v , \rho_\lambda) \\
\end{aligned}
{% end %}

{% katex(block=true) %}
((e_f \; e_a) , \rho , \sigma , \kappa) \leadsto (e_f , \rho , \sigma , \kappa') \\
\begin{aligned}
\text{where } \kappa' &\triangleq \textbf{arg}(e_a , \rho , \kappa) \\
\end{aligned}
{% end %}

{% katex(block=true) %}
(lam , \rho , \sigma , \textbf{arg}(e_a , \rho' , \kappa))
\leadsto (e_a , \rho' , \sigma , \textbf{fn}(lam , \rho , \kappa)) \\
{% end %}

{% katex(block=true) %}
(lam , \rho , \sigma , \textbf{fn}(lam' , \rho' , \kappa))
\leadsto (e , \rho'' , \sigma' , \kappa) \\
\begin{aligned}
\text{where } lam' &= (λ \; (x) \; e) \\
			  a &\triangleq alloc(\sigma) \\
			  \rho'' &\triangleq \rho'[x \mapsto a] \\
			  \sigma' &\triangleq \sigma[a \mapsto (lam , \rho)]
\end{aligned}
{% end %}

The machine works by combining each of these into one big function, much like the {{ elink(text="piece-wise function", to="https://en.wikipedia.org/wiki/Piecewise") }} you learned in math class. Lets give this function the name `step`.

# An Example Run #

To evaluate a function, we continuously execute our transition functions until we reach a stuck-state. That final state is the return value of our program.

Lets take our example from before, and run it by hand.

{% katex(block=true) %}
e_0 = ((\lambda \; (q) \; (\lambda \; (b) \; q)) \; (\lambda \; (\text{blerp}) \; \text{WORD})) \\
\varsigma_0 = inj(e_0) = (e_0 , \emptyset , \emptyset , \textbf{mt}) \\
\varsigma_n = step(\varsigma_{n-1}) \\
\;\\
%
\varsigma_1 = ((\lambda \; (q) \; (\lambda \; (b) \; q)) , \emptyset , \emptyset , \textbf{arg}((\lambda \; (\text{blerp}) \; \text{WORD}) , \emptyset , \textbf{mt})) \\
%
\varsigma_2 = ((\lambda \; (\text{blerp}) \; \text{WORD}) , \emptyset , \emptyset , \textbf{fn}((\lambda \; (q) \; (\lambda \; (b) \; q)) , \emptyset , \textbf{mt})) \\
%
\varsigma_3 = ((\lambda \; (b) \; q) , \{q : 0\} , \{0 : (\lambda \; (\text{blerp}) \; \text{WORD})\} , \textbf{mt}) \\
{% end %}

ς{{ subscript(sub="3") }} is the final state, if we run `step` again, no applicable input is found. Try to write the steps out more explicitly on some paper, and see for yourself that this is the final state.

The key insight to understand that  ς{{ subscript(sub="3") }} is the final state is that we are at an 'atomic' value with an empty continuation. Atomic in this case means we can't break it down further, like we could a variable or and application form.

# Whats next #

Well, we have a turing complete language, what's the point in doing anything else? Language features to make this machine usable?? Fine! Stay tuned and next time we will implement 'useful' things, like numbers, and `if`. I promise that it will be shorter than this post.

See you next time!
