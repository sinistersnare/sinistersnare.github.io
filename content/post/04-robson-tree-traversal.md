+++
slug = "robson-traversal"
title = "The Robson Tree Traversal"
description = "Traversing Trees, The Hard Way."
date = 2019-12-01T08:10:44-05:00
draft = false
tags = ["Data-Structures", "Algorithms", "Trees"]
categories = ["Software"]
+++

# THIS IS A DRAFT #

Hiya, this is a draft! Please read and give me feedback! Thanks!

## TODO ##

* make outbound links open in new tab.
* Make sure Table of Contents is correct when post is over
* Add pictures of tree's being traversed!!!
    * Create pictures showing the traversal happening.
* Useless StackOverflow posts:
    * https://stackoverflow.com/questions/31323283
    * https://stackoverflow.com/questions/22288074


# Introduction #

In the last post, we discussed a couple interesting ways to traverse a tree.
In this post, we will discuss another novel tree traversal algorithm,
which sort of combines the unique qualities of the previous two.
The Robson traversal operates with a cool ***constant*** space!

The final code is on [github](https://github.com/sinistersnare/robson),
but I encourage you to read this post!
The table of contents may help for people that may want to skip a bit :)

# Table of Contents #

TODO

## The Robson Tree Traversal ##

Here we are! The Robson Tree Traversal is a method for traversing trees in linear time, and in ***constant space***.

Robson learns from the threaded and link-inversion models. By using the leaf-pointers as pseudo marker-bits,
we create an awesome tree-traversal.

The downside of the threaded-tree was that it is linear-space.
Yet, it successfully used those null pointers that we lamented of their waste.
The downside of the link-inversion model is that it is worst-case linear-space.
We had to add an extra bit of memory to each node.
Robson solves both problems by playing to the strength's of both!

##### ***BOOM end of blog post.*** #####

Just kidding heres how it works...

### The Algorithm ###

Lets start by talking about the memory usage. We need a few bytes of memory for this to work,
here is what we will be using those bytes for:

* a `cur` pointer. This will be the current node that we are algorithmizing.
* a `parent` pointer. Fairly self explanatory, we need to know the parent of the current node at any given time.
This does not need to be part of the data structure, we will just update our single pointer as the algorithm runs.
* a pointer we call `available`. This will be used to point to a node that we can use in our 'leaf-stack',
that I will describe later.
* A pointer called `top`. This will be the top of the aforementioned and still mysterious leaf-stack.
* a temporary pointer used for exchanging nodes similarly to link-inversion.
* a bool used to keep some state regarding how we have been traversing the tree.

These variables are kept in the function, and other than them, the only memory needed is the tree itself!
Unlike the other algorithms mentioned in this post, this tree is completely basic. There are no changes
to the underlying data structure from what you learn in CS102. Now, lets move to the algorithm itself.
The core algorithm is split into two parts: pushing down the tree, and finding the next subtree.

First, we push down the tree while inverting the pointers, a la link-inversion.
We go down the tree not until we hit the left-most node, like in link-inversion,
but when we hit a fully fledged leaf. The inversions themselves are a bit different than in link-inversion.
There are a few couple to consider:

1. There is a left child. Here, we follow the the left child.
The left pointer is set to the parent of the current node, and the right is unaltered.
This follows link-inversion, nothing to change here.
2. There is no left child, but there is a right child. Here we do the same as case 1, but
we set the current right pointer to the parent. This is very important, we leave the left child's
pointer alone as null. When we go back up the tree, we will see that the parent's left is null,
and know that we are ascending via the right tree. This is important in preserving the tree's structure.
3. There are no children (as in cur is a leaf). This is the start of the interesting stuff!
Robson uses the leaf nodes as a sort of pseudo-stack. The leaf-stack tells us where to ascend from when
we dont know if we are ascending from left or right. Here, we simply will track the leaf as 'available'.
Wow! We are at a leaf! That means it's time to go up!

Lets discuss these states with pictures! If someone wants to write an interactive javascript demo of this,
be my guest!

Going up the tree, we have 4 cases, some mundane, and some interesting!

1. The parent's right pointer is null. Here, we must be ascending from the left. We un-invert the
pointers, as in link-inversion. No funny business yet!
2. The parent's left pointer is null. This is a mirror of the previous case, so ascend using
the right pointers instead of the left.
3. Now, the tree has both pointers, how do we know if we are ascending from the left or right?
Here we are getting a bit interesting! We are at an 'exchange point', where we do not know
if we should ascend from the left or from the right. Lets move out of this list
and talk about the leaf stack, and its relation to exchange points.

#### The Leaf Stack ####

TODO: saying the word stack too much?

The leaf stack is not a real stack, but a linked list, composed of tree leaves.
The `right` pointer of each leaf/stack-element points to an 'exchange point'.
Each left pointer points to the next element of the list/stack.
We call it a stack because we only access the top element, and therefore it is treated as a stack.
Also, its a cheeky 'im not touching you' to Knuth's challenge. Anyways, these exchange points are used
to tell if we are ascending from the left or right. Lets get back into the cases!

The `available` pointer's destiny is to be the new head of the leaf-stack.
Before we add it to the stack though, we must find an exchange point.
I'll leave the answer for not immediately adding it to the stack as an exercise to the reader.
Once we find an exchange point we will set `available` to the head of the leaf-stack.

Okay! Now lets get back to finding the next subtree to traverse!

TODO: does this last sentence need more reasons/usage?
I feel like people will get caught up on what an exchange point is,
and lose grasp of the section.

TODO: make this `ol` a shortcode so markdown can render inside of it.
<!-- Have to re-start the ol from before. -->
<ol start="3" class="numbered">
    <li>
        Back at the old #3, we were discussing what to do when the parent has both children.
        Let's discuss the more difficult and more fun case here. When `top` is null,
        or when `top->right` does not point to the parent, we know we are ascending from the left.
        This is what we refer to as the exchange point, where the leaf stack first comes into play!
        We will use `available` now and then go down the right subtree. We set `available->right` to
        the parent, `available->left` to `top`, and then `top` to `available`. Woohoo, its a linked list!
        After these shenanigans, there are more shenanigans! We can not fix the pointers as in
        link inversion, as `parent->left` is currently pointing to `parent`'s parent!
        What we will do is set `parent->right` to `cur`, and `cur` to `parent->right`!
        It looks funky when you draw it out, but it works! Now we are on an un-traversed
        section of the tree, so we can resume the go-down part of the algorithm!
        In the next case, we will make use of the leaf stack!
    </li>
    <li>
        Okay! In this final case, we are pushing up the tree, and find that `parent == top->right`!
        This tells us we are on ascending from the right, and have thus completed the left and right side's
        of this subtree! Congratulations! Now, we 'pop' off of the  leaf-stack, and fix the pointers.
        Remember how the parents right pointer is pointing to the left child? Yeah, now we re-set that!
        We set `parent` (the root of the subtree), to `cur` and continue pushing up the stack using the rules
        I just laid out!
    </li>
</ol>

The algorithm really isnt that hard, but when you look at the tree mid-algorithm, it can be really funky.
Pointers just completely out of place, but still kind of beautiful in a way!
Oh yeah, another reminder to not edit the tree while running this algorithm!
The tree is ***not*** in a safe, workable, state during these traversals!

### Analysis ###

Amazing.

## Conclusion ##

Ending Text!

If you liked this post, please feel free to connect with me at any of the links on the footer of this site!

If anyone knows who JM Robson is please tell me, I've tried searching for him, but to no avail. Also,
if anyone uses this algorithm, please let me know, I'd be super interested to see it used somewhere real.

### P.S. ###

On x86 systems at least, the bottom bit of a pointer will always be 0, so you could theoretically store
anything there, as long as you swap it for 0 when you need to actually use the pointer. So maybe
as another way to do this stuff, you can just use one of the pointers' bottom bits as the follow pointer
in link inversion. However, that would be really ugly to code, and then I would have had less to write about :(

https://stackoverflow.com/questions/19991506/how-portable-is-using-the-low-bit-of-a-pointer-as-a-flag

### When not to use robson ###

Robson only works on binary trees i think, havent really thought about getting it to work on trees generally.

if you need to stop the algorithm at any time the tree will be in a terrible state,
you need to run the algorithm completely before doing anything else with the tree.
