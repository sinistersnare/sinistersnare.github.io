+++
slug = "crafting-semantics-0"
title = "Crafting Semantics 0: Introduction"
description = "What Are Semantics?"
date = 2021-01-05T12:15:00-05:00
draft = false
[taxonomies]
tags = ["PLT", "Computer Science", "Semantics", "Crafting Semantics"]
[extra]
generate_toc = false
+++

# Introduction #

Hi, this is the first post on a series about creating semantics for a programming language. We will be using Scheme as a reference point, and slowly building more and more features for it.

We will be using '_computer science notation_' (specifically an operational semantics) for every post. We wont be implementing these semantics formally in a language, but you could quite easily if you wanted to.

If you want to get started in Programming Language Theory, and want to understand how to define a programming language formally, this is the series for you! If you want to understand abstract machines better, this is the series for you!

# What does all of this mean? #

We will be building a programming language! But instead of writing a parser, interpreter, compiler, etc. for it, we will simply define it mathematically. When you have a rigorously defined semantics, it should be quite easy to make a 'real' interpreter out of it.

For a mostly 'finished' product, I have semantics for many forms of Scheme [here in a Git repository](https://github.com/sinistersnare/aams/blob/master/latex/formalism.pdf). Also included in that repo are implementations in Racket and Rust. We may or may not deviate from it as I see fit, but that will be what the semantics will look like. If this series goes far enough, I may delve into the abstract semantics section of that document, and talk about static analysis!

# Semantics #

The semantics of a language are how its syntax is interpreted by a reader (either human or machine). Like many things in Programming Language Theory, we have stolen this term from the field of linguistics (thanks!). Computer scientists use semantics to study programming languages. You can learn more about them in my ['Abstract Machines' post](@/post/06-abstract-machines.md).

# Pre-Requisites #

There will be no 'programming' in this series, only notation. I will try to explain all notation as it is first used.

All I ask is that you are interested in the topic at hand!

# Let's begin! #

We will start after that post, with a CESK machine based on the lambda calculus. See [The next post](@/post/09-crafting-semantics-1.md) for the exciting start to this series!



