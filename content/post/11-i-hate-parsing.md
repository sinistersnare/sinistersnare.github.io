+++
slug = "i-hate-parsing"
title = "I Hate Parsing"
description = "Who needs it anyway"
date = 2021-01-15T12:15:00-05:00
draft = true
[taxonomies]
tags = ["PLT", "Computer Science", "Pet-Peeves"]
[extra]
generate_toc = false
+++

People talk about parsing too much! Its boring! Its tedious to get right, and it doesnt even produce anything special.

The best part of compilation is _after_ you have your AST. Turning the AST into an IR, or further into machine code. And performing optimizations! And after that, working on runtime stuff, like garbage collection, JIT, or runtime libraries. Thats the kind of fun stuff

I suggest that every compilers class just use a Lisp! Only the most basic of parsing needed, and you can focus on the cool/interesting parts of PL: transformations, and semantics.

After you hook people into how cool the field is, then you show them the boring side of parsing. Parsing just gets really annoying when you realize how much error recovery you have to do to make it somewhat usable.

Anyways, thats my rant for the day, maybe I should just use Twitter.

