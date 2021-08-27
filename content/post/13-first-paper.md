+++
slug = "my-first-paper"
title = "My First Paper"
description = "My experience with the work and the writing"
date = 2021-07-04T12:15:00-05:00
draft = true
[taxonomies]
tags = ["PLT", "Computer Science"]
[extra]
generate_toc = false
+++

I recently submitted my first academic paper. It was a bit of a whirlwind experience and I wanted to write about it. We submitted to [Scheme Workshop](http://schemeworkshop.org/) 2021, which has an admittedly low barrier of entry. It is not 'real research', in my opinion, but I think it was good, and Im glad I helped write it. I am writing this after the paper has been submitted, but before it has been accepted. I don't think I can talk about it, so I may just not publish this until then.

We submitted "So You Want to Analyze Scheme Programs With Datalog?", by Silverman, Sun, Micinski, and Gilray. In it, we describe an m-CFA AAM in Soufflé for a larger subset of Scheme programs than usually shown in papers.

This post is me decompressing from the experience, and trying to reflect on what happened, what we could have done better, and what I want to do more of.

# The Idea #

Tom Gilray had the idea at first. Most papers showcasing AAMs, CFAs, or analyses use a significant subset of a useful language. Tom believes that a good analyses is actually of a higher level IR, and not as low as possible, such as λ-calculus or CPS programs. Papers such as Might's m-CFA, the AAM paper, or really any CFA paper, use subsets of Scheme that gloss over interesting bits that would help with real-world implementations. His plan was to write an analysis in Soufflé for a more full-featured Scheme subset, and describe what things these papers do not.

So next, it was me and Yihao. Yihao has more experience than me, having 2 years on me in the research-sphere from his masters progarm. We have both just finished our first year as PhD students though, so this would be a great opportunity to get some writing experience and spend some time to _really_ write an AAM from scratch.

Before last semester, I had spent a significant amount of time [writing AAMs in Racket and Rust](https://github.com/sinistersnare/aams/). However, Datalog is a weird language comparatively, so I had not gotten around to doing one in it. Yihao has more Datalog experience than me, and his [prior paper](https://arxiv.org/abs/2101.04718) is a Datalog based system for reverse engineering work. I had written a bunch of operational semantics for AAMs, including m-CFA with P4F, so we would simply translate that to Datalog.

Originally, Tom had planned to have one of his students write with us, but instead the work was left to us two. The main catch was that we had the meeting with Tom on June 10th, and the Scheme Workshop deadline was on the 26th.

# Starting The work #

Naturally with such an impending deadline I waited a week to truly start. Yihao luckily is a better student so he got some code written before I started properly on the 19th. However, that was practically a version 0.01 from where we ended up. So we had 8 days to create the AAM, evalaute it, and write about it. After a week, we got an extension for anothe week, so 15 days total. We had that long to go from practically 0 to a full paper.

Sadly, the university had stopped giving out desks for PhD students due to the pandemic. The place we chose to work was at the library. Sadly though, it closed at 8pm each day, and on weekends only opened at noon. At the ends of the nights, we had to find another spot, sometimes one of our places or a couple desks that should have been in a locked room somewhere on campus. These unideal conditions certainly made the work more trouble than it could have been.

To be honest, 3 weeks ago, we were not as strong in this as we should have been. The two of us had a lot of discussions on how things should work, from both a Datalog and semantic perspective. There were some spots that we had to stand at a white board and go through some examples step by step with a machine in our heads to figure out proper procedure. Overall it was super helpful. I love white-boarding stuff out, and I'm excited to get an office so I can get a big whiteboard to mess around on.

Our disagreements were pretty heated, and eventually we both had an implementation we were working on semi-separately. Mostly the disagreements were how we should represent our data in the Soufflé implementation, so we forked off but still worked concurrently, sharing ideas. After a few days apart, we went with my implementation... Probably because Yihao was nice and acquiesced because I am obstinate.

After the first week, we thought we had the coding done, but Yihao noticed that the worst-case generator that he had written was not giving expected results. This continued to be a problem up until the end, and was one of the most complicated sections of the paper in the end. Im a bit sad to say I still dont fully understand it, Yihao remarked to me that he spent 3 days of staring at the problem to understand it. If it turns out that our implementation was simply wrong and it should have worked originally, I would not be surprised. But, Yihao is a super smart dude, so I'll believe him!

Anyway, the second week was vital to us, and we cleaned up the code a lot, got a better understanding of the key issues in the implementation (which made the writing easier), and had more time to evaluate the Soufflé implementation. All that was left was the writing.

# Writing it out #

This was my first 'real' academic paper that I have written, so it's probably bad, unintelligable, and useless. Kris seems to like it, which gives me some hope, but I dont have the experience to give myself any hope. I started by writing out the background section, and writing a tiny bit of prose for the operational semantics section. I also wrote a little for the Datalog Implementation section. I did not want to write the introduction, because it seemed too important.

My writing felt _so_ blog-posty. So informal, high level without much explanation, and without examples. Kris eventually almost completely rewrote the background section. I think he kept my writing for a single subsection, one where I give an example. I actually copied (renaming variables) from a dissertation I was reading for the paper, so it was not a good example from my head! Thanks Olin Shivers!

Anyway, Kris wrote the abstract, introduction, background, and conclusion. I wrote the operational semantics and datalog sections. Yihao and I sat on a call together (I was out of town) on the deadline night to punch up the prose a bit. Yihao did almost all of the work on the evaluation section, including writing the worst-case generator, and the first pass on the prose. We worked together to get it up to snuff grammatically and such (English is not his first language, but the writing was really good. Just needed some touch ups). I think the paper is good, but also probably bad.

I really want to write an entire paper myself, and not be killed by a tight deadline. At times, I felt like I could not write. Im a bit too antsy, so I would be constantly shifting to the code to look at it, or procrastinating on social media. I think writing 0.5 pages a day is a good rate on average, and I didnt really have that. The total amount of writing we have on this paper is about 6 pages on a standard 2-column research paper.

I also wrote all of the LaTeX for the operational semantics, which was fun. We mostly lifted them from my other work (as I noted before), but I rewrote them, sectioned them off into figures, and made changes for context and stuff like that. It was pretty fun! I also (was told to) split the sections into files so we could more easily work on them without possible merge conflicts. Its easier to say "I have a lock on section 3 right now", instead of "try not to edit lines N through M please".

# More Retrospective #

I generally dislike remote communication. Yihao and I did our best work sitting right next to eachother, and I hope that continues. One of the reasons I left my old job to come back to school was the amount of the team splitting off to work in other offices. For a day job with easy requirements it was not too bad, but this was hard stuff we were doing. It was good to sit next to eachother and think out loud, and take breaks and get lunch/dinner, and mess around. That's stuff you cant get online. I consider myself kinda weird, when most of my contemporaries embrace remote work and all that, I really love the office environment. I think I would prefer a mix really, where I would be in the office most days, but still would be able to WFH when I want, during times of just churning out code alone, or when I have a doctors appointment in the middle of the day. Anyway, I digress.

As I said before, I want to give myself more time. We had a _very tight_ deadline for this paper, and luckily, with the low barrier we are presuming, we will likely get accepted. However, I dont think this quality of work would fly for a major conference, so I need to step it up. We have ideas for what to work on next, and I am raring to go.

One thing I want to try next is to take notes throughout the process. Notes only for me, but for which I can remember the little things that come about and maybe get thrown away, or anything like that. I can vaguely recall great ideas, great bug-fix-eureka-moments, and ideas for the future that are now only accessible through a random thought crossing my mind. I hope that if I take notes through the process, maybe I can review them when writing a post such as this, and the ideas could be taken up from there.

One thing I want to do next time is when we first start having the idea of a paper and begin work on it

# Conclusion #

My first paper is done! If it gets rejected, I dont think I will mind much, because the experience of learning for it, and writing it, was very rewarding. Even if it is rejected, we are going to build on this machine to do 'real research' soon, trying to analyze language features that people have been too scared to analyze so far.
