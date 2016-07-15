#!/bin/bash

# put lib into proper location
mkdir resources
mkdir resources/color-my-tabs
cp -r lib/ resources/color-my-tabs/lib

# create dummies required by the loader
mkdir locale
mkdir defaults
mkdir defaults/preferences
touch defaults/preferences/prefs.js
echo '{"locales": []}' > locales.json

# pack everything into an .xpi file
zip -rq color-my-tabs.xpi \
    chrome \
    chrome.manifest \
    bootstrap.js \
    harness-options.json \
    install.rdf \
    resources \
    locale \
    defaults \
    locales.json \
    AUTHORS \
    LICENSE

# clean up
rm -r resources \
    locale \
    defaults \
    locales.json
