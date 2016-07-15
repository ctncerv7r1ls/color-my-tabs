## Color My Tabs
![Preview](http://i.imgur.com/NXhqGTX.png)

This is an extension for Pale Moon web browser which can color your tabs relatively to their favicons basing on dominant color lookup.

It has been written with usage of Add-on SDK. It works with Pale Moon 26.* as this version still supports Add-on SDK based extensions. Probably this'll have to be rewritten with usage of XPCOM components or bundled somehow with Add-on SDK libraries inside (?) for future Pale Moon releases.

Color My Tabs version in this repository is newer than version published on Pale Moon add-ons website [here](https://addons.palemoon.org/extensions/appearance/color-my-tabs/) as it was changed in many places. However, this version doesn't include CSS fixes for custom themes and might produce visual glitches, so it's currently intended for using with default theme.

### Building
Make build.sh an executable via terminal with `chmod +x build.sh` and execute it with `./build.sh`. The .xpi file should appear inside this directory.

### Usage
Open the .xpi file with Pale Moon or drag the .xpi file inside its window and confirm installation. Tabs should become colored relatively to their favicons. Some parameters can be changed via preferences window accessible within Add-ons Manager page.
