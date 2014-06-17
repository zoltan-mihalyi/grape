define(['../class', '../collections/bag'], function (Class, Bag) {
    /**
     * A container for tagging. You can get items by tags.
     *
     * @class Grape.TagContainer
     * @constructor
     * @see Grape.Tag
     */
    var TagContainer = Class('TagContainer', {
        init: function () {
            this._tags = {};
        },
        /**
         * Gets items stored in the container by a tag.
         *
         * @example
         *      var container = new Grape.TagContainer();
         *      var obj = new Grape.Taggable();
         *      obj.setTagContainer(container);
         *      obj.addTag('my tag');
         *      container.get('my tag'); //returns an array containing obj
         *
         *
         * @method get
         * @param {String} tag The tag
         * @return {Array} Items containing the tag
         */
        get: function (tag) { //TODOv2 multiple tags
            var i, instances, result = this.createResultContainer();
            instances = this._tags[tag];
            if (instances) {
                for (i = instances.length - 1; i >= 0; i--) {
                    result.push(instances[i]);
                }
            }
            return result;
        },
        _getTag: function (tag) {
            return this._tags[tag] || this.createResultContainer();
        },
        /**
         * Creates an array-like object. If you want to redefine the result type of the get method, you can override
         * this method.
         *
         * @method createResultContainer
         * @return {Array} An initial array.
         * @see get
         */
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

    /**
     * A taggable class. If you add a tag to an instance, you can get it from the container.
     *
     * @see Grape.TagContainer
     * @class Grape.Taggable
     * @constructor
     */
    var Taggable = Class('TagContainer', {
        init: function () {
            this._tags = {};
        },
        /**
         * Sets the tag container for the instance. If tags are added already, they will appear in the new container.
         * If the instance already has a tagContainer, it will be removed first.
         *
         * @method setTagContainer
         * @param {TagContainer} container The container
         */
        setTagContainer: function (container) { //todov2 instanceOf check
            var i;
            if (this._tagContainer) { //should remove old tag container first
                if (this._tagContainer === container) {
                    return;
                }
                this.removeTagContainer(); //todov2 better move
            }
            this._tagContainer = container;
            for (i in this._tags) {
                container._add(this, i);
            }
        },
        /**
         * Adds a tag to a taggable object.
         *
         * @method addTag
         * @param {String} name Tag name
         * @return {boolean} true, if a new tag is added, false, if the tag was already added.
         */
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
        /**
         * Checks if a tag is added or not.
         *
         * @method hasTag
         * @param {String} name Tag name
         * @return {boolean} true, if the instance has the tag
         */
        hasTag: function (name) {
            return this._tags[name] !== undefined;
        },
        /**
         * Removes a tag from a taggable object. If the tag is not added, does nothing.
         *
         * @method removeTag
         * @param {String} name Tag name
         */
        removeTag: function (name) {
            if (!this.hasTag(name)) {
                return;
            }

            if (this._tagContainer) {
                this._tagContainer._remove(this, name);
            }
            delete this._tags[name];
        },
        /**
         * Detaches the TagContainer. The instance is no more queryable through the container.
         *
         * @method removeTagContainer
         */
        removeTagContainer: function () {
            var name;
            if (!this._tagContainer) { //nothing to do
                return;
            }
            for (name in this._tags) {
                this._tagContainer._remove(this, name);
            }
        }
    });

    return {
        TagContainer: TagContainer,
        Taggable: Taggable
    };
});