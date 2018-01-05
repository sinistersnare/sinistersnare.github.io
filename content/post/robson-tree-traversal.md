---
title: "The Robson Tree Traversal"
description: "Traversing Trees, The Hard Way."
date: 2017-12-24T08:10:44-05:00
draft: true
topics: ["Programming"]
---

## TODO ##

* should I better define the word 'node' in terms of a tree-node?
* make outbound links open in new tab.
* add some history
    * > In 1968, Donald Knuth asked whether a non-recursive algorithm for in-order traversal exists, that uses no stack and leaves the tree unmodified. One of the solutions to this problem is tree threading, presented by J. H. Morris in 1979.[1][2]
* Make sure Table of Contents is correct when post is over
*


# Introduction #

In this post, we will discuss a novel tree traversal algorithm.
Robson tree traversals traverse a tree in **Constant Space**,
as opposed to the standard method, which has a **linear** space cost.

The final code can be found [here](https://github.com/sinistersnare/robson), but I encourage you to read the post.
The table of contents may help for people who think they can skip a bit :)


# Table of Contents #

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




# What is a Tree? #

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
    visit(cur); // in-order traversal
    traverse(cur->right);
}
```

This algorithm is commonly taught in beginning CS courses at universities,
and it gets the job done. However, I think I can do better.


# Why is the 'standard' method bad? #

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


# Stackless Traversals #

As mentioned in the introductory sections, the standard tree traversal requries a stack to traverse the tree.
This is becuase we need to 'pop' back up the tree once we reach a leaf. Using a stack is super easy to understand,
and it makes for a clean algorithm.

In 1968, Donald Knuth asked the computer science community if there existed a method for computing
tree traversals without a stack, while also leaving the tree unmodified. Lets discuss some methods for
doing just that.



## The Threaded Tree ##

J. H. Morris presented the threaded tree in 1979, and it involves using those wasteful null nodes
at the end of the tree. However, you will see it does not solve all of our problems.

Threaded trees are used in binary search trees. (meld this into text)

We use the tree-leaf pointers, not necessarily to traverse the tree, but to find the next node in the
in-order traversal.

***TODO:*** Talk about how Amortized constant time, and linear space.
Finding this next node is done in worst-case constant-time!
The spatial cost of this however, is still linear with the tree. Lets explain how it works.

In this part, we will discuss only single threaded trees, for finding in-order ***successors*** to nodes.
Make sure to note that by 'thread' we do not mean threads as in multiple-threads of execution, but just as in
a pointer to another part of the tree. It is kind of confusing, I give you that reader, but it just happens sometimes.

Lets dive right into some code:

```c
typedef struct Tree {
    int data;
    Tree* left;
    Tree* right;
    bool is_thread;
} Tree;
```

This `Tree` struct includes a boolean field to tell whether the current tree node has an in-order thread.
When we search for the in-order successor to the current node, and find that it is a thread, we take the
right node to get the immediate successor! This is always a single operation, AKA O(1) time!

You note, of course, that to support this method, we need to add a boolean field for each and every node in the tree!
This means we are stuck with a linear space cost for this traversal.

TODO: say how to form a thread. not just that there are threads.


Threaded trees are super cool, and I would love for people to know them. Luckily, there is a great
[Wikipedia page](https://en.wikipedia.org/wiki/Threaded_binary_tree)
on the subject. If there was not, I would definitely write more.

* Space-Complexity: O(n)
    * This is because each tree node needs a marker, so linear cost.
* Time-Complexity: _Amortized_ O(1) (for traversing down non-threads)
    * I could write a lot about how this comes to be amortized O(1), but that is not the topic for this post, sorry!
    * Basically its just that, usually finding the successor is easy (so constant time), but sometimes its expensive (linear), so probabilistically, its considered O(1).... Computer Science!


## The Link-Inversion Model ##

Link Inversion is a key ingredient to our final algorithm. Link-Inversion is a process where we use a marker-bit
on each node to tell if we should continue to traverse up, or traverse rightward when going up a tree.

This method is stackless, and solves Knuth's question, but it does not solve our dilemma,
we need O(1) worst-case space complexity! Lets talk about how and why it works.

The tree struct is the same as it was for the threaded tree, but the differences are in execution:

```c
typedef struct Tree {
    int data;
    Tree* left;
    Tree* right;
    bool is_marked;
} Tree;

Tree* prev;
Tree* cur;
```

We start at the root of the tree and check the current


### Risks ###

Note that this algorithm changes pointers inside of the tree! That is pretty unsafe!
That means that during traversal, do not try to use the tree! If this algorithm does not complete fully,
then the tree will be left in an unrecoverable state. Memory leaks and data loss aho(?wrong word?)!

So basically, make some tests to ensure that trees are recreated!

## The Robson Tree Traversal ##

Here we are! The Robson Tree Traversal is a method for traversing trees in linear time, and in ***constant space***.

Robson uses the ideas of the threaded tree and the link-inversion traversal to create the perfect harmony of tree-traversals.

The downside of the threaded-tree was that it is linear-space.
However, it successfully used those null pointers that we

The downside of the link-inversion model is that it is worst-case linear-space.
We had to add an extra bit of memory to each node.

Robson uses the leaves of the trees as the marker bits. This solves both problems by playing to the strenths of both!

***BOOM end of blog post.***

Just kidding heres how it works.


### The Algorithm ###




## Conclusion ##

Ending Text!


If you liked this post, please feel free to tweet me @Sinistersnare or email me sinistersnare @ gmail.
