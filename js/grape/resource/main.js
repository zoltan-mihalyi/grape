define([ 'resource/audio', 'resource/cacheable', 'resource/json-scene-source', 'resource/resource', 'resource/resource-collection', 'resource/sprite'], function (Audio, Cacheable, JSONSceneSource, Resource, ResourceCollection, Sprite) {
    return {
        Audio: Audio,
        Cacheable: Cacheable,
        JSONSceneSource: JSONSceneSource,
        Resource: Resource,
        ResourceCollection: ResourceCollection,
        Sprite: Sprite
    };
});