define([
    './abstract-view',
    './game',
    './game-loop',
    './game-object',
    './game-object-array',
    './gui-view',
    './input',
    './layer',
    './scene',
    './system',
    './view'
], function (AbstractView, Game, GameLoop, GameObject, GameObjectArray, GUIView, Input, Layer, Scene, System, View) {
    return {
        AbstractView: AbstractView,
        Game: Game,
        GameLoop: GameLoop,
        GameObject: GameObject,
        GameObjectArray: GameObjectArray,
        GUIView: GUIView,
        Input: Input,
        Layer: Layer,
        Scene: Scene,
        System: System,
        View: View
    };
});