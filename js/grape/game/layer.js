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
                throw 'Element "' + name + '" already added.';
            }
            target[name] = object;
        }
        return object;
    }

    function remove(target, name) {
        if (typeof  name === 'string') { //by name
            if (!target[name]) {
                throw 'Element "' + name + '" does not exist.';
            }
            delete target[name];
        } else { //by object
            if (!Utils.removeFromArray(target, name)) {
                throw 'Element does not exist.';
            }
        }
    }

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
        add: function (instance) {
            var i, classData, parentId, clazz = instance.getClass(), classId = clazz.id, allParent;
            if (!instance.instanceOf(GameObject)) {
                throw new Error('The instance must be a descendant of Grape.GameObject.');
            }
            instance.setTagContainer(this);
            instance._layer = this;

            this.emit('instanceAdded', instance);

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
            instance.emit('add', this);
            return instance;
        },
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
            instance.emit('remove');
        },
        getByTag: function (/*tag1, tag2, ...*/) {
            return this.parent(Tag.TagContainer, 'get').apply(this, arguments);
        },
        'override createResultContainer': function () {
            return new GameObjectArray();
        },
        getClasses: function (parent) { //TODO private?
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
        get: function (classes, descendants) {
            var i, j, instances,
                classData, classDataArr = [], addedClasses = {}, result = new GameObjectArray();

            function addIfNotAdded(cd) {
                if (addedClasses[cd.id]) {
                    return;
                }
                addedClasses[cd.id] = true;
                instances = cd.instances;
                for (i = instances.length; i-- > 0;) { //todo use this loop if possible
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
            /*TODO needed? if (this._started) {
             layer.emit('start');
             }*/
        },
        addSystem: function (name, system) { //todo add without name
            system = addWithOrWithoutName(this._systems, name, system);
            system._layer = this;
            if (this._started) {
                system.emit('start');
            }
        },
        addView: function (name, view) { //todo create with view class if config object is given
            this.addSystem(name, view);
        },
        removeLayer: function (name) { //todo stop event
            remove(this._layers, name);
        },
        removeSystem: function (system) {
            system = remove(this._systems, system);
            if (this._started) {
                system.emit('stop');
            }
        },
        removeView: function (name) {
            this.removeSystem(name);
        },
        getSystem: function (name) {
            return this._systems[name];
        },
        getScene: function () {
            if (this._parentLayer) {
                return this._parentLayer.getScene();
            }
            return this;
        },
        getGame: function () {
            return this.getScene()._game;
        },
        'event start': function () {
            this._started = true;
        },
        'event render': function (ctx) {
            if (this.backgroundColor) { //TODO create function
                ctx.fillStyle = this.backgroundColor;
                ctx.fillRect(0, 0, this.width, this.height);
            }
            if (this.background) {
                var pattern = ctx.createPattern(this.background.img, 'repeat'); //TODO create function
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
            for (i in this._views) {
                this._views[i].emit(event, payload);
            }
            for (i in this._systems) {
                this._systems[i].emit(event, payload);
            }
        }
    });
});