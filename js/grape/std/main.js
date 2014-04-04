define(['std/chainable', 'std/event-emitter', 'std/game', 'std/resource/main', 'std/scene', 'utils'], function (Chainable, EventEmitter, Game, Resource, Scene, Utils) {
    var Std = {
        Chainable: Chainable,
        Game: Game,
        Resource: Resource,
        Scene: Scene
    };

    Utils.extend(Std, Resource);
    return Std;
});