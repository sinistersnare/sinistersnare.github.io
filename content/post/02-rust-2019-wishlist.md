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
[Call for Rust 2019 Roadmap](https://blog.rust-lang.org/2018/12/06/call-for-rust-2019-roadmap-blogposts.html).
Thanks for reading!

I think Rust needs to focus on less flashy things for 2019. We have added a lot of great features since 1.0, but I think we need to address the warts that we have had for a long time. I will mostly echo sentiments from
[Jonathan Turner](https://www.jonathanturner.org/2018/12/the-fallow-year.html) (please read, its great!),
[Nathan Vegdahl](https://blog.cessen.com/post/2018_12_12_rust_2019_its_the_little_things), and many others in my 'fallow-year' sentiments. Overall, I think that compilation speed and type-level constants are the two most important issues to tackle. On top of that, I would like to see more ecosystem work to make embedded applications more feasible and easy to use. Finally, I would like a moratorium on syntactic sugar for 2019.

# The Compiler #

I think that 2019 could be a year that we grab a ladder for some of the higher-hanging fruit of Rust.
The compiler team has been heroic in their work since pre 1.0. Things like incremental builds, caching (through the likes of sscache), and using `cargo check` when you just need to see if it builds, have helped the community work faster. However, a longstanding bottleneck in compilation is the code we give to LLVM. As I understand it, we have been waiting on MIR to start work on this. I would love to see Rust improve its LLVM-IR codegen. Perhaps if we give LLVM less work to do, we can gain back a large chunk of time wasted.

On a personal note, my 2019 programming resolution is to start more serious work on compilers. I would love to help the compilers team on this effort! I hope 2019 can significantly improve the compilation story for Rust.

# Type-Level Constants #

This seems like a heavily requested feature in Rust. Many other posts have talked about this, so I will just leave it be. Type-level constants are high up on my Rust 2019 wishlist. I am not sure if type-level integers are enough, or we should be able to use any constant, but regardless, I have seen some great ideas that could use this feature.

# More Work On Embedded #

Rust on WASM has been really cool! It has also, as I understand it, helped the embedded folks too. I would like to see Rust start to _really_ compete with C in embedded in 2019. Even if we do not have _all_ the architectures, there are many places we can beat C in embedded. We can be _better_ in the platforms we support. Rust can provide a more streamlined introduction to embedded programming. We can provide an amazing catalogue of `no_std` libraries that can help an embedded programmer feel less daunted. We can provide a welcoming community that recommends hardware that best fits their need, with configuration and examples on how to get started.


# Slowdown on Sugar #

Finally, I would like to talk about my most important wish for Rust 2019. I would like to see Rust take a year to relax on syntactic sugar. Since 1.0, a lot of sugar has been added to Rust in the name of convenience. I think that we should have a moratorium on sugar to get an idea of what Rust feels like now. I think that we should only add as much sugar as is healthy. If we add more and more without stopping, we may not realize when we pass that point. After 2019, we should discuss where there are still painpoints in Rust, and figure the best way to alleviate that pain using as little sugar as possible.


# Conclusion #

Thank you so much for reading this! Rust is an amazing language already, I think that we should take a look at what we have accomplished, and plan ahead at a less break-neck speed for 2019, and decide more concretely what we truly need to keep Rust an easy to understand language to all people.
