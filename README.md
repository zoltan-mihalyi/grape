[![Build Status](https://travis-ci.org/zoltan-mihalyi/grape2.svg?branch=master)](https://travis-ci.org/zoltan-mihalyi/grape2)
# Grape.js
Grape.js is a JavaScript game engine.

Download: TODO

## use

### Hello, my first game!

You can create a game by calling `new Grape.Game()`.

```javascript
var myGame = new Grape.Game({container: document.body}); //container can be an id or a DOM element
myGame.start(new MyScene());`
```

Where MyScene comes from?

```javascript
var MyScene = Grape.Scene.extend({ //create a new class by extending Grape.Scene
    'event render':function(ctx){ //event keyword creates an event listener
        ctx.fillText('Hello, my first game!', 100, 100); //we can draw anything to the canvas context
    }
});
```

[I'm an inline-style link](https://www.google.com)



TODO On every release, the built grape.js and grape.min.js are generated to the dist folder, you can use this!

## build

Project is built with grunt.
If you don't have grunt cli, run

    npm install -g grunt-cli

 To install development dependencies (grunt and grunt-contrib-requirejs) you have to

    npm install

If you don't have npm, download node.js from http://nodejs.org
If you installed the dependencies, you can build with

    grunt

Then dist/grape.min.js appears.