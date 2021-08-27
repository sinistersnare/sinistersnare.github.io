+++
title = "My Work"
draft = false
slug = "work"
[extra]
no_header = true
+++

Here is a list of things that I have done. Including papers published and open source projects I am at least a little proud of.

# Papers #

* So You Want To Analyze Scheme Programs With Datalog?
	* Me et al. wrote a small Scheme AAM CFA and figured we could get accepted at a wokrshop for it. My first ever paper! Can only go up from here!
	* [Scheme Workshop 2021](https://icfp21.sigplan.org/home/scheme-2021#program)
	* [ArXiv](https://arxiv.org/abs/2107.12909)
	* Presentation video (To Be Posted)
	* [Slides](/static/SW2021Slides.pdf) + [(Rough) Script](/static/SW2021Script.pdf)

# Open Source Projects #

## {{ elink(text="The Robson Traversal", to="https://github.com/sinistersnare/Robson") }}

This _tree traversal algorithm_ is quite interesting. It is capable of pre-, in-, and post-order traversals, all while maintaining `O(1)` space consumption!

I have a blog post in the works detailing this algorithm. Until then, check out my repository for it!

## {{ elink(text="SinScheme", to="https://github.com/sinistersnare/SinScheme") }}

A not-standard-compliant Scheme implementation, written in Racket with a C++ runtime. It compiles to LLVM, and uses the Boehm GC for... GC.

It uses a nano-pass style architecture and continuation-passing style to ensure tail-calls.
I also plan on adding optimizations to it by utilizing [Control Flow Analysis](https://en.wikipedia.org/wiki/Control_flow_analysis) (Wow! What a depressing Wikipedia page. Maybe I should write a post on CFA's too!)

It Should _not_ be used by your company, but I would love to keep working on it, and add cool features! I also hope to write about its compilation model, and the theory under it, in this blog. Let me know if you want to read such a blog post!

## {{ elink(text="Royale With Cheese", to="https://github.com/sinistersnare/RoyaleWithCheese") }}

A game I wrote in Unity for a class. It uses runtime nav-meshes, which were unavailable in Unity when I wrote this. It was quite a bit of fun to get it working!

Currently this is not open sourced, but I would like to open-source it soon. If you would like to see its code, let me know!

## {{ elink(text="A Rusty `.DS_Store` Parser", to="https://github.com/sinistersnare/ds_store") }}

The .DS_Store file is quite interesting! It is how the Finder application on MacOS keeps track of files. I wrote a parser for it in Rust, so you can learn about a directories contents, through the inspection of this single file. It is a bona-fide Rust library, available on [crates.io](https://crates.io/crates/ds_store).
