# Blog of the Sinistersnare #

Find the real site [HERE!](https://drs.is)

Hey, this is my Blog's repository.
The source code is in the `source` branch,
and the generated HTML is in the `master` branch.

Enjoy!

## Rendering The Site ##

Run the command:

```bash
$ hugo --config minimo.config.toml
```

## TODO: ##

* I copied-over fluid-img{s} but they use pure-css stuff. Maybe port to vanilla CSS somehow?
* main.f0e8df71.css file currently has max-width at 740px. is there a better way to set this?
* Make everything Bigger. I have this site at 140% for chrissake!
* Fix bug where RSS sidebar link goes missing on about and contact pages. Currently it is disabled.
* IDK how to get other styles. pygmentsStyle=STYLE not working.
* Mobile looks like shit. Make new theme time?

## Writing a Post ##

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
