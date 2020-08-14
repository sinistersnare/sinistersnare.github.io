# Blog of the Sinistersnare #

Find the real site [HERE!](https://drs.is)

Hey, this is my Blog's repository.
The source code is in the `source` branch,
and the generated HTML is in the `master` branch.

Enjoy!

## Writing a Post ##

Run the command:

```bash
$ zola serve
```

This will create a test-server to write new posts and content in. --drafts will show drafts.

Now write, and changes will be reflected.

## Releasing The Site ##

1. Make sure Zola is installed. https://www.getzola.org/documentation/getting-started/installation/
1. From the `source` branch, make sure all changes are committed.
1. `$ zola build`
1. `$ git checkout master` This will bring the `public/` directory to `master`
1. `$ shopt -s extglob` or `$ setopt extended_glob` for zsh. This allows the next command
1. `$ rm -rf !(public)` or `$ rm -rf ^public` for zsh.
1. `$ mv public/* .`
1. `$ git add --all`
1. `$ git commit -m "Releasing new awesome blog post! "`
1. `$ git push origin master`
1. `$ git checkout source` Go back to the source of this blog.


## TODO: ##

* Edit theme to use [ToC support](https://www.getzola.org/documentation/content/table-of-contents/).
* Give this blog the Attribution 4.0 Internation Creative Commons License
    * https://creativecommons.org/choose/

## LICENSE ##

All stuff here is MIT licensed,
as is all my code used within unless otherwise noted by its source.
Enjoy <3
