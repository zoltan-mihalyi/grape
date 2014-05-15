This folder includes multiple version of the Grape pong game. You can see here how to set up a project when you are developing a game.

Folders
-------

- one-file: If you are developing a small game, and you don't need any module loader.
- required: If you have a lot of modules, it is recommended to use require.js.
- multiplayer: If you want to create a multiplayer game, you can see how easy it is.
- audio, img: Common resource files are stored here.

General
-------

In each directory there are similar files.

- index.html: This is the production version of the game, you should create something similar when you release your game. To use this, you have to build the game first (see below).
- index.dev.html: If you are developing the game and the game engine is built, you use something like this.
- index.grape-dev.html: If you are developing the game engine itself, you can use this. It works without building anything.

How to build a game?
--------------------

1, run `npm install` in the game directory. This sets up the required dependencies like grunt and r.js. (If you don't have npm, download and install node.js first)
2, run `grunt` in the game directory. If you don't have grunt cli, install it with the following command: `npm install -g grunt-cli`