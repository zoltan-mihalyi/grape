define(['etc/aabb', 'etc/alarm', 'etc/animation', 'etc/chainable', 'etc/collision', 'etc/event-emitter', 'etc/mouse', 'etc/physical', 'etc/position', 'etc/rectangle', 'etc/sprite-visualizer', 'etc/system', 'etc/tag'],
    function (AABB, Alarm, Animation, Chainable, Collision, EventEmitter, Mouse, Physical, Position, Rectangle, SpriteVisualizer, System, Tag) {
        return {
            AABB: AABB,
            Alarm: Alarm,
            Animation: Animation,
            Collidable: Collision.Collidable,
            CollisionSystem: Collision.CollisionSystem,
            EventEmitter: EventEmitter,
            Mouse: Mouse,
            Physical: Physical,
            Position: Position,
            Rectangle: Rectangle,
            SpriteVisualizer: SpriteVisualizer,
            System: System,
            TagContainer: Tag.TagContainer,
            Taggable: Tag.Taggable
        };
    });