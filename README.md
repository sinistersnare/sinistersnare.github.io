# My Personal Website!

Find the real site [HERE!](https://thedav.is)

## Writing a Post

Run the command:

```bash

# 1. Make sure Zola is installed.
#    https://www.getzola.org/documentation/getting-started/installation/
$ zola serve --drafts
```

This will create a test-server at `http://127.0.0.1:1111`

Now write, and changes will be reflected.

## Releasing The Site

A continuous integration script is run when this code is pushed to the github repository
which will automatically build and publish this site, as long as the zola build succeeds.

```sh
zola check
git push origin master
```

The base theme is [Sam](https://github.com/janbaudisch/zola-sam) licensed AGPL. I did modify it.
