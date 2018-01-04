---
title: "The Robson Tree Traversal"
description: "Traversing Trees, The Hard Way."
date: 2017-12-24T08:10:44-05:00
draft: true
topics: ["Programming"]
---

***issues:***

* should I better define 'node' in terms of a tree-node?
* make outbound links open in new tab.

## Introduction ##

In this post, we will discuss a novel tree traversal algorithm.
Robson tree traversals traverse a tree in **Constant Space**,
as opposed to the standard method, which has a **linear** space cost.

The final code can be found [here](https://github.com/sinistersnare/robson), but I encourage you to read the post.
The table of contents may help for people who think they can skip a bit :)


TODO: add some history

> In 1968, Donald Knuth asked whether a non-recursive algorithm for in-order traversal exists, that uses no stack and leaves the tree unmodified. One of the solutions to this problem is tree threading, presented by J. H. Morris in 1979.[1][2]


## Table of Contents ##

1. What is a Tree?
	- How do we traverse a tree?
2. Why is the 'standard' method bad?
3. How can we do better than linear!?!?!
4. Stackless Traversals
	- The Threaded Tree
	- The Link-Inversion Model
5. The Robson Tree Traversal
	- An Unholy Matrimony
	- A Walkthrough
6. Conclusion




## What is a Tree? ##

A 'tree' is a data structure commonly used in datastructures found in programs used everywhere.
Filesystems use trees to store their [data](https://en.wikipedia.org/wiki/B-tre),
text-editors use trees to [store text](https://en.wikipedia.org/wiki/Rope_(data_structure)),
basically everything uses trees.

A binary tree is commonly taught in introduction-to-programming classes at universities.
These trees nodes contain some data, and two children, commonly called a 'left' and 'right' child,
which are both trees themselves! This is called a recursive data-structure,
it uses its own definition to define itself!

Here is a common tree definition. We will be using C for the whole of this post:

```c
typedef struct Tree {
	int data;
	Tree* left;
	Tree* right;
} Tree;
```

We can use the tree like so:

```c
int main(void) {
	Tree root, root_left;
	root_left.data = 0;
	root_left.left = NULL;
	root_left.right = NULL;

	root.data = 1;
	root.left = &rl;
}
```

## How Do We Traverse a tree? ##

_note_: should the 'why do we need to traverse' be in this section or the previous?

Traversing a tree means accessing each node's data in the whole tree.
This is obviously a critically important function of a tree,
we should be able to access all elements if we need to.

Luckily, traversing a tree is super easy!

```c
void traverse(Tree* cur) {
	if (cur == NULL) {
		return;
	}
	traverse(cur->left);
	process(cur); // in-order traversal
	traverse(cur->right);
}
```

This algorithm is commonly taught in CS-101 courses at universities,
and it gets the job done. However, I think I can do better.


## Why is the 'standard' method bad? ##

To get into why an algorithm is bad, we need to talk about "Big-O notation",
and that is a little bit out of scope for this already long blog-post, so...
Take an algorithms course I guess? Lets just go with,
"Big-O talks about algorithmic efficiency in terms of space-usage or time-usage."
That sounds fine.

The 'standard' traversal method is as efficient as possible, time-wise.
We need to traverse all `n`-nodes of a tree, and the algorithm has `O(n)`
run-time complexity. You cant get any better than that!

A reader may think that you also cant get better space-wise.
The algorithm is like 4 lines long, how can we get better than that!?
Well, if you paid attention in your algorithms class,
you would know that stack space counts! Even though this algorithm
looks small and perfect, it uses up a whole stack-frame for each node!
If you turn this recursive code into a non-recursive, stack-based, solution,
you would see that you need a stack to store each node, and in the worst-case,
we need `O(n)` memory!

You may be saying now, "O(n) is not that bad! It seems as good as it can get!"
Well I say no! We can do better! I say we can do it in ***constant time***!

That means we can do it using the same amount of memory, no matter how big the tree gets!

Lets do it!

## How can we do better than that!?!?!##

Here is the thing about trees: they can be quite wasteful!

Lets look at a tree-structure:

{{% fluid_img "/img/post/robson/wasteful.png" %}}

You see, the leaf-nodes have 2 pointers that are just ***null***!
What a waste! Thats so much space we are wasting! (TODO: maybe do some math for how many nodes in a complete tree are null?)

Here is the theory. We use that freely-available space for our traversal.
That way, we use as little extra memory as possible!

That is how we are going to get to our solution, but first we need to understand some preliminary concepts.


## Stackless Traversals ##

As mentioned in the introductory sections, the standard tree traversal requries a stack to traverse the tree.
This is becuase we need to 'pop' back up the tree once we reach a leaf. Using a stack is super easy to understand,
and it makes for a clean algorithm. However, using a stack is expensive (as shown previously).
A stackless traversal is what we need.



### The Threaded-Tree ###

TODO: maybe this shouldnt be in 'stackless traversals'?

The Threaded-Tree utilizes the leaf-pointers we discussed below, but not necessarily to traverse the tree.
The 'threads' are used to find the in-order successor/predeccessor of a node.

The benefit of the Threaded-Tree is constant space, and constant time successor/predeccesor location.

TODO: explain how standard trees are worst-case linear succ/pred finding.

MORE EXPLAANATION


### The Link-Inversion Model ###

Link Inversion is a key ingredient to our final algorithm. Link-Inversion is a process where we use a marker-bit
on each node to tell if we should continue to traverse up, or traverse rightward when going up a tree.

This method is stackless, and solves Knuth's question, but it does not solve our dilemma,
we need O(1) worst-case space complexity!


## The Robson Tree Traversal ##

Here we are! The Robson Tree Traversal is a method for traversing trees in linear time, and in ***constant space***.

Robson uses the ideas of the threaded tree and the link-inversion traversal to create the perfect harmony of tree-traversals.

The downside of the threaded-tree was that it is not a traversal method, so we can't use that.

The downside of the link-inversion model is that it is worst-case linear-space.
We had to add an extra bit of memory to each node.

Robson uses the leaves of the trees as the marker bits. This solves both problems by playing to the strenths of both!

***BOOM end of blog post.***

Just kidding heres how it works.


### The Algorithm ###
