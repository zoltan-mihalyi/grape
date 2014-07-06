[![Build Status](https://travis-ci.org/zoltan-mihalyi/grape.svg?branch=master)](https://travis-ci.org/zoltan-mihalyi/grape)
[![Coverage Status](https://coveralls.io/repos/zoltan-mihalyi/grape/badge.png)](https://coveralls.io/r/zoltan-mihalyi/grape)

<img src="http://zoltan-mihalyi.github.io/grape/docs/assets/css/logo.png" width="240" />

Grape is a JavaScript game engine designed to be fast and modular.


Download: http://zoltan-mihalyi.github.io/grape/

Pong example: http://zoltan-mihalyi.github.io/grape/pong

Full API documentation: http://zoltan-mihalyi.github.io/grape/docs

# Cool stuff

Why is Grape special?

## Strong class system
- Multiple inheritance
- Cool modifiers like "static" or "event"
- Feel safe with "abstract", "final" or "override" modifiers

## Optimized CPU performance
- Compile loops in the critical parts of the game
- Optimized collision detection
- Spatial partition, optimized for moving or standing objects
- Interest based broad phase algorithm: if there is no event listener for two object's collision, they aren't checked at all
- Array-based bag data structure for storing instances, which is faster than map or linked list
- Game scales well with increasing number of instances by design

## Extensible features, just for you!
- Create nested resource collections to organize your dependencies and track the loading progress
- Create multiple views and layers to organize your game objects and GUI
- Built-in utility classes for handling animations, basic physics and more
- Build to mobile devices using phoneGap (soon)
- Create multiplayer games easily and run the same game on node.js server (soon)
- Particle system (soon)

# Getting started

Download the engine from the download page: http://zoltan-mihalyi.github.io/grape/

The library is AMD compatible, you can use it with require.js.

## Class system

Creating applications is much easier with a good OOP class system. Grape uses it's own for developing games and the engine itself.
Let's see some basic thing about classes in Grape!

```javascript
var Greeter = Grape.Class({ //If you pass an object parameter, it will define the prototype of the class.
    init: function (name) { //Function named 'init' becomes the constructor
        this.name = name || 'anonymus';
    },
    greet: function () {
        return 'Hello, ' + this.name;
    }
});

var greeter = new Greeter('Joe');
greeter.greet(); //Hello, Joe
```

You can also add multiple parent to your class. They will be *mixed* into the class, and their constructor will be called automatically, therefore you should use a config object is you want to pass parameters to different constructors.

If you put spaces to method names, the words will be parsed as keywords, and will be used as the keyword definition tells (you can create custom keywords easily). The following predefined keywords are available:

- **static** (class property)
- **abstract** (should be implemented, inherited or marked abstract in the child class. Classes with abstract methods cannot be instantiated)
- **override** (if a method is marked with this keyword, the existence of  a parent method with the same name is checked, like in java)
- **final** (final methods cannot be overridden)
- **chainable** (proxied with a function with `return this;`)
- **event** (automatic subscription)
- **global-event** (automatic subscription to the containing layer)
- **collision** (collision event)


```javascript
var Greeter = Grape.Class('Greeter', [Grape.EventEmitter], { //An Array or a class as parameter defines the parent class(es).
    'static MESSAGE': 'Hello, ', //you can use different keywords, 'static' works exactly as you expect.
    init: function (name) {
        this.name = name || 'anonymus';
    },
    greet: function () {
        var message = Greeter.MESSAGE + this.name;
        this.emit('greet', message); //the emit function comes from EventEmitter. Callbacks registered for the greet event is called.
        return message;
    },
    'event greet': function (message) { //class-level event handler
        console.log('Someone was greeted with the message: ' + message);
    }
});
```

## Creating a game

You can create a game by creating an instance of `Grape.Game`.

```javascript
var myGame = new Grape.Game({container: document.body}); //container (game screen) can be an id or a DOM element

myGame.start(new MyScene()); //starts the game with a custom scene.
```


## Scenes and layers

A *scene* is a stage of the game, containing **game objects, views, layers** and **systems**. It can be a menu, a game level, or something similar. A game can have exactly one scene at a time. A scene is a child class of **layer** (`Grape.Layer`), but it has an fps property and an initial view by default. Layers can be used to separate game objects inside a scene, or an another layer.

We defined MyScene before starting the game like this:

```javascript
var MyScene = Grape.Scene.extend({ //create a new class by extending Grape.Scene: same as Grape.Class(Grape.Scene, {...})

    //Grape.Scene creates an initial view, which can be overridden in initViews.
    //The view emits the render event to the container layer with the canvas context as parameter.
    'event render': function (ctx) {
        ctx.fillText('Hello, my first game!', 100, 100); //we can draw anything to the canvas context
    }
});
```

## Views

You can specify which subset of game objects are visible and where are they displayed on the screeen. You can create multiple views for displaying the same instances (split-screen game) or GUI. If you add the view to a layer, only the instances of the layer (and sub-layers) will be displayed.

A sample setting for a split-screen game with a 30px heigh GUI bar:

```javascript
var MultiplayerScene = Grape.Scene.extend({
    init: function () {
        //...
        this.getLayer('level').addView('player1-view', new Grape.View({
            left: 0, //position on the screen
            top: 30,
            width: '50%', //relative to screen
            height: '100%',
            originX: '50%', //current x and y is displayed in the center of the view (origins are relative to view size)
            originY: '50%'
        }));

        this.getLayer('level').addView('player2-view', new Grape.View({
            left: '50%',
            top: 30,
            width: '50%',
            height: '100%',
            originX: '50%',
            originY: '50%'
        }));

        this.getLayer('infobar-objects').addView('infobar-view', new Grape.View({
            left: 0,
            top: 0,
            width: '100%',
            height: 30
        }));
    },
    'override initViews': function () { //don't need the default view
    }
});
```

## Resources

Resource handling and preloading can be a painful task, but you can easily solve this problem using Grape.


Let's see how to define different resources:
```javascript
var player = new Grape.Sprite('images/player.png', {
    originX: 16, //the center of the sprite will show at the (0, 0) coordinates if the sprite size is 32x32.
    originY: 16
});

var shoot = new Grape.Audio('audio/shoot.mp3', 'audio/shoot.ogg', 'audio/shoot.wav'); //fallback urls (browser's audio format support is very bad)

player.load(function () { //resources can be loaded one by one
    console.log('player sprite loaded')
});
```

Using *ResourceCollections* makes things easier:

```javascript
var res = new Grape.ResourceCollection();
res.add(player);
res.add(shoot);

res.audio('die', 'audio/die.mp3', 'audio/die.ogg', 'audio/die.wav'); //helper functions for creating and adding

//resource collections can be nested
res.load( //load resources at all
    function () { //finish handler
        console.log('loading finished');
        res.get('die').play(); //plays the loaded sound
    }, 
    function () { //error handler
        console.log('loading failed!');
    },
    function (progress) { //progress handler
        console.log('loading progress:' + progress);
    }
);
```

## Game objects

The core of every game are the game objects. These objects can be added to scenes(layers), and they can be players, terrain, enemies, menu buttons and so on.

```
var Player = Grape.Class('Player', [Grape.SpriteVisualizer, Grape.Collidable, Grape.Physical], {
    init: function () {
        this.sprite = res.get('player'); //sprite property is required by SpriteVisualizer for displaying the game object.
    },
    'global-event keyDown.left': function () { //moving with arrows
        this.x -= 4;
    },
    'global-event keyDown.right': function () {
        this.x += 4;
    },
    'global-event keyPress.space': function () {
        this.getLayer().add(new Bullet({x: this.x, y: this.y, speedX: 20}));
        res.get('shoot').play();
    }
});

var Level1 = Grape.Scene.extend({
    init: function () {
        this.add(new Player({x: 200, y: 200}));
    }
});

new Grape.Game({initialScene: Level1}).start();
```

Pong example: http://zoltan-mihalyi.github.io/grape/pong

Full API documentation: http://zoltan-mihalyi.github.io/grape/docs

# Contributing

Feel free to submit issues, fork and create pull request! This article can help: https://help.github.com/articles/using-pull-requests

## Setting up development environment

You can edit and test the result using a require.js config similar to the **examples/pong/required/index.grape-dev.html**. If you want to build, generate documentation or test, you should do the following:

make sure node.js is installed to your system ( http://nodejs.org )

Install Grunt CLI: 

    npm install -g grunt-cli

Install development dependencies: 

	npm install


## Building

Creating **dist/grape.js**:

    grunt build

Making a minified version from the built file to **dist/grape.min.js** and **dist/grape.min.map**:

	grunt min
    
Generate documentation to **dist/docs/**:

	grunt doc
    
Hint, test, build, min, documentation:

	grunt

## Testing

Running all test and create coverage to **coverage/**:

	grunt test
    
Continuous testing:
	
    grunt test-dev

JSHint validation:

	grunt hint
    
Checking documentation coverage with an internal script:

	grunt doc-coverage