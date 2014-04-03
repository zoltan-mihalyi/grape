define(['std/chainable', 'std/event-emitter', 'std/game', 'std/node', 'std/scene'], function (Chainable, EventEmitter, Game, Node, Scene) {
    return {
        Chainable: Chainable,
        EventEmitter: EventEmitter,
        Game: Game,
        Node: Node,
        Scene: Scene
    };
});