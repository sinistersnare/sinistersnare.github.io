# My Personal Website!

Find the real site [HERE!](https://thedav.is)

Hey, this is my Blog's source repository.
The generated HTML is in the `docs/` directory,
everything else is the 'source' for the site.

Enjoy!

## Writing a Post

Run the command:

```bash
$ zola serve
```

This will create a test-server to write new posts and content in. `--drafts` will show drafts.

Now write, and changes will be reflected.

## Releasing The Site

1. Make sure Zola is installed. https://www.getzola.org/documentation/getting-started/installation/
2. `$ zola build --output-dir docs` # GH Pages uses `docs/` for output.
3. commit and push.

## TODO:

- Footnote with backrefs. Zola supports footnotes but not backrefs.
  - https://css-tricks.com/footnotes-that-work-in-rss-readers/
  - Proably have 2 macros that do the ref, and another for the actual footnote contents.
  - `{% footnote 1 %}`
  - `{% footnotes {1: content here} {2: other content} %}`
- Edit theme to use [ToC support](https://www.getzola.org/documentation/content/table-of-contents/) for posts.
- Delimit tags in posts with a comma or something.
- Make blockquote look less SHIT
- I fucked up default list styles making ToC looking good. Unfuckup while keeping ToCs pretty.
  - maybe just add inline-style to ToC HTML so i can unfuck the stuff in `_element.sass`?

The theme I am using, [Sam](https://github.com/janbaudisch/zola-sam),
has an AGPL license.
Changes I have made to sam include:

- Changed the Footer
- Tweaked some CSS
- Added a 'home' link to the top of non-home pages.
- Probably some other small things, run a diff if you want.
- Changed the HTML of the tags to use a `<nav>` element.
  Enjoy <3
