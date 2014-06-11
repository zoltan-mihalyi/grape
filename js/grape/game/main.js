define(['game/abstract-view', 'game/game', 'game/game-loop', 'game/game-object', 'game/game-object-array', 'game/gui-view', 'game/input', 'game/layer', 'game/scene', 'game/system', 'game/view'],
    function (AbstractView, Game, GameLoop, GameObject, GameObjectArray, GUIView, Input, Layer, Scene, System, View) {
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