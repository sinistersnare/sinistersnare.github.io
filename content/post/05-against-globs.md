+++
slug = "against-globs"
title = "Against Glob Imports"
description = "Make your code easy to read."
date = 2020-08-14
draft = false
[taxonomies]
tags = ["Rust", "Python", "Java", "Engineering", "Pet-Peeves"]
+++

Hi, I hate glob imports. When I see them it actively hurts my understanding of code.
I know they may seem useful, but I think that, overall, they are an anti-pattern.

# Reading Code #

Using globs is a detriment to reading code. If I see some code using a type I have not seen
before, I go to the imports to find where it is defined, and then look it up in
{{ elink(text="docs.rs", to="https://docs.rs") }} or the std-docs.
If I cant find the item thanks to a glob, then it makes it an annoying game of 'find the type'.

# Example #

Tutorials are supposed to be jumping off points! They should give the user enough information
to be a little dangerous. They should encourage the user to keep learning after the tutorial
is finished. When I find myself reading tutorials, many look like this
(from the wonderful {{ elink(to="https://tantivy-search.github.io/examples/basic_search.html", text="Tantivy Documentation") }}):

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

This is not a more egregious example, simply the one I most recently faced.

The first thing I do when reading a tutorial is scan the imports. When I see the glob here,
I know its going to cause an issue for me. What context will I need this import in my own code?
Is it just traits I am importing? Or important structs/enums that I will need?

Many tutorials / example code blocks start this way (hopefully they include the imports at all!
But thats a whole 'nother rant! Thanks for including them in the first place, Tantivy)

I dont mean to pick on Tantivy, a very large percentage of tutorial code I have seen uses globs.
Tantivy was wonderful to work with, a great piece of software!

I have the same problem in Python code. When I code in Java, I configure my
import-formatter to expand all glob-imports. But reading tutorial Java code
has the same issue.

# Globs in preludes #

Preludes should be the only place that globs are used. Preludes are for, in my opinion,
extension traits, and invisible traits that will not be named in the program otherwise.

Preludes are a very priveledged thing, and you should think twice about adding one to your
library. It may be easier to simply

# Conclusion #

Code is only written once, and it is read countless times after. Just spend the few minutes
to write out the imports, make future you, and future readers live's easier.

Tutorials should not use globs. Production code should not use globs.
The only exception I find is for preludes, and preludes should be used _extremely_ sparingly.
