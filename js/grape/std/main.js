define(['std/chainable', 'std/game-object/main', 'std/event-emitter', 'std/game', 'std/node', 'std/resource/main', 'std/scene', 'utils'], function (Chainable, GameObjects, EventEmitter, Game, Node, Resource, Scene, Utils) {
    var Std = {
        Chainable: Chainable,
        EventEmitter: EventEmitter,
        Game: Game,
        Node: Node,
        Scene: Scene
    };

    Utils.extend(Std, Resource);
    Utils.extend(Std, GameObjects);
    return Std;
});