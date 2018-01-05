# Blog of the Sinistersnare #

Find the real site [HERE!](https://drs.is)

Hey, this is my Blog's repository.
The source code is in the `source` branch,
and the generated HTML is in the `master` branch.

Enjoy!

## TODO: ##

* Make everything Bigger. I have this site at 140% for chrissake!
* Fix bug where RSS sidebar link goes missing on about and contact pages. Currently it is disabled.
* IDK how to get other styles. pygmentsStyle=STYLE not working.

## Writing a Post ##

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
