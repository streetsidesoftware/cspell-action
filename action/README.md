# README

Nested Yarn 2 install.

This directory and package.json contains only the dependencies needed to run the action.
It does not include any development dependencies. This is an explicit design choice.
Yarn 2 Zero Install is being used as a way to package `cspell` while avoiding the pitfalls of
WebPack breaking `cosmiconfig`.

But, Yarn 2 does not seem to have a "production" cache mode. This resulted in an action that
was more then 50 MB. Much too big, since the Webpack version was around 2 MB.
