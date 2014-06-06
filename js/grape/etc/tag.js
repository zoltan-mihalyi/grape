define(['class', 'collections/bag'], function (Class, Bag) {
    var TagContainer = Class('TagContainer', {
        init: function () {
            this._tags = {};
        },
        get: function (/*tag1, tag2...*/) {
            var i, j, name, instances, result = this.createResultContainer();
            for (i = 0; i < arguments.length; i++) { //todo optimize
                name = arguments[i];
                instances = this._tags[name];
                if (instances) {
                    for (j = 0; j < instances.length; j++) { //todo optimize
                        result.push(instances[j]); //TODO distinct
                    }
                }
            }
            return result;
        },
        _get: function (tag) {
            return this._tags[tag] || this.createResultContainer();
        },
        createResultContainer: function () {
            return [];
        },
        'final _add': function (taggable, tag) {
            var tags = this._tags,
                items = tags[tag];
            if (!items) {
                items = tags[tag] = new Bag();
            }
            return items.add(taggable) - 1;
        },
        'final _remove': function (taggable, tag) {
            var idx = taggable._tags[tag], bag = this._tags[tag], moved = bag.remove(idx);

            if (moved) {
                moved._tags[tag] = idx;
            }

            if (bag.length === 0) {
                delete this._tags[tag];
            }
        }
    });

    var Taggable = Class('TagContainer', {
        init: function () {
            this._tags = {};
        },
        setTagContainer: function (container) { //todo instanceOf check
            var i;
            if (this._tagContainer) { //should remove old tag container first
                if (this._tagContainer === container) {
                    return;
                }
                this.removeTagContainer(); //todo better move
            }
            this._tagContainer = container;
            for (i in this._tags) {
                container._add(this, i);
            }
        },
        addTag: function (name) {
            var container = this._tagContainer;
            if (this.hasTag(name)) { //already added
                return false;
            }
            if (container) { //have container
                this._tags[name] = container._add(this, name); //store the index for removal purpose
            } else {
                this._tags[name] = true;
            }
            return true;
        },
        hasTag: function (name) {
            return this._tags[name] !== undefined;
        },
        removeTag: function (name) {
            if (!this.hasTag(name)) {
                return;
            }

            if (this._tagContainer) {
                this._tagContainer._remove(this, name);
            }
            delete this._tags[name];
        },
        removeTagContainer: function () {
            var idx, name, moved;
            if (!this._tagContainer) { //nothing to do
                return;
            }
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