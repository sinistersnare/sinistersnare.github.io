+++
slug = "code-review-contributor"
title = "Code Review: Contibutor's Side"
description = "How to be a good contributor"
date = 2021-07-05T12:15:00-05:00
draft = false
[taxonomies]
tags = ["Programming"]
[extra]
generate_toc = false
+++

Hi! This is a short and opinionated guide on how to be a model contributor to a codebase. Ideally, a project would adopt this methodology. These are not tips on how to get a reviewer to like you (that's [here](https://mtlynch.io/code-review-love/) and its a wonderful article!), but a system for how to be a contributor to a codebase that adopts this ethos.

I will also have a second post, from the reviewers side, that should complement this entry. Both posts will form a system of rules for small to moderate size codebases for teams with a few up to around 10 contributors. I have used this system and I find it effective.

# The Problem #

Many codebases start with only a single contributor or two hacking away quickly. This is fine and great, but when it comes time to scale up, getting developers into the groove and making sure that knowledge is spread throughout the team becomes more and more important. The [bus factor](https://en.wikipedia.org/wiki/Bus_factor) of a team needs to stay high, and I think that my system is an easy way to keep that number up, at worst 2, but as time continues it increases.

A simple review in this system is something like:

1. Contributor creates the contribution
2. Reviewer does a short line-by-line code review, scanning for any obvious deficiencies.
3. Reviewer leaves line comments on smaller issues, or general comments for larger ideas
4. Contributor addresses feedback
5. Reviewer ensures that changes were addressed
6. Reviewer tests the code locally, ensuring that everything actually works
7. Return to step 3 if there are issues
8. Merge

This post will address all steps involving the contributor.

# Creating a Contribution #

This is hopefully this most time consuming part of the process. Creating the contribution involves writing the code, testing, documenting, and ensuring that your code stays up to date with the primary branch of your repository. This step starts as soon as you accept your tasking, and ideate your solution.

One thing I like to do as I write my code is to keep personal notes on what I've done. If I'm moving around a lot in the codebase, I write a little note saying what I have accomplished that is outward facing. Once I have finished writing the code, I consult my notes, and do a quick scan of the diff. I form a list of the high level changes made.

It is time to test! Ensure that your task is actually finished before you send it up to be reviewed. Hopefully you have a good set of tests, but at least you should make sure your code compiles, and you can see the changes you made (in some way you can check). I would also write down the steps you took to test your code from a fresh pull of your branch. That way, your reviewer can easily know what has to be done to ensure that your changes work.

Finally, I do a _self code review_. I go through my diff myself to ensure that my reviewer wont have to deal with any cruft. Any files that snuck into the git commit, any typos in comments, any curse words removed from TODOs, etc. In a perfect scenario, you would catch all of the issues _yourself_, and all your reviewer would have to do is test it themself, and hit `merge`.

That is the key, that you should make your reviewer's life _really easy_. They should be a _sanity check_, not the code-police, or an adversary. You two (or more) will work together to make sure that the primary branch of your code stays building and clean. But you, as the primary author, should be putting in the most effort into this short lived relationship.

# Choosing a Reviewer #

It is your responsibility to find a reviewer. In my experience we have had a few different ways of choosing. At one point, we had a wheel with everyone's names on it, and we spun it! Whoever it landed on got a message on slack, asking if they were available for review. If not, the wheel gets spun again!

Other times, you may have an idea for who 'owns' the bit of code you are working on. Someone who recently wrote that module, or just had a similar contribution accepted for example. You could outright ask them if they are interested in a review, and that their experience may be helpful in the process.

If you are lucky, someone will volunteer for you, making your life easier. If you think that your contribution is particularly large or wide reaching, feel free to ask for multiple reviews. One goal of the review is to make sure that multiple people are 'in the loop' and understand any given part of the codebase. This way, the aforementioned bus-factor is higher. But you probably do not need multiple reviewers for the bog-standard sized contributions that you are likely to make -- you cant always rewrite the whole codebase in Rust!

# Addressing Feedback #

So, nobody is a perfect developer. You will write code that you may think is fine, but others may have objections to. That is simply a part of our art form. Or perhaps you didn't catch some typo, or didn't apply some formatting somewhere. It is not your failure for missing things, it happens. You should not be _dependent_ on a review, but it exists for a reason. It exists for many reasons even, but this time it's to catch mistakes.

After the reviewer has finished a round of comments, I like to address them one by one. Out of the comments, I form a short-lived checklist of what I should do, and start tackling them one by one. As I address them, I check them off my list. If there needs to be further clarification, I reply to the comment asking for clarification. Usually, reviewers are getting lots of emails, so I also ping them on Slack (or however you regularly communicate with your team) mentioning that I asked for some clarification on a comment.

After everything is resolved, I push up my changes, and give a 'done!' comment on every thing that I resolved. Then I ping my reviewer stating that I have finished addressing their comments. This is the signal that it is time for your teammate to switch back into review mode. If they forget about reviewing, you can ping them after an appropriate amount of time, given the timeline that the contribution needs to be merged.

Many code review systems give comments the ability to be _resolved_. ***DO NOT RESOLVE COMMENTS!*** It is the person who wrote the comment's job to resolve their own comments. Just because you think you addressed feedback enough does not mean your reviewer will agree. If they are lagging and their resolutions are blocking a merge, give them a nudge via your communication channel of choice. A nice "Hey, do you mind resolving your comments on my contribution if you think its adequate?" should be fine.

# Merging #

Hopefully, if everything has been resolved, the reviewer will be content and merge your contribution! This is something you should give consent to, in my opinion. I don't like it when people merge my code without my final 'yes please hit the button'. But it is the reviewers job to merge it. It is their say that allows your code into the codebase.

# Joy #

Now that you have completed a successful code review, make sure to give back and review your fellow team members' contributions! I love reviewing, but that is a topic for another post!


## Useful Reading ##

Here are some articles that I have liked on the topic of reviews:

* [How to Make Your Code Reviewer Fall in Love with You](https://mtlynch.io/code-review-love/)
* [How to Review Code as a Junior Developer](https://medium.com/pinterest-engineering/how-to-review-code-as-a-junior-developer-10ffb7846958)
