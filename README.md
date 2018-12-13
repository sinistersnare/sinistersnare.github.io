# Blog of the Sinistersnare #

Find the real site [HERE!](https://drs.is)

Hey, this is my Blog's repository.
The source code is in the `source` branch,
and the generated HTML is in the `master` branch.

Enjoy!

## Writing a Post ##

Run the command:

```bash
$ hugo serve -D --config minimo.config.toml
```

## Releasing The Site ##

1. Make sure Hugo is installed. https://gohugo.io/getting-started/installing/
1. From the source directory, make sure all changes are committed.
1. `$ hugo --config minimo.config.toml`
1. `$ git checkout master` This will bring the `public/` directory to `master`
1. `$ shopt -s extglob` this allows the next command
1. `$ rm -rf !(public)`
1. `$ mv public/* .`
1. `$ git add --all`
1. `$ git commit -m "Releasing new awesome blog post! "`
1. `$ git push origin master`


## TODO: ##

* I copied-over fluid-img{s} but they use pure-css stuff. Maybe port to vanilla CSS somehow?
* main.f0e8df71.css file currently has max-width at 740px. is there a better way to set this?
* Make everything Bigger. I have this site at 140% for chrissake!
* Fix bug where RSS sidebar link goes missing on about and contact pages. Currently it is disabled.
* IDK how to get other styles. pygmentsStyle=STYLE not working.
* Mobile looks like shit. Make new theme time?
* Give this blog the Attribution 4.0 Internation Creative Commons License
    * https://creativecommons.org/choose/

This will create a test-server to write new posts and content in. -D will publish drafts.

* The below thing is outdated (from blackburn theme times)
* When writing code blocks:
    * Use simple three-backticks for simple linenumbered code. Use the following for no line numbers.
    * use {{< highlight LANGNAME >}} to start a code-block, and {{< /highlight >}} to end the codeblock.
    * "linenos=table" adds line numbers in such a way they wont be highlighted. Remove if line numbers are unneeded.

## Adding New Fonts ##

1. Import config on static/icons/fontello-config.json onto http://fontello.com
2. Use https://icomoon.io to all files including `.eot` `.svg` `.ttf` `.woff` and `.woff2`
3. Download into static/icons (Keep the new config.json from Fontello)


## LICENSE ##

All stuff here is MIT licensed, as is all my code. Enjoy <3
