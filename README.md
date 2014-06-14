[![Build Status](https://travis-ci.org/zoltan-mihalyi/grape2.svg?branch=master)](https://travis-ci.org/zoltan-mihalyi/grape2)
# Grape.js
Grape.js is a JavaScript game engine.

Download: TODO

## Usage

### Hello, my first game!

You can create a game by calling `new Grape.Game()`.

```javascript
var myGame = new Grape.Game({container: document.body}); //container can be an id or a DOM element
myGame.start(new MyScene());
```

We defined MyScene before like this

```javascript
var MyScene = Grape.Scene.extend({ //create a new class by extending Grape.Scene
    'event render':function(ctx){ //event keyword creates an event listener
        ctx.fillText('Hello, my first game!', 100, 100); //we can draw anything to the canvas context
    }
});
```

[Check more tutorial](https://github.com/zoltan-mihalyi/grape2/wiki/Tutorial)



TODO On every release, the built grape.js and grape.min.js are generated to the dist folder, you can use this!

## Cool stuff

Why is Grape special?

- Strong class system
    - Multiple inheritance
    - Cool modifiers like "static" or "event"
    - Feel safe with "abstract", "final" or "override" modifiers
- Optimized CPU performance
    - Compile "for" loops in the critical parts of the game
    - Optimized collision detection
        - Spatial partition, optimized for moving or standing objects
        - Interest based broad phase algorithm: if there is no event listener for two object's collision, they aren't checked at all
    - Array-based bag data structure for storing instances, which is faster than map or linked list
- Create nested resource collections to organize your dependencies and track the loading progress
- Create multiple views and layers to organize your game objects and GUI
- Built-in utility classes for handling animations, basic physics and more
- Build to mobile devices using phoneGap (soon)
- Create multiplayer games easily and run the same game on node.js server (soon)
- Particle system (soon)

## build

Project is built with grunt.
If you don't have grunt cli, run

    npm install -g grunt-cli

To install development dependencies you have to

    npm install

If you don't have npm, download node.js from http://nodejs.org
If you installed the dependencies, you can build with

    grunt build

Then dist/grape.js appears.