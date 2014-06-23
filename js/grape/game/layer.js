define([
    '../class',
    '../etc/event-emitter',
    '../etc/tag',
    './game-object',
    './game-object-array',
    '../utils',
    '../collections/bag'
], function (Class, EventEmitter, Tag, GameObject, GameObjectArray, Utils, Bag) {

    function addWithOrWithoutName(target, name, object) {
        if (object === undefined) { //no name
            object = name;
            target.push(object);
        } else {
            if (target[name]) {
                throw new Error('Element "' + name + '" already added.');
            }
            target[name] = object;
        }
        return object;
    }

    function remove(target, name) {
        if (typeof  name === 'string') { //by name
            if (!target[name]) {
                throw new Error('Element "' + name + '" does not exist.');
            }
            delete target[name];
        } else { //by object
            if (!Utils.removeFromArray(target, name)) {
                throw new Error('Element does not exist.');
            }
        }
    }

    /**
     * A layer contains instances, systems, and other layers.
     * When any event is emitted to the layer, it is emitted to the systems and layers of the layer too.
     * When you want to subscribe to the layer events with a GameObject (which is added to the layer) you can use the
     * gameObject.onGlobal() function or the global-event keyword.
     *
     * @class Grape.Layer
     * @uses Grape.EventEmitter
     * @uses Grape.TagContainer
     * @constructor
     * @param {Object} opts Initial properties
     */
    return Class('Layer', [EventEmitter, Tag.TagContainer], {
        init: function (opts) {
            opts = opts || {};
            this.width = opts.widht || 400;
            this.height = opts.height || 300;
            this.background = opts.background || null;
            this.backgroundColor = opts.backgroundColor || null;

            this._classes = {};
            this._activeClasses = {};

            this.instanceNumber = 0;
            this._layers = [];
            this._systems = [];

            this._parentLayer = null;
        },
        /**
         * Adds an instance to the layer and emits it's "add" event.
         *
         * @method add
         * @param {Grape.GameObject} instance Instance
         * @return {Grape.GameObject} The added instance
         */
        add: function (instance) {
            var i, classData, parentId, clazz = instance.getClass(), classId = clazz.id, allParent;
            if (!instance.instanceOf(GameObject)) {
                throw new Error('The instance must be a descendant of Grape.GameObject.');
            }
            instance.setTagContainer(this);
            instance._layer = this;

            if (!(classData = this._classes[classId])) { //instance class is not registered yet
                this._activeClasses[classId] = this._classes[classId] = classData = {
                    id: classId,
                    clazz: clazz,
                    instances: new Bag(),
                    instanceNumber: 1,
                    descendants: []
                };
                allParent = clazz.allParent;
                for (i = allParent.length; --i >= 0;) {
                    parentId = allParent[i].id;
                    if (!this._classes[parentId]) { //parent type is not registered yet
                        this._classes[parentId] = {
                            id: parentId,
                            clazz: allParent[i],
                            instances: new Bag(),
                            instanceNumber: 0,
                            descendants: [classData]
                        };
                    } else {
                        this._classes[parentId].descendants.push(classData);
                    }
                }
            } else {
                this._activeClasses[classId] = classData; //set class active
                classData.instanceNumber++;
            }
            this.instanceNumber++;
            instance._index = classData.instances.add(instance) - 1; //store the index in the bag for efficient remove

            /**
             * This event is emitted to the instance when it is added to the layer. The parameter is the layer.
             *
             * @event add (instance)
             */
            instance.emit('add', this);
            return instance;
        },
        /**
         * Removes an instance from the layer and emits it's "remove" event.
         *
         * @method remove
         * @param instance
         */
        remove: function (instance) {
            var clazz = instance.getClass(), classId = clazz.id, typeData = this._classes[classId], instances = this._activeClasses[classId].instances, idx = instance._index, moved = instances.remove(idx);
            if (moved) {
                moved._index = idx; //update the index of the item moved to the position of the removed item
            }
            typeData.instanceNumber -= 1;
            if (typeData.instanceNumber === 0) {
                delete this._activeClasses[classId];
            }
            this.instanceNumber--;
            instance.removeTagContainer();

            /**
             * Emitted to the instance when it is removed from the layer.
             *
             * @event remove (instance)
             */
            instance.emit('remove');
        },
        /**
         * Returns the instances with the given tag. Instances are indexed by tags.
         *
         * @method getByTag
         * @return {Grape.GameObjectArray} Instances with the tag
         */
        getByTag: function (/*tag1, tag2, ...*/) {
            return this.parent(Tag.TagContainer, 'get').apply(this, arguments);
        },
        'override createResultContainer': function () {
            return new GameObjectArray();
        },
        _getClasses: function (parent) {
            var result = {}, classData = this._classes[parent.id], i, desc;
            if (classData) {
                if (this._activeClasses[classData.id]) {
                    result[classData.id] = classData;
                }
                for (i = 0; i < classData.descendants.length; i++) {
                    desc = classData.descendants[i];
                    if (this._activeClasses[desc.id]) {
                        result[desc.id] = desc;
                    }
                }
            }
            return result;
        },
        _get: function (clazz) {
            var instances = this._activeClasses[clazz.id];
            if (instances) {
                return instances.instances;
            }
            return [];
        },
        get: function (classes, descendants) {
            var i, j, instances,
                classData, classDataArr = [], addedClasses = {}, result = new GameObjectArray();

            function addIfNotAdded(cd) {
                if (addedClasses[cd.id]) {
                    return;
                }
                addedClasses[cd.id] = true;
                instances = cd.instances;
                for (i = instances.length; i-- > 0;) { //todov2 use this loop everywhere if possible
                    result.push(instances[i]);
                }
            }

            if (classes) {
                if (!Utils.isArray(classes)) {
                    classes = [classes];
                }
                for (i = 0; i < classes.length; i++) {
                    classData = this._classes[classes[i].id];
                    if (classData) {
                        classDataArr.push(classData);
                    }
                }
            } else {
                /*jshint -W088 */ //due an issue: https://github.com/jshint/jshint/issues/1016
                for (i in this._activeClasses) {
                    classDataArr.push(this._activeClasses[i]);
                }
            }
            for (i = 0; i < classDataArr.length; i++) {
                classData = classDataArr[i];
                addIfNotAdded(classData);
                if (descendants) {
                    descendants = classData.descendants;
                    for (j = 0; j < descendants.length; j++) {
                        addIfNotAdded(descendants[j]);
                    }
                }
            }
            return result;
        },
        addLayer: function (name, layer) {
            layer = addWithOrWithoutName(this._layers, name, layer);
            layer._parentLayer = this;
            /*TODOv2 needed? if (this._started) {
             layer.emit('start');
             }*/
        },
        addSystem: function (name, system) { //todov2 add without name
            system = addWithOrWithoutName(this._systems, name, system);
            system._layer = this;
            if (this._started) {
                /**
                 * Emitted to a system when it is added to a running layer or when the layer is started with a system
                 * added before.
                 *
                 * @event start (system)
                 */
                system.emit('start');
            }
        },
        /**
         * Adds a view to the layer. A synonym for addSystem.
         *
         * @method addView
         * @param {String} name View name
         * @param {Grape.View} view The view
         */
        addView: function (name, view) { //todv2o create with view class if config object is given
            this.addSystem(name, view);
        },
        /**
         * Removes a layer.
         *
         * @method removeLayer
         * @param {String|Grape.Layer} name Name of the layer or the layer itself
         */
        removeLayer: function (name) { //todov2 stop event?
            remove(this._layers, name);
        },
        /**
         * Removes a system from the layer.
         *
         * @method removeSystem
         * @param {String|Grape.System} system The name of the system or the system itself.
         */
        removeSystem: function (system) {
            system = remove(this._systems, system);
            if (this._started) {
                /**
                 * Emitted to a system when it is removed from the running layer or when the layer is stopped.
                 *
                 * @event stop (system)
                 */
                system.emit('stop');
            }
        },
        /**
         * Removes a view from the layer. An alias for removeSystem.
         *
         * @method removeView
         * @param {String|Grape.View} name View name or the view itself
         */
        removeView: function (name) {
            this.removeSystem(name);
        },
        /**
         * Returns a system with the given name. Views are also considered as systems.
         *
         * @method getSystem
         * @param {String} name System name
         * @return {Grape.System} System
         */
        getSystem: function (name) {
            return this._systems[name];
        },
        /**
         * Returns the root layer.
         *
         * @method getScene
         * @return {Grape.Scene} The root layer
         */
        getScene: function () {
            if (this._parentLayer) {
                return this._parentLayer.getScene();
            }
            return this;
        },
        /**
         * Returns the current game.
         *
         * @method getGame
         * @return {Grape.Game} The game
         */
        getGame: function () {
            return this.getScene()._game;
        },
        'event start': function () {
            this._started = true;
        },
        'event render': function (ctx) {
            if (this.backgroundColor) {
                ctx.fillStyle = this.backgroundColor;
                ctx.fillRect(0, 0, this.width, this.height);
            }
            if (this.background) {
                var pattern = ctx.createPattern(this.background.img, 'repeat'); //TODOv2 create function for bg drawing
                ctx.rect(0, 0, this.width, this.height);
                ctx.fillStyle = pattern;
                ctx.fill();
                ctx.fillStyle = '';
            }
        },
        'event any': function (event, payload) {
            var i;
            for (i in this._layers) {
                this._layers[i].emit(event, payload);
            }
            for (i in this._systems) {
                this._systems[i].emit(event, payload);
            }
        }
    });
});