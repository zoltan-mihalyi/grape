define(['std/array', 'std/chainable', 'std/game-object/main', 'std/event-emitter', 'std/game', 'std/layer', 'std/node', 'std/resource/main', 'std/scene', 'std/view', 'utils'], function (GrapeArray, Chainable, GameObjects, EventEmitter, Game, Layer, Node, Resource, Scene, View, Utils) {
    var Std = {
        Array: GrapeArray,
        Chainable: Chainable,
        EventEmitter: EventEmitter,
        Game: Game,
        Layer: Layer,
        Node: Node,
        Scene: Scene,
        View: View
    };

    Utils.extend(Std, Resource);
    Utils.extend(Std, GameObjects);
    return Std;
});