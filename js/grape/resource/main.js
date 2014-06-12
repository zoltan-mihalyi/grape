define([
    './audio',
    './cacheable',
    './json-scene-source',
    './resource',
    './resource-collection',
    './sprite'
], function (Audio, Cacheable, JSONSceneSource, Resource, ResourceCollection, Sprite) {
    return {
        Audio: Audio,
        Cacheable: Cacheable,
        JSONSceneSource: JSONSceneSource,
        Resource: Resource,
        ResourceCollection: ResourceCollection,
        Sprite: Sprite
    };
});