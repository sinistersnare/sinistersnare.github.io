+++
slug = "crafting-semantics-2"
title = "Crafting Semantics 2: Basic Features"
description = "Numbers, conditionals, insanity!"
date = 2021-01-14T12:15:00-05:00
draft = false
[taxonomies]
tags = ["PLT", "Computer Science", "Semantics", "Crafting Semantics"]
[extra]
generate_toc = false
+++

This series of posts revolves around creating operational semantics of the Scheme programming language from the ground up, starting with the lambda calculus.

If you have not read the introductory post, you can find it [here](@/post/crafting-semantics-0.md), and see the index of this series [here](/tags/crafting-semantics/).

# Intro #

Hi! Welcome! Today, we will be extending the CESK machine from the [previous post](@/post/crafting-semantics-1.md), adding some simple features that will make our language more usable. In particular, we will implement numbers and conditionals. To accomplish that, we will be partitioning the machine into 2 different types of states. This will make future extensions to our language much simpler.


## Recap ##

Let's look at the machine that we have so far. These transition functions serve as the basis for the famous call-by-value lambda-calculus. If you don't remember the domains, I will reproduce them soon, when we create our new machine.

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

## Roadblock ##

The main issue with this machine is that it is very 'lambda-centric'. For example, if you pay close attention in the last post, closure creation is actually deeply embedded into the semantics. When a variable is evaluated it finds the closure and sets it to the current environment. We want a machine that is more ... 'value independent'

If we wanted to have values that are less syntactically visible, like [first-class continuations](@/post/continuations-as-returns.md), adding them to the current machine would overcomplicate our transitions. Instead, we will partition the machine into 'eval' and 'apply' states. Eval states are for _evaluating_ syntax to get a value. Apply states are for _applying_ the value into the current Kontinuation.

# The Next Machine #

Our machine is very similar to the previous machine, with a few additions to the syntactic and semantic domains. I will point out the differences, so don't worry about cross-referencing the last post!

## Syntax Domains ##

{% katex(block=true) %}
\begin{aligned}
% expressions
e \in \textsf{Exp} &::= \text{\ae}  \\
				   &| \; (\texttt{if} \; e \; e \; e) \\
                   &| \; (e\;e) \\
\text{\ae} \in \textsf{AExp}
	&::= x \;|\; lam \;|\; n \;|\; b \\
% variables
x \in \textsf{Var} &\triangleq \text{The set of variables} \\
% lambdas
lam \in \textsf{Lam} &::= (λ \; (x) \; e) \\
n \in \mathbb{Z} &\triangleq \text{The set of integers } \\
b \in \textsf{Bool} &::= \texttt{\#t} \;|\; \texttt{\#f}
\end{aligned}
{% end %}

The main chunk of change revolves around the new `æ` domain. Through this, we have partitioned the syntax into expressions that are complex, and require further evaluation, and 'atomic expressions', which are as small as they need to be, in order to become real values.

The set of atomic expressions include lambdas and variables, as before, and introducing integers and booleans. I also added an `if` complex-expression, which we will implement today.

Also, quick note, booleans in Scheme are `#t` for true, and `#f` for false. Just wanted to be clear on that!

## Semantic Domains ##

The semantic domains are also mostly the same, but with some additions to accommodate this partition between 'eval' and 'apply' states.

{% katex(block=true) %}
\begin{aligned}
% Machine
\varsigma \in \Sigma &\triangleq
			E\langle \textit{Eval} \rangle
			+ A\langle \textit{Apply} \rangle \\
\textit{Eval} &\triangleq \textsf{Exp} \times \textit{Env} \times \textit{Store} \times \textit{Kont} \\
\textit{Apply} &\triangleq \textit{Val} \times \textit{Env} \times \textit{Store} \times \textit{Kont} \\
% Env
\rho \in \textit{Env} &\triangleq \textsf{Var} \rightarrow \textsf{Addr} \\
% Store
\sigma \in \textit{Store} &\triangleq \textsf{Addr} \rightarrow \textsf{Val} \\
% Address
a \in \textit{Addr} &\triangleq \mathbb{N} \\
% Value
v \in \textit{Val} &\triangleq \textit{Clo}
					+ \mathbb{Z} + \textsf{Bool} \\
% Closures
clo \in \textit{Clo} &\triangleq \textsf{Lam} \times \textit{Env} \\
% Continuation
\kappa \in \textit{Kont} &::= \textbf{mt} \\
						& | \; \textbf{cond}(e , e , \rho , \kappa) \\
						& | \; \textbf{arg}(e, \rho, \kappa) \\
						& | \; \textbf{fn}(v, \kappa) \\
\end{aligned}
{% end %}

The changes here were to the states, the values, and the continuations. The change to the states is the most jarring, now we can have 2 different types of sub-states. I added to the values domain, because now we have numbers and booleans! Exciting!

We also needed a continuation type for the conditional. When is it appropriate to add a continuation type? In this machine, you have two things to look at for guidance during computation. First and foremost is the Control. When our machine starts evaluating the syntax `(if cond then else)`, we will place `cond` into the control, and place a continuation `cond(then, else, ρ, κ)` at the top of our Kontinuation stack. After the control is evaluated to a value, we need to look to the Kontinuation for the next steps. For that, we use a continuation.

So, whenever you are adding syntax that needs some state, so the machine knows what to do after the initial control is evaluated, you probably want a new continuation frame type.

Having 2 types of states will make writing out machine rules really easy, I promise! Now, we will have rules for evaluating the control (syntax), and for what to do after its a value (through the continuation)! It is a nice give and take relationship between the states that I really enjoy from this style of machine.

## Atomic Evaluation And Other Functions ##

Last before we get to the new transition rules, we need to define an 'atomic evaluation' function. This function is the bridge from 'eval' states into 'Apply' states. When we see a `4` in our program, it is syntax, because its in the program text. We need to turn that syntax-`4` into a value-`4`.

{% katex(block=true) %}
\mathcal{A} : \textit{Eval} \rightarrow \textit{Val} \\
\begin{aligned}
\mathcal{A}(\langle n , \_ , \_ , \_ \rangle) &\triangleq n \\
\mathcal{A}(\langle b , \_ , \_ , \_ \rangle) &\triangleq b \\
\mathcal{A}(\langle x , \rho , \sigma , \_ \rangle) &\triangleq \sigma(\rho(x)) \\
\mathcal{A}(\langle lam , \rho , \_ , \_ \rangle) &\triangleq (lam, \rho) \\
\end{aligned}
{% end %}

This function turns syntax into values! It is straightforward in the number/bool case, and reminiscent of the machine of the last post for the other two cases.

We use this function when the control is 'atomically evaluable', meaning we can determine its value immediately. For variables, we just need to look its value up, and for lambdas, we pair it with the current environment to form a closure. The other, 'complex', expressions need a little more work done on them before they can be atomically evaluated.

I will also reproduce the other useful functions from the last post, for posterity:

{% katex(block=true) %}
inj : \textsf{Exp} \rightarrow \Sigma \\
inj(e) \triangleq E\langle e , \varnothing , \varnothing , \textbf{mt} \rangle \\
\; \\
alloc : \textit{Store} \rightarrow \textit{Addr} \\
alloc(\sigma) \triangleq |\sigma|
{% end %}

# Transitions #

Now that we have all of the supporting infrastructure, we can make the transition rules! We are going to start with all of the 'eval' rules, and then do the 'apply' rules.

## Eval Rules ##

{% katex(block=true) %}
E \langle \text{\ae} , \rho , \sigma , \kappa \rangle
\leadsto
A \langle v , \rho , \sigma , \kappa \rangle \\
\begin{aligned}
\text{where }
v &\triangleq \mathcal{A}(\varsigma)
\end{aligned}
{% end %}

As a refresher, you can read this rule as follows:

> If the current state is an Eval state, and our control is atomically evaluable, then return the following Apply state, where v is defined by using the atomic-eval function on the input state.

This rule is quite simple! If the current control is an atomically evaluable expression, use our fancy-A evaluation function to make a value of it. This rule covers when the control is a number, boolean, lambda, or variable, what a multitasker!

As I said before, this transition rule is the bridge from eval to apply states. We will  make transition rules for apply states later, but for now, lets continue evaluating syntax!

{% katex(block=true) %}
E \langle (\texttt{if} \; e_c \; e_t \; e_f) , \rho , \sigma , \kappa \rangle
\leadsto
E \langle e_c , \rho , \sigma , \kappa' \rangle \\
\begin{aligned}
\text{where }
\kappa' &\triangleq \textbf{cond}(e_t , e_f , \rho , \kappa)
\end{aligned}
{% end %}

This is the first half of the rules required to support conditionals. When we encounter an `if` expression, we transition to start evaluating the condition. And later, once the condition is evaluated, we will check for a continuation and see the `cond` frame, and go from there! Stay tuned for the riveting conclusion to ~~this anime~~ interpreting conditionals.


{% katex(block=true) %}
E \langle (e_f \; e_0) , \rho , \sigma , \kappa \rangle
\leadsto
E \langle e_f , \rho , \sigma , \kappa' \rangle \\
\begin{aligned}
\text{where }
\kappa' &\triangleq \textbf{arg}(e_0 , \rho , \kappa)
\end{aligned}
{% end %}

This rule is remarkably similar to the last post's rule, which is great! I'm not trying to overcomplicate this stuff, so I hope that things don't get needlessly crazy. Although, small spoiler for the next post, I will be implementing multi-arg functions, so this will change slightly! Sorry for making you think that this rule would never ever change!

We have now covered 100% of the syntax that can be found in our little language! But, there is a little more to do. Lets transition apply states!

## Apply Rules ##

As I alluded to before, there are 2 things that the machine uses to right itself, the control and the continuation. The Eval states are for checking the control, and the apply states are for checking the continuation. We have exhausted control, and now we must exhaust all types of continuations!


{% katex(block=true) %}
A \langle v , \rho , \sigma , \kappa \rangle
\leadsto
E \langle e_f , \rho_{\kappa} , \sigma , \kappa' \rangle \\
\begin{aligned}
\text{where }
\kappa &= \textbf{cond}(e_f , e_f , \rho_{\kappa} , \kappa') \\
v &= \texttt{\#f}
\end{aligned} \\
A \langle v , \rho , \sigma , \kappa \rangle
\leadsto
E \langle e_t , \rho_{\kappa} , \sigma , \kappa' \rangle \\
\begin{aligned}
\text{where }
\kappa &= \textbf{cond}(e_t , e_f , \rho_{\kappa} , \kappa') \\
v &\;≠ \texttt{\#f}
\end{aligned}
{% end %}

These are the final rules for dealing with conditionals. We refer to the value (which is the value of the condition) and check if it is equal to false. If so, we take the false branch. We 'take it' by just setting that branch to the control of the next state. It _is_ that easy! The opposite goes for `true`, if the value in the condition is simply 'not false', then we take the true branch.

(Aside: At the time of writing, it seems the rendering for ≠ is broken, but the false branch should have `v ≠ #f`)

Note the semantics here! Many languages have many different ideas of 'falsy' and 'truthy'. Python has a whole overridable `__bool__` function, and I don't want to get _near_ what JavaScript does. Scheme is simple. The only 'falsy' value is false. Everything else is truthy. Everything. Simple!

Its also important to 'reset' the environment. During the course of evaluating the condition, the environment may have changed. We don't want to use that environment while taking one of the resultant branches, which is why we stored the original environment in the continuation.

{% katex(block=true) %}
A \langle v , \rho , \sigma , \kappa \rangle
\leadsto
E \langle e , \rho_{\kappa} , \sigma , \kappa'' \rangle \\
\begin{aligned}
\text{where }
\kappa &= \textbf{arg}(e , \rho_{\kappa} , \kappa') \\
\kappa'' &\triangleq \textbf{fn}(v , \kappa')
\end{aligned} \\
%
A \langle v , \rho , \sigma , \kappa \rangle
\leadsto
E \langle e_b , \rho_{\lambda}' , \sigma' , \kappa' \rangle \\
\begin{aligned}
\text{where }
\kappa &= \textbf{fn}(((\lambda \; (x) \; e_b) , \rho_{\lambda}) , \kappa') \\
a &\triangleq alloc(\sigma) \\
\rho_{\lambda}' &\triangleq \rho_{\lambda}[x \mapsto a] \\
\sigma' &\triangleq \sigma[a \mapsto v]
\end{aligned}
{% end %}

These two rules are all we need to interpret our function calling syntax. In the first rule, we have finished evaluating the 'function' half of the two expressions, and move to evaluate the argument. Then in the next rule, we have completely evaluated both the function and the argument, and we call the function! These rules are also exceedingly similar to the rules from the previous post, they should not surprise.

I like to add this final rule, just to explicitly say 'this is the end':

{% katex(block=true) %}
A \langle \varsigma \rangle \leadsto A \langle \varsigma \rangle \\
\begin{aligned}
\text{where }
\kappa &= \textbf{mt}
\end{aligned}
{% end %}

Of course, this rule is vacuous, as without it, we would simply reach a stuck state in the same circumstance, and say 'thats all folks'. This way though, you can feel a little safer, having a slight distinction between 'stuck' and 'nothing left to do'.

# Example #

Lets evaluate a simple program utilizing our new features!

{% katex(block=true) %}
e_0 = ((λ \; (x) \; x) \;\; (\texttt{if} \; \texttt{\#f} \; 3 \; 12)) \\
\varsigma_0 = inj(e_0) = E\langle e_0 , \varnothing , \varnothing , \textbf{mt}\rangle \\
\varsigma_n = step(\varsigma_{n-1}) \\
\;\\
%
\varsigma_1 = E\langle (λ \; (x) \; x) , \varnothing , \varnothing  ,
				\textbf{arg}((\texttt{if} \; \texttt{\#f} \; 3 \; 12) ,
								\varnothing , \textbf{mt}) \rangle \\
\varsigma_2 = A\langle
				((λ \; (x) \; x) , \varnothing) , \varnothing , \varnothing ,
				\textbf{arg}((\texttt{if} \; \texttt{\#f} \; 3 \; 12) ,
								\varnothing , \textbf{mt})
				\rangle \\
\varsigma_3 = E\langle
				(\texttt{if} \; \texttt{\#f} \; 3 \; 12) , \varnothing , \varnothing ,
				\textbf{fn}(((λ \; (x) \; x) , \varnothing) , \textbf{mt})
				\rangle \\
\varsigma_4 = E\langle
				\texttt{\#f} , \varnothing , \varnothing ,
				\textbf{cond}(3 , 12 , \varnothing , \textbf{fn}(((λ \; (x) \; x) , \varnothing) , \textbf{mt}))
				\rangle \\
\varsigma_5 = A\langle
				\texttt{\#f} , \varnothing , \varnothing ,
				\textbf{cond}(3 , 12 , \varnothing , \textbf{fn}(((λ \; (x) \; x) , \varnothing) , \textbf{mt}))
				\rangle \\
\varsigma_6 = E\langle
				12 , \varnothing , \varnothing ,
				\textbf{fn}(((λ \; (x) \; x) , \varnothing) , \textbf{mt})
				\rangle \\
\varsigma_7 = A\langle
				12 , \varnothing , \varnothing ,
				\textbf{fn}(((λ \; (x) \; x) , \varnothing) , \textbf{mt})
				\rangle \\
\varsigma_8 = E\langle
				x , \{x : 0 \} , \{ 0 : 12 \} , \textbf{mt}
				\rangle \\
\varsigma_9 = A\langle
				12 , \{x : 0 \} , \{ 0 : 12 \} , \textbf{mt}
				\rangle
{% end %}

This example clearly shows the interchange between Eval and Apply states. You evaluate until you apply, and then you evaluate, and so on, until you reach a stuck or finished point (a fixpoint).

# Conclusion #

So in only these few short minutes we have added some quality-of-life features to our language, making it much more usable! The semantics grew a little in breadth and depth, but is now much more capable of supporting more advanced features.

This post will serve as a general template for this series. We take the machine we have, decide what to add, and then add it. Further than that, the addition of features is similarly patterned. You add syntax, then make sure the semantic domains support the syntax (i.e. the Val and Kont domains), and finally add transitions.

By utilizing this method, adding new features is simple. Also by utilizing this method, I can churn out blog posts until the sun dies! Just kidding, I have better things to do than eternally add features until we accidentally formalize Perl.

In the next post, I will be adding multi-arg functions, and a couple of other useful features. I hope to see you there!
