<<<<<<< HEAD
define(['std/chainable', 'std/event-emitter', 'std/game', 'std/resource/main', 'std/scene', 'utils'], function (Chainable, EventEmitter, Game, Resource, Scene, Utils) {
    var Std = {
=======
define(['std/chainable', 'std/event-emitter', 'std/game', 'std/node', 'std/scene'], function (Chainable, EventEmitter, Game, Node, Scene) {
    return {
>>>>>>> origin/master
        Chainable: Chainable,
        EventEmitter: EventEmitter,
        Game: Game,
<<<<<<< HEAD
        Resource: Resource,
=======
        Node: Node,
>>>>>>> origin/master
        Scene: Scene
    };

    Utils.extend(Std, Resource);
    return Std;
});