define(['etc/aabb', 'etc/alarm', 'etc/animation', 'etc/array', 'etc/chainable', 'etc/event-emitter', 'etc/list', 'etc/mouse', 'etc/node', 'etc/position', 'etc/rectangle'], function (AABB, Alarm, Animation, Arr, Chainable, EventEmitter, List, Mouse, Node, Position, Rectangle) {
    return {
        AABB: AABB,
        Alarm: Alarm,
        Animation: Animation,
        Array: Arr,
        EventEmitter: EventEmitter,
        List: List,
        Mouse: Mouse,
        Node: Node,
        Position: Position,
        Rectangle: Rectangle
    };
});