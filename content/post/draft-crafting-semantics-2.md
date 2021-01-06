+++
slug = "crafting-semantics-2"
title = "Crafting Semantics 2: Basic Features"
description = "Numbers, conditionals, insanity!"
date = 2021-01-07T12:15:00-05:00
draft = true
[taxonomies]
tags = ["PLT", "Computer Science", "Semantics", "Crafting Semantics"]
[extra]
generate_toc = false
+++

Its important to understand that even though we call some of the domains 'Env', 'Store', or 'Continuation', we can defined them _hoewver we want_. If we wanted, we could say that there are only the lowercase english letters for variables, and use an array of size 26 to define the environment, instead of a mapping function. We could use a contiguous list instead of a linked list for the Kontinuation part, which would obviate the `mt` continuation.

I am only giving some straightforward implementations for a simple language like the lambda calculus or Scheme. In your own semantics for you own wacky language, I want you to go _wild_ when defining your store.


