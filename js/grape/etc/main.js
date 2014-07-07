define([
    './aabb',
    './alarm',
    './animation',
    './chainable',
    './collision',
    './event-emitter',
    './mouse',
    './particle-system',
    './physical',
    './position',
    './rectangle',
    './sprite-visualizer',
    './tag',
    './visualizer'
], function (AABB, Alarm, Animation, Chainable, Collision, EventEmitter, Mouse, ParticleSystem, Physical, Position, Rectangle, SpriteVisualizer, Tag, Visualizer) {
    return {
        AABB: AABB,
        Alarm: Alarm,
        Animation: Animation,
        Collidable: Collision.Collidable,
        CollisionSystem: Collision.CollisionSystem,
        EventEmitter: EventEmitter,
        Mouse: Mouse,
        ParticleSystem: ParticleSystem,
        Physical: Physical,
        Position: Position,
        Rectangle: Rectangle,
        SpriteVisualizer: SpriteVisualizer,
        TagContainer: Tag.TagContainer,
        Taggable: Tag.Taggable,
        Visualizer: Visualizer
    };
});