#!/bin/bash
# pack everything into an .xpi file
zip -rq color-my-tabs.xpi \
    content \
    bootstrap.js \
    chrome.manifest \
    install.rdf \
    AUTHORS \
    LICENSE