# Blog of the Sinistersnare #

Find the real site [HERE!](https://drs.is)

Hey, this is my Blog's source repository.
The generated HTML is in the `docs/` directory,
everything else is the 'source' for the site.

Enjoy!

## Writing a Post ##

Run the command:

```bash
$ zola serve
```

This will create a test-server to write new posts and content in. `--drafts` will show drafts.

Now write, and changes will be reflected.

## Releasing The Site ##

1. Make sure Zola is installed. https://www.getzola.org/documentation/getting-started/installation/
2. `$ zola build --output-dir docs` # GH Pages uses `docs/` for output.
3. commit and push.

## TODO: ##

* Edit theme to use [ToC support](https://www.getzola.org/documentation/content/table-of-contents/) for posts.
* Automate build/deploy with GH actions or something? https://www.getzola.org/documentation/deployment/github-pages/
* Delimit tags in posts with a comma or something.
* Make blockquote look less SHIT
* I fucked up default list styles making ToC looking good. Unfuckup while keeping ToCs pretty.
    * maybe just add inline-style to ToC HTML so i can unfuck the stuff in `_element.sass`?

## LICENSE ##
* All of MY source code (basically, the markdown files) that generates this site is MIT licensed.
* All source code provided by posts is MIT licensed (unless cribbed from a project,
in which case it is that license).
* All non-code content that I own the copyright to is
[CC BY 4](https://creativecommons.org/licenses/by/4.0/).

The theme I am using, [Sam](https://github.com/janbaudisch/zola-sam),
has an AGPL license.
Changes I have made to sam include:
* Changed the Footer
* Tweaked some CSS
* Added a 'home' link to the top of non-home pages.
* Probably some other small things, run a diff if you want.
* Changed the HTML of the tags to use a `<nav>` element.
Enjoy <3
