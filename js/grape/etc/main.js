define(['etc/aabb', 'etc/alarm', 'etc/animation', 'etc/chainable', 'etc/collision', 'etc/event-emitter', 'etc/mouse', 'etc/node', 'etc/physical', 'etc/position', 'etc/rectangle', 'etc/sprite-visualizer', 'etc/system'],
    function (AABB, Alarm, Animation, Chainable, Collision, EventEmitter, Mouse, Node, Physical, Position, Rectangle, SpriteVisualizer, System) {
        return {
            AABB: AABB,
            Alarm: Alarm,
            Animation: Animation,
            Collidable: Collision.Collidable,
            CollisionSystem: Collision.CollisionSystem,
            EventEmitter: EventEmitter,
            Mouse: Mouse,
            Node: Node,
            Physical: Physical,
            Position: Position,
            Rectangle: Rectangle,
            SpriteVisualizer: SpriteVisualizer,
            System: System
        };
    });