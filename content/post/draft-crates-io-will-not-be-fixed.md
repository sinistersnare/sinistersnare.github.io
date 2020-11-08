+++
slug = "crates-io-will-not-be-fixed"
title = "Crates.io Will Not Be 'Fixed'"
description = "And stop asking to fix it."
date = 2020-08-15
draft = true
[extra]
generate_toc = true
[taxonomies]
tags = ["Rust", "Engineering", "Pet-Peeves", "Package-Management"]
+++

Okay, I know that was a strong title, but this is a personal blog, I can be strongly opinioned!

The thing is, people complain about squatting all the time, but they dont offer any
realy ***new*** discussion. Lately, people have been mentioning 'maybe there needs to be a
competing registry to Crates.io.' I think that is the direction of the solution.

This post hopes to be a review of current policy, attempts to resolve, potential solutions,
and my opinions of everything along the way.

# Squatting #

As far as I know, there hasn't been any truly malicious squatting done on crates.io.
Most recently, there has been {{ elink(text="this Reddit post" , to = "https://www.reddit.com/r/rust/comments/gmu6y1") }}.
Squatters historically have said 'just message me to get the crate'. I am
generally not a fan of Wild-West-Justice, where people make their own rules.
There should be an official policy that denies this behavior.

The Rust community is right to discuss this often, especially given the core teams (implied)
repeated stance of 'no stance' without an argument either way.

# The Rust Team's Official Position #

The most recent official thing I can find is {{ elink(text="This experimental RFC" , to="https://github.com/rust-lang/rfcs/pull/2614") }} by a a member of the Rust {{ elink(text="Library team", to="https://www.rust-lang.org/governance/teams/library") }}, not a {{ elink(text="Crates.io team", to="https://www.rust-lang.org/governance/teams/crates-io") }} member. Also, it is 2 years old and there is no end in sight. \<TODO: READ THIS AND COMMENTS AND COMMENT ON IT>

On {{ elink(text="This recent Reddit post", to="https://www.reddit.com/r/rust/comments/gmu6y1/") }},
a moderator locked the post, citing that the 'crates.io maintainers appear to be aware of the issue'.
However, the amount of official communication we have on the issue is minimal. Kibwen is not on any
official Rust team as I understand it, but he certainly has been around for a long time, and
members of the {{ elink(text="Moderation team" , to="https://www.rust-lang.org/governance/teams/moderation") }} are moderators of the Rust subreddit. So it is safe to say that he knows what
he is talking about, and that the relevant teams are silent on purpose on the issue.
\<TODO does Kibwens credentials matter here? Or is it just rambling?>

The most official thing I can find is from way back in 2014, when Crates.io was first
introduced. In {{ elink(text = "this post" , to = "https://internals.rust-lang.org/t/1041") }},
The Rust team (whom Steve is speaking on behalf of) explicitly admits defeat
(before Crates.io was even launched!) on the topic of squatting.

Apart from these, I have been remiss to find any recent official communication. It seems that the
Rust team is perfectly happy to let this issue go unresolved.
Perhaps they don't even deign it an issue.
That is why we need to do all the work as a community, with minimal cooperation from the Rust team.
They are uninterested in working on this problem.

# Prior Community Discussion #

{{ elink(text="There", to="https://www.reddit.com/r/rust/comments/9dole9/") }} {{ elink(text="Has", to="https://internals.rust-lang.org/t/9291") }} {{ elink(text="Been", to="https://internals.rust-lang.org/t/11341") }} {{ elink(text="Many", to="https://internals.rust-lang.org/t/8628") }} attempts
to patch up this apparent hole in Crates.io. These posts offer many
different solutions, but I fear that none are viable, or even really fix the problem.

Solutions range from using a discord-like tag to crates, to simply having (up to 3!) someone(s) that
hopefully everyone trusts' to decide on squatting.
I will be going over these solutions in a couple sections.

# What Python Does #

No namespacing. People dont really discuss this. Mostly because there are much worse
things about the python packaging ecosystem. So at the very least, we can consider
ourselves very blessed that this is the communities main issue with crates.io!

There is {{ elink(text="a PEP" , to="https://www.python.org/dev/peps/pep-0541/") }} (Python
Enhancement Proposal) that attempts to solve this though,
I am not sure of any impact that it has had.

That PEP does mention that the current Crates.io policy though is doomed to fail:

> The original approach was to hope for the best and solve issues as they arise without written policy. This is not sustainable.

If Crates.io wants to be bigger, better, and easier to use platform than PyPI,
it should solve this problem.
If Rust packaging wants to improve the state of the art, than we need to solve this problem.

# What Java Does #

Java supports namespacing, and people generally get along pretty well there.

A search of
{{ elink(text="'toml' on mvnrepository" , to="https://mvnrepository.com/search?q=toml") }} gives
us a plethora of options. Many are simply named 'toml' or 'toml4j'. Which is the best?
Well, we can see which has the most recent release, or maybe whichever has the most usages?

I would say that this is the main drawback of namespacing, but then again, even if they all had
different names, would it be any easier? Why should I assume that the one called `toml` is the
best?

In any case, namespacing or not, research needs to be done to figure the best choice of
any particular library, a name is not good enough.

# Potential Solutions #

Here I go through some potential solutions and offer biting critiques.

## Discord-like Tags ##

This solution would append a random string to the end of EVERY package.

No more

`serde = "*"`

now we do

`serde#foo9 = "*"`

This would just make the package using experience dreadful for everyone,
even packages that are 'uncontested', so to speak.

## Validate Each Package by an Administrator ##

Not really scalable in my opinion, and requires administrators to somehow
verify that crates are authentic. This could be easily scammed.

## Ability to 'report' crates ##

This also is very hard to moderate, for the same reasons as pre-validation.

## Crate Name Transfer ##

The solution proposed by the Rust Library team.

## Namespacing ##

this way everyone can have whatever package name they want.
This has problems in that now the 'unique' part is the organization/package
name. People can still squat on an organization name like 'rustlanguage',
which doesnt really solve the security angle. But at least we
can have as many `http` crates as we want!

\<TODO: There are probably some other solutions that I should address>

# What Good is Namespacing? #

Well, I would say its good for organization, not for naming. Much like how GitHub organizations
are for putting projects of like-quality together, namespaced libraries can do the same.

Won't people just squat organization names then??? \<Address This>

# Why Not Just Add Namespacing to Crates.io? #

Cuz we started with a default namespace, itll just confuse. \<TODO>.

I dont think that mixing flat and namespaced packages are a good idea.

# Namespacing Downsides #

As I said before, the malicious squatting will simply move from
package names to organization names. Moderation will always be needed,
but I think its much harder to be a malicious organization than a
malicious single package.

# How Would This Be Implemented? #

I think that two things would need to happen
(I havent worked on Cargo or Crates.io so I could be wrong! \<write more about this?>)

1. Change Cargo to support some arbitrary key(s) to search for a package on a given registry.
2. Make it ***much*** easier to use registries that are not crates.io.
2. Create a registry that takes a namespace and a package name, instead of only the latter.

The ship is sailed on Crates.io supporting namespaces. The migration would just be _wild_
in my opinion.

On Steve's post from 2014, he claims that there are issues to do with clashed names.
For example, if you installed 2 libraries called `http`, how would you know which is the
one you are referencing? In 2020, Cargo already renames libraries for you though!
Using the {{ elink(text="rename-dependency" to="https://github.com/rust-lang/cargo/blob/5845464cf92a348f95dc6b43133c017c37fcb684/src/doc/src/reference/unstable.md#rename-dependency")}} Cargo feature, you can resolve clashed names. All we need is to require that to be
explicitly defined for both packages whenever there is a collision, so there is an explicit
resolution to the problem.

# Conclusion #

If a competing service is created, please dont use its TLD in its name please, that always annoys me.
This is a pet-peeves tagged post, so I can say my personal opinion!

\<TODO: maybe need to address the detractors of namespacing more? Like 'just rename it, be creative!'>
