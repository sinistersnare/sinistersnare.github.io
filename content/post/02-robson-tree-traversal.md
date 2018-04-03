+++
slug = "robson-traversal"
title = "The Robson Tree Traversal"
description = "Traversing Trees, The Hard Way."
date = 2018-01-01T08:10:44-05:00
draft = false
tags = ["Data-Structures", "Algorithms"]
categories = ["Software"]
+++

## TODO ##

* should I better define the word 'node' in terms of a tree-node?
* make outbound links open in new tab.
* add some history
    * > In 1968, Donald Knuth asked whether a non-recursive algorithm for in-order traversal exists, that uses no stack and leaves the tree unmodified. One of the solutions to this problem is tree threading, presented by J. H. Morris in 1979.
* Make sure Table of Contents is correct when post is over
* Add pictures of tree's being traversed. Jasons slides may be a help.


# Introduction #

In this post, we will discuss a novel tree traversal algorithm.
Robson tree traversals traverse a tree in **Constant Space**,
as opposed to the standard method, which has a **linear** space cost.

The final code can be found [here](https://github.com/sinistersnare/robson), but I encourage you to read the post.
The table of contents may help for people want to skip a bit :)


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
    struct Tree* left;
    struct Tree* right;
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
    root.left = &root_left;
}
```

Note that the trees that we use in this post will be
[Binary Search Trees](https://en.wikipedia.org/wiki/Binary_search_tree)
mostly so in-order traversal looks pretty.

## How Do We Traverse a tree? ##

_note_: should the 'why do we need to traverse' be in this section or the previous?

Traversing a tree means accessing each node's data in the whole tree.
This is obviously a critically important function of a tree,
we should be able to access all elements if we need to.

Luckily, traversing a tree is super easy!

```c
void traverse(Tree* cur) {
    if (cur == NULL) return;
    pre_visit(cur); // pre-order traversal
    traverse(cur->left);
    in_visit(cur); // in-order traversal
    traverse(cur->right);
    post_visit(cur); // post-order traversal
}
```

This algorithm is commonly taught in beginning CS courses at universities,
and it gets the job done. However, I think I can do better.

Tree traversals can be adapted for use in memory management.
Many garbage collectors represent their memory pool using tree-like structures,
and when they are marking live memory, they traverse that tree.

Pre-order traversal is used to ensure that parents are visited before children.
For garbage collection, pre-order is used to prevent re-entering cyclic structures.
Our robson traversal will be in pre-order format. Another use of pre-order traversals
is to copy trees!


# Why is the 'standard' method bad? #

To get into why an algorithm is bad, we need to talk about "Big-O notation",
and that is a little bit out of scope for this already long blog-post, so...
Take an algorithms course I guess? Lets just go with,
"Big-O talks about algorithmic efficiency in terms of space-usage or time-usage."
Lets spend two quick paragraphs on it.

When we talk about time efficiency, we talk about how long an algorithm takes to run.
When someone says an algorithm is `O(n) time` that means there is a linear relationship between
input size, and run-time, `y = c*n` (for some constant `c`) if you graph it.
Constant time, `O(1)` means no matter how big the input gets that we run the algorithm on,
it takes the same time to run. This is equivalent to `y = c` when graphed.
Remember, this talks about the relationship between input size and run-time,
not necessarily how long it takes exactly.

Space is very similar, but instead of run-time, it is memory used. To say an algorithm takes
`O(n)` space means the amount of memory usage increases linearly with input size.
If you want a more in-depth introduction to these concepts, check out
[CLRS](https://en.wikipedia.org/wiki/Introduction_to_Algorithms)
chapter 3 for more information!

The 'standard' traversal method is as efficient as possible, time-wise.
We need to traverse all `n`-nodes of a tree, and the algorithm has `O(n)`
run-time complexity. You cant get any better than that!

A reader may think that you also cant get better space-wise.
The algorithm is like 4 lines long, how can we get better than that!?
Well, if you paid attention in your algorithms class,
you would know that stack space counts! Even though this algorithm
looks small and perfect, it uses up a whole stack-frame each time the algorithm recurses!
If you turn this recursive code into an iterative, explicit-stack based, solution,
you would see that you need some memory for each level, and in the worst-case,
we need `O(n)` memory!

You may be saying now, "O(n) is not that bad! It seems as good as it can get!"
Well I say no! We can do better! I say we can do it in ***constant time***!

That means we can do it using the same amount of memory, no matter how big the tree gets!

Lets do it!

## How can we do better than that!?!?! ##

Here is the thing about trees: they can be quite wasteful!

Lets look at a tree-structure:

{{% fluid_img "/img/post/robson-traversal/wasteful.png" %}}

You see, the leaf-nodes have 2 pointers that are just ***null***!
What a waste! Thats so much space we are wasting! For any given tree of `n` nodes, there will be `n + 1` NULL pointers.

Here is the theory. We use that freely-available space for our traversal.
That way, we use as little extra memory as possible!

That is how we are going to get to our solution, but first we need to understand some preliminary concepts.

# Stackless Traversals #

As mentioned in the introductory sections, the standard tree traversal requries a stack to traverse the tree.
This is becuase we need to 'pop' back up the tree once we reach a leaf. Using a stack is super easy to understand,
and it makes for a clean algorithm.

In 1968, Donald Knuth asked the computer science community if there existed a method for computing
tree traversals without a stack, while also leaving the tree unmodified. Lets discuss some methods for
doing just that, ending in the Robson traversal.

## The Threaded Tree ##

J. H. Morris presented the threaded tree in 1979, and it involves using those wasteful null nodes
at the ends of the tree. However, you will see it does not solve all of our problems.

TODO: Threaded trees are used in binary search trees. (meld this into text)

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
    struct Tree* left;
    struct Tree* right;
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

Tree* prev = NULL;
```

We start the traversal by going as far left as possible. As we traverse left, we 'invert' the left pointers to point to the previous node (note the `prev` pointer in the code-block above). The inversions are used so we can get back up the tree; remember we are not using recursion or an explicit stack here. I say explicit becuase the inverted links can be thought of like a stack.

...

After we have descended left to the leaf node, we must go back up the tree.
However, how do we know when to ascend left or right? That is the beauty of the marker bit.


...

### Risks ###

Note that this algorithm changes pointers inside of the tree! That is pretty unsafe!
That means that during traversal, do not try to use the tree! If this algorithm does not complete fully,
then the tree will be left in an unrecoverable state. Memory leaks and data loss aho(?wrong word?)!

So basically, make some tests to ensure that trees are recreated!

## The Robson Tree Traversal ##

Here we are! The Robson Tree Traversal is a method for traversing trees in linear time, and in ***constant space***.

Robson learns from the threaded and link-inversion models. By using the leaf-pointers as pseudo marker-bits,
we create an awesome tree-traversal.

The downside of the threaded-tree was that it is linear-space.
Yet, it successfully used those null pointers that we lamented of their waste.
The downside of the link-inversion model is that it is worst-case linear-space.
We had to add an extra bit of memory to each node.
Robson solves both problems by playing to the strenth's of both!

##### ***BOOM end of blog post.*** #####

Just kidding heres how it works...


### The Algorithm ###

FIXME: `a la` is used twice, be original.

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

TODO: does this last sentence need more reasons/usage? I feel like people will get caught up on what an exchange point is, and lose grasp of the section.

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
Pointers just completely out of place, but still kind of beautiful in a way! This is another reminder not to
edit the tree while running this algorithm! The tree is ***not*** in a safe, workable, state during these traversals!

Now for pictures!

## Conclusion ##

Ending Text!

If you liked this post, please feel free to connect with me at any of the links on the footer of this site!

If anyone knows who JM Robson is please tell me, I've tried searching for him, but with no avail. Also,
if anyone uses this algorithm, please let me know, I'd be super interested to see it used somewhere real.

### P.S. ###

On x86 systems at least, the bottom bit of a pointer will always be 0, so you could theoretically store
anything there, as long as you swap it for 0 when you need to actually use the pointer. So maybe
as another way to do this stuff, you can just use one of the pointers' bottom bits as the follow pointer
in link inversion. However, that would be really ugly to code, and then I would have had less to write about :(


### When not to use robson ###

Robson only works on binary trees i think

if you need to stop the algorithm at any time the tree will be in a terrible state,
you need to run the algorithm completely before doing anything else with the tree.
