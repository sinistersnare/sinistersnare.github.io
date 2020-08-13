+++
slug = "fancy-tree-traversals"
title = "Fancy Tree Traversals"
description = "Threaded Trees and Link Inversion Traversals"
date = 2019-01-02T10:10:44-05:00
draft = false
tags = ["Data-Structures", "Algorithms", "Trees"]
categories = ["Software"]
+++

# Introduction #

In this post, we will discuss a couple of novel methods for traversing trees.
The threaded tree offers amortized constant access to the successor of a tree-node.
The link-inversion traversal offers a stackless traversal of binary trees.

The final code is in [this repository](https://github.com/sinistersnare/robson).
Please read on for some history, and some novel algorithms you may have never heard of!

# The Famous Tree #

The tree is an incredibly important data structure.
A great learning tool for beginning computer scientists, starting to understand the science.
Trees are also used throughout the real-world.
File systems use [B-trees](https://en.wikipedia.org/wiki/B-tree)
to [store their data](https://github.com/postgres/postgres/tree/master/src/backend/access/nbtree).
Text editors use [ropes](https://en.wikipedia.org/wiki/Rope_(data_structure))
to [organize their text](https://github.com/google/xi-editor/tree/master/rust/rope).
Trees power the world, inside and outside of computers.
We will be using a simple binary tree for this post.

Here is a common binary tree definition. We will be using C for the whole of this post:

```c
/* We will use this type definition later. */
typedef void (*VisitFunc)(Tree*);

typedef struct Tree {
    int data;
    struct Tree* left;
    struct Tree* right;
} Tree;
```

We can create the tree like so:

```c
int main(void) {
    Tree root, root_left;
    root_left.data = 0;
    root_left.left = NULL;
    root_left.right = NULL;
    root.data = 1;
    root.left = &root_left;
    root.right = NULL;
}
```

## How Do We Traverse a tree? ##

Traversing a tree is accessing each node's data in the whole tree.
This is obviously a critically important function of a tree,
we should be able to access all elements if we need to.

Luckily, traversing a tree is super easy!

```c
void traverse(Tree* cur) {
    if (cur == NULL) return;
    pre_visit(cur); /* pre-order traversal */
    traverse(cur->left);
    in_visit(cur); /* in-order traversal */
    traverse(cur->right);
    post_visit(cur); /* post-order traversal */
}
```

Pre-order traversal always visits a parent before its child. This is very useful when you want to copy a tree, maintaining its order. In-order is mostly used for sorted trees, as it will visit nodes in order! A node will be visited in post-order only after its children have been visited. This means that post-order is best used for tasks such as deleting the tree, freeing its memory without dangling pointers left over. If we made `free` our pre-visit function, then we would never be able to traverse right children!

This algorithm is universally taught in beginning CS courses at universities.
It gets the job done, and yet here we are, trying to complicate things!

# Stackless Traversals #

When we use that standard traversal algorithm, we utilize the power of stacks! Stacks are a wonderful and simple datastructure. Imagine first: a _stack_ of plates in your cupboard. You can not pick a plate from the center of that stack, you must go from the top. This Last-In-First-Out ordering is great for traversing trees too! Now, lets imagine the left-edge of the tree to be our plate-stack. As we traverse down, we push nodes onto the stack. When we reach the bottom of the tree, we need a way to get back up. The solution is to simply 'pop' off the node-stack, and then we are at the `second-to-last` node!

Next, we go right. Add the right-child of the `second-to-last` node to the stack. We now have to traverse that sub-tree, the same way as before, all the way to the left, until we reach the bottom. Eventually, after going up and right, and down and left enough, we will have traversed the entire tree. And now we have it, a semi-rigorous explanation of stackful tree traversals!

You can re-write that code in the previous section to use an explicit stack, if you wanted. It is still there, however, implicitly. When a function recurses, it uses a computer's internal stack to store information about the current function running. When we go down the tree, we add a 'stack-frame', which we use to traverse the tree.

Stacks are amazing! Using a stack grants quite an intuitive model for beginner programmers to grok. For a long time, we only knew how to traverse trees using stacks. It was a sad world though. Punch-cards, no Wikipedia, and Algol... I shudder at the very thought, but I digress. Computer scientists felt this was a silly limitation, and sought to fix that, creating the world we see today through their hatred of stacks.

In 1968, famous computer scientist Donald Knuth gave his community a problem. He wanted an algorithm for traversing trees without using a stack, which does not modify the tree in any way. I will present two algorithms that were not the first, nor the best methods for traversing trees. I like them, though, and feel like they provide some good ideas for computer scientists to learn from.

## The Threaded Tree ##

J.H. Morris presented the threaded tree in 1979. It utilizes the wasteful NULL nodes at the end of trees, for great profit. Using this algorithm will allow us to perform the `successor` operation of an in-order traversal in _amortized constant_ time.

A Threaded tree has two extra bits of information. One bit informs whether the left pointer is actually a _thread_, and the other for the right pointer. A thread is *not* an OS thread, think of it more like a pointer to a seemingly random part of the tree, and not a child. If we follow a thread, what we find is the in-order successor to a node. Here is the code for our Threaded Tree. I will describe the algorithm under the code-block.

```c
typedef struct Tree {
    int data;
    struct Tree* left;
    struct Tree* right;
    bool right_thread;
} Tree;

/* Takes the root of the tree (we call it cur for readability in the function itself) */
void threaded_traversal(Tree* cur) {
    /* Go all the way down to the smallest number in the tree. */
    while (!cur->is_thread) {
        cur = cur->left;
    }

    /* Now all we have to do is go rightwards until the end! */
    while (cur != NULL) {
        inorder_visit(cur);
        cur = tree_successor(cur);
    }
}

/* Returns a successor to any given node, `node`.*/
Tree* tree_successor(Tree* node) {
    Tree* cur;

    /* fast path! */
    if (node->right_thread) return node->right;

    /* else return leftmost child of right subtree! */
    cur = node->right;
    while (!cur->left) {
        cur = cur->left;
    }
    return cur;
}
```


This `Tree` struct includes a boolean field to tell whether the current tree node has an in-order thread. When we search for the in-order successor to the current node, and find that it is a thread, we take the right node to get the immediate successor! This is always a single operation. If we traverse an entire tree this way, we find that the `tree_successor` function is running in _amortized `O(1)`_ speed.

However, to support this method, we must add a boolean field for each and every node in this tree. This means that the spatial cost for this algorithm is linear.

Threaded trees are super cool, and I would love for people to know them. Luckily, there is a great [Wikipedia page](https://en.wikipedia.org/wiki/Threaded_binary_tree) on the subject. If there was not, I would definitely write more.

I won't do a full walkthrough of the threaded traversal, but here is an image of a threaded tree:

{{ img(src="threaded01.png", alt="TODO-SORRY!") }}

To start, go to the leftmost node, which is the minimum of an in-order traversal. To find the successor, if the right pointer is a thread, follow it, and that is the successor. If it is not, take it, and then go left as much as possible, that is the next node in-order.

### Analysis ###

* Space-Complexity: `O(n)`
    * This is because each tree node needs 2 markers, so linear cost
* Time complexity: `O(n)`
* Time complexity for finding a single successor: _Amortized `O(1)`_!

So we have found a cool algorithm that makes use of those dumb null pointers at the fringes of the tree. It does not seem like we gain much, though, as it still comes at a linear spatial cost. If you want amortized constant successor finding, then this is a great algorithm for you!

For me, the biggest downside of this algorithm is that it only works for in-order traversals. If you want pre- or post-order traversals, this algorithm is not for you.

## The Link-Inversion Model ##

Link Inversion is a key ingredient to our final algorithm. Link-Inversion is a process where we use a marker-bit on each node to tell if we should continue to traverse up, or traverse rightward when going up a tree.

This method is stackless, like the threaded tree traversal. The trick is that we jumble the pointers, to thwart hacking attempts. Just kidding! We only seemingly jumble pointers! Also, it is not to thwart hackers, its to show us the way back up the tree!

```c
typedef struct Tree {
    int data;
    Tree* left;
    Tree* right;
    bool went_right;
} Tree;

void link_inversion(Tree* cur, VisitFunc pre_order,
                               VisitFunc in_order,
                               VisitFunc post_order) {
    Tree* prev = NULL;
    Tree* old_prev;
    Tree* old_prev_left;
    Tree* old_cur;

    if (cur == NULL) return;

    do {
        /* 1) Descend leftward as much as possible. */
        while (cur != NULL) {
            pre_order(cur);
            cur->went_right = false;
            old_cur = cur;
            cur = old_cur->left;
            old_cur->left = prev;
            prev = old_cur;
        }

        /* 2) ascend from right as much as we can. */
        while (prev != NULL && prev->went_right) {
            old_prev = prev;
            prev = prev->right;
            old_prev->right = cur;
            cur = old_prev;
            post_order(cur);
        }

        /* 3)
            If prev is null after coming back up from the right,
                it means that we have finished traversal,
                so head back to the while-condition and get outta here!
            Else, we will do an exchange here,
                swap to right child of parent. */
        if (prev != NULL) {
            /* Switch from the left side of prev to the right
               Also, mark prev as went_right so we know to traverse
               upwards using right pointer. */
            in_order(prev);
            old_prev_left = prev->left;
            prev->went_right = true;
            prev->left = cur;
            cur = prev->right;
            prev->right = old_prev_left;
        }
    } while (prev != NULL);
}
```

The core algorithm is in the name, we must invert the links. As we push down the tree,
we invert the links so that way the child points to the parent, and we can walk up the tree
the same way we walked down. As we go up, we need to un-invert the links so that way the tree
is back as it started. The marker bit is used so that when we go back up, we know if we are
ascending from the left or from the right.

Let's talk about each of these steps.

1) We must start by traversing leftwards as much as possible.
Keeping pointers to the current and previously visited nodes.
As we traverse, we invert the links. That means that cur->left will be changed to point to the parent.

2) Next may not make sense, so if it doesn't make perfect sense, come to it after step 3.
Here, we are done with this subtree, so we want to get to the subtree's root.
We do this by ascending from the right until we get to the root of the traversed part of the tree.
This ensures the tree is in a state that step 3 can deal with.

3) Thirdly, we do an exchange. Here, we are assuredly in a left child, thanks to step 2.
We can safely traverse to the parents right child and
forget completely about the previous subtree forever!
This exchange marks a completion of the left subtree of the new root,
now we must traverse the right subtree of the new root. Back to step 1!

Here, we are skipping some of the technicalities, like what is `went_right` for?
It is so that we know when we get to the end of the subtree in step 2.
Hopefully, I will elucidate why its necessary with pictures very soon.
After I elucidate that, I will later explain why it's not necessary (hint: Robson!).

### Walk-through ###

The algorithm is weird, but I think it'll help by showing it!

{{ img(src="inversion01.png", alt="TODO-SORRY!") }}

Here, the tree has been traversed almost completely down the side.
Each time we step downwards, we invert the links to point to the parent.
The next step will be to venture into the NULL left-child from the current point.

This image has not even finished the first run of step 1 from above yet, so let's continue.

{{ img(src="inversion02.png", alt="TODO-SORRY!") }}

Okay, we have successfully finished part 1 of the algorithm: 'go leftward a lot'!
Now step 2 does not apply, `went_right` has been set for exactly 0 nodes at this point in execution.
We swiftly move to step 3! Here, we perform an exchange.
We have finished traversing the left child of the current subtree (the leaf), and now we must traverse the left.
We do some swaps and end up here:

{{ img(src="inversion03.png", alt="TODO-SORRY!") }}

Okay, the exchange succeeded! We are back at step 1, because `prev != NULL`.
Let's ignore the red circle for just a moment and execute step 1.
Done! Did you see it? Nothing!
Of course, `cur == NULL`, so step 1 is not run. Time for step 2! We must go up until we reach the root!
We run this until `prev->went_right == false`, in this case one time.
Running this step means we are prepared to forget about the current subtree.
Step 3 will exchange once more, getting us to the parents right child:

{{ img(src="inversion04.png", alt="TODO-SORRY!") }}

If you are keen, you may have noticed that this is a strikingly similar image to the first one in the series.
The only difference is the red marker in the `prev` node. If you apply the operations I have listed since the
start of this subsection, you can fully traverse this tree. Making enough images to illustrate all of that
is an exercise left to the reader.

Link inversion is relatively complex when compared to the standard method, but definitely more fun!

### Warning ###

This algorithm is _dangerous_! If you attempt to modify the tree while it is being
traversed, pointers will be a complete mess! Make sure this algorithm completes before altering the
tree anymore!

### Analysis ###

* Space-Complexity: `O(n)`
    * This is because each tree node needs a marker, so linear cost.
* Time complexity: `O(n)`

We still have not yet improved on the algorithmic cost of the standard depth-first search.
We have been doing quite well on solving Knuth's challenge, but thats only a minor goal!
Let's get to the real thing now, the Robson traversal.


## Conclusion ##

The threaded tree is a great structure for in-order traversal. Use it when you need to find the successor to a node lickity-split. The link-inversion method is quite strange, almost alien. However, it is used as the basis for a much cooler algorithm, The Robson Traversal. This post does not cover this traversal, but maybe a future one will.

These algorithms are quite interesting to me. Finding novel ways to do simple tasks can lead to some interesting findings. Even if we re-invent the wheel sometimes, knowing how to make a wheel is important! I hope you find a cool use for these algorithms in the future. They have provided me with quite a bit of help, I would like to think.

### P.S. ###

I have another blog post in the works, detailing an even cooler tree traversal. This Robson traversal is little known, but traverses trees in ***constant space***. Please keep an eye out for this forthcoming blog post.

If you liked this post, and want to see the new one even sooner, shoot me an email or a tweet for encouragement! I hope you learned something great today!
