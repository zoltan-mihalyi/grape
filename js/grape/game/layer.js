define(['class', 'etc/event-emitter', 'game/game-object', 'game/game-object-array', 'utils', 'etc/list'], function (Class, EventEmitter, GameObject, GameObjectArray, Utils, List) {
    var GameObjectId = GameObject.id;

    return Class('Layer', EventEmitter, {
        init: function () {
            this.width = 400;
            this.height = 300;

            this._classes = {};
            this._activeClasses = {};

            this.instanceNumber = 0;
            this._layers = {};
            this._views = [];
        },
        add: function (instance) {
            var i, classData, parentId, clazz = instance.getClass(), classId = clazz.id, allParent;
            if (!clazz.allParentId[GameObjectId]) { //TODO remove if no check
                throw 'The instance must be a descendant of Grape.Std.GameObject.';
            }
            instance.scene = this;

            if (!(classData = this._classes[classId])) { //instance class is not registered yet
                this._activeClasses[classId] = this._classes[classId] = classData = {
                    id: classId,
                    instances: new List(),
                    instanceNumber: 1,
                    descendants: []
                };
                allParent = clazz.allParent;
                for (i = allParent.length; --i >= 0;) {
                    parentId = allParent[i].id;
                    if (!this._classes[parentId]) { //parent type is not registered yet
                        this._classes[parentId] = {
                            id: parentId,
                            instances: new List(),
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
            instance._listNode = classData.instances.push(instance); //store the node for efficient remove
            instance.emit('add');
            return instance;
        },
        remove: function (instance) {
            var clazz = instance.getClass(), classId = clazz.id, typeData = this._classes[classId];
            List.detachNode(instance._listNode);
            typeData.instanceNumber -= 1;
            if (typeData.instanceNumber === 0) {
                delete this._activeClasses[classId];
            }
            this.instanceNumber--;
            instance.emit('remove');
        },
        get: function (classes, descendants) {
            var i, j, it,
                classData, classDataArr = [], addedClasses = {}, result = new GameObjectArray();

            function addIfNotAdded(cd) {
                if (addedClasses[cd.id]) {
                    return;
                }
                addedClasses[cd.id] = true;
                it = cd.instances.iterator();
                while (it.hasNext()) {
                    result.push(it.next());
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
        addLayer: function (name, layer) { //TODO add without name
            if (this._layers[name]) {
                throw 'Layer "' + name + '" already added.';
            }
            this._layers[name] = layer;
        },
        removeLayer: function (name) {
            if (!this._layers[name]) {
                throw 'Layer "' + name + '" does not exists.';
            }
            delete this._layers[name];
        },
        addView: function (name, view) {
            if (arguments.length === 1) { //no name given
                view = name;
                this._views.push(view);
            } else {
                if (this._views[name]) {
                    throw 'View "' + name + '" already added.';
                }
                this._views[name] = view;
            }
            view._target = this;
            if (this._started) {
                view.emit('start');
            }
        },
        removeView: function (name) {
            if (name + '' === parseInt(name) + '') { //by index
                this._stopView(this._views[name]);
                this._views.splice(name, 1);
            } else if (typeof name === 'string') { //by name
                this._stopView(this._views[name]);
                delete this._views[name];
            } else { //by view
                this._stopView(name);
                Utils.removeFromArray(this._views, name);
            }
        },
        _stopView: function (view) {
            if (!view) {
                throw 'view does not exists';
            }
            if (this._started) {
                view.emit('stop');
            }
        },
        'event start': function () {
            this._started = true;
        },
        'event any': function (event, payload) {
            var i;
            for (i in this._layers) {
                this._layers[i].emit(event, payload);
            }
            for (i in this._views) {
                this._views[i].emit(event, payload);
            }
        }
    });
});