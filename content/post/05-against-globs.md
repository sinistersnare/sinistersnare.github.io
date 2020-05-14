+++
slug = "against-globs"
title = "Against Glob Imports"
description = "Make your code easy to read."
date = 2019-12-31T12:00:00-05:00
draft = false
tags = ["Rust", "Python", "Engineering", "Pet-Peeves"]
categories = ["Software"]
+++

NOTE: the publish date is wrong, because I cant get Hugo to render a post from 2020...
Zola time???

Hi, I hate glob imports. When I see them it actively hurts my understanding of code.
I know they may seem useful, but I think that, overall, they are an anti-pattern.

## Globs in tutorials ##

Tutorials are supposed to be jumping off points! They should give the user enough information
to be a little dangerous. They should encourage the user to keep learning after the tutorial
is finised. When I find myself reading tutorials, many look like this
(from the wonderful [Tantivy Documentation](https://tantivy-search.github.io/examples/basic_search.html)):

```rust
#[macro_use]
extern crate tantivy;
use tantivy::collector::TopDocs;
use tantivy::query::QueryParser;
use tantivy::schema::*;
use tantivy::Index;
use tantivy::ReloadPolicy;
use tempdir::TempDir;

fn main() -> tantivy::Result<()> {
    ... // rest of tutorial
}
```

< why its bad here >

Many tutorials / example code blocks start this way (hopefully they include the imports at all!
But thats a whole 'nother rant! Thanks for including them in the first place, Tantivy)

I dont mean to pick on Tantivy, a very large percentage of tutorial code I have seen uses globs.
Tantivy was wonderful to work with, a great piece of software!

## Globs in preludes ##

Preludes are supposed to only have 'invisible imports' IMO, not real structs. Those should always
be explicitly imported.

### Invisible Imports ###

i.e. Extension ("`FooExt`") traits, does this need a whole section? YES. WRITE MOAR

## Globs in 'real code' ##

Rustdoc is a great tool, and I love using it. Glob imports make it harder to use it. Should this be
in the overall appeal? Its not directly related to 'real code'.

## Conclusion ##

Globs should only be used in preludes. BUT preludes should only contain extension traits.
But again, that topic is a whole 'nother post about Rust anti-patterns.
