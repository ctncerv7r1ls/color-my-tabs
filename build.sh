#!/bin/bash
# pack everything into an .xpi file
zip -rq color-my-tabs.xpi \
    forms \
    images \
    modules \
    bootstrap.js \
    chrome.manifest \
    install.rdf \
    LICENSE