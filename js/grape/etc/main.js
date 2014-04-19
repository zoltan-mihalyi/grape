define(['etc/aabb', 'etc/alarm', 'etc/animation', 'etc/array', 'etc/chainable', 'etc/collision', 'etc/event-emitter', 'etc/list', 'etc/mouse', 'etc/node', 'etc/physical', 'etc/position', 'etc/rectangle', 'etc/sprite-visualizer', 'etc/system'],
    function (AABB, Alarm, Animation, Arr, Chainable, Collision, EventEmitter, List, Mouse, Node, Physical, Position, Rectangle, SpriteVisualizer, System) {
        return {
            AABB: AABB,
            Alarm: Alarm,
            Animation: Animation,
            Array: Arr,
            Collidable: Collision.Collidable,
            CollisionSystem: Collision.CollisionSystem,
            EventEmitter: EventEmitter,
            List: List,
            Mouse: Mouse,
            Node: Node,
            Physical: Physical,
            Position: Position,
            Rectangle: Rectangle,
            SpriteVisualizer: SpriteVisualizer,
            System: System
        };
    });