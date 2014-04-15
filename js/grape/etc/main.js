define(['etc/alarm', 'etc/animation', 'etc/array', 'etc/chainable', 'etc/event-emitter', 'etc/list', 'etc/list', 'etc/node', 'etc/position'], function (Alarm, Animation, Arr, Chainable, EventEmitter, List, Node, Position, Rectangle) {
    return {
        Alarm: Alarm,
        Animation: Animation,
        Array: Arr,
        EventEmitter: EventEmitter,
        List: List,
        Node: Node,
        Position: Position,
        Rectangle: Rectangle
    };
});