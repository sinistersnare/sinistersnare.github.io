+++
slug = "rust-wishlist-2019"
title = "Sinistersnare's Rust 2019 Wishlist"
description = "Finding and Strengthening Rust's Weaknesses"
date = 2018-12-12T08:10:44-05:00
draft = false
tags = ["Rust"]
categories = ["Software"]
+++

This is my response to the
{{ elink(text="Call for Rust 2019 Roadmap", to="https://blog.rust-lang.org/2018/12/06/call-for-rust-2019-roadmap-blogposts.html") }}.
Thanks for reading!

Rust needs to focus on less glamorous features in 2019. We have added a lot of great features since 1.0, but we need to address the warts that we have had for a long time. I mostly echo sentiments from
{{ elink(text="Jonathan Turner", to="https://www.jonathanturner.org/2018/12/the-fallow-year.html") }},
{{ elink(text="Nathan Vegdahl", to="https://blog.cessen.com/post/2018_12_12_rust_2019_its_the_little_things") }}, and many others in my 'fallow-year' sentiments. Overall, Compilation speed and generic constants are my two most wished-for features. On top of that, I would like to see more ecosystem work to make embedded applications more feasible and easy to use. Finally, Rust needs a moratorium on adding syntactic sugar for 2019.

# The Compiler #

The coming year should be us grabbing a ladder, reaching for some of the higher-hanging fruit of Rust issues. The compiler team has been heroic in their work since the beginning. Things like incremental builds, caching (through the likes of sscache), and using `cargo check` when you just need to see if it builds, have helped the community work faster. However, a longstanding bottleneck in compilation is the code we give to LLVM. As I understand it, we have been waiting on MIR to start work on this. I would love to see Rust improve its LLVM-IR codegen. Perhaps if we give LLVM less work to do, we can gain back a large chunk of time wasted.

On a personal note, my 2019 programming resolution is to start more serious work on compilers. I would love to help the compilers team on this effort! I hope 2019 can significantly improve the compilation story for Rust.

# Generic Constants #

This seems like a heavily requested feature in Rust. Many other posts have talked about this, so I will just leave it be. Generic constants are high up on my Rust 2019 wishlist. I am not sure if type-level integers are enough, or we should be able to use any constant. Regardless, I have seen some great ideas that could use this feature.

# More Work On Embedded #

Rust on WASM has been really cool! It has also, as I understand it, helped the embedded folks too. I would like to see Rust start to _really_ compete with C in embedded in 2019. Even if we do not have _all_ the architectures, there are many places we can beat C in embedded. We can be _better_ in the platforms that we support. Rust can provide a more streamlined introduction to embedded programming. We can provide an amazing catalogue of `no_std` libraries, unparalleled by C. We should start with a comprehensive analysis of where exactly we _are_ in terms of embedded-Rust. We can provide guarantees that only the most hardcore C users strive for. We should lean into this space, it could be a big boon for Rust adoption!


# Slowdown on Sugar #

Finally, I would like to talk about my most personal wish for Rust in 2019. Rust needs to relax on adding syntactic sugar in the coming year. Since 1.0, a lot of sugar has been added to Rust in the name of convenience. We need to get an idea of what Rust feels like now. Is Rust still too pointy in some places? Or does it simply feel like that because we haven't gotten used to the recently added sugar yet? If we place a moratorium on adding sugar to Rust for the year, we can truly direct ourselves to the most pressing warts.

Personally, I am a conservative guy when it comes to syntax. I believe that if we keep adding sugar, we will boil ourselves, much like we do to a frog. We should regularly pause and take stock of where we are, to refocus our needs.


# Conclusion #

Thank you so much for reading this! Rust is an amazing language, and has been since I started using it in 2013. The 2019 year will create the springboard we need to have an amazing Rust 2021 edition.
