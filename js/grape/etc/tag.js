define(['class', 'collections/bag'], function (Class, Bag) {
    var TagContainer = Class('TagContainer', {
        init: function () {
            this._tags = {};
        }
    });

    var Taggable = Class('TagContainer', {
        init: function () {
            this._tags = {};
        },
        addToTagContainer: function (container) {
            this._tagContainer = container;
        },
        addTag: function (name) { //todo check
            //TODO defer the adding until the item is added to a container
            var container = this._tagContainer, tags = container._tags;
            if (this._tags[name]) {
                return false;
            }
            if (!tags[name]) {
                tags[name] = new Bag();
            }
            this._tags[name] = tags[name].add(this) - 1; //store the index for removal purpose
            return true;
        },
        hasTag: function (name) {
            return this._tags[name] !== undefined;
        },
        removeTag: function (name) { //todo check
            var idx = this._tags[name], moved = this._tagContainer._tags[name].remove(idx);
            if (moved) {
                moved._tags[name] = idx;
            }
            delete this._tags[name];
        },
        removeFromTagContainer: function () {
            var idx, name, moved;
            for (name in this._tags) {
                idx = this._tags[name];
                moved = this._tagContainer._tags[name].remove(idx);
                if (moved) {
                    moved._tags[name] = idx;
                }
            }
        }
    });

    return {
        TagContainer: TagContainer,
        Taggable: Taggable
    };
});