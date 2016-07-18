## Color My Tabs
![Preview](http://i.imgur.com/NXhqGTX.png)

This is an extension for Pale Moon web browser which can color your tabs relatively to their favicons basing on dominant color lookup.

It's no longer based on Add-on SDK and now it works with Pale Moon 27.*. However, this version doesn't include CSS fixes for custom themes and might produce visual glitches, so it's currently intended for using with default theme.

### Building
Pack all files (except this one) from this directory into a ZIP archive with .xpi extension. Alternatively, while on Linux, make build.sh an executable via terminal with `chmod +x build.sh` and execute it with `./build.sh`.

### Usage
Open the .xpi file with Pale Moon or drag the .xpi file inside its window and confirm installation. Tabs should become colored. Some parameters can be changed via preferences window accessible within Add-ons Manager page.