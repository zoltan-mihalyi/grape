define(['class', 'etc/event-emitter', 'game/game-object', 'game/game-object-array', 'utils', 'collections/bag'], function (Class, EventEmitter, GameObject, GameObjectArray, Utils, Bag) {
    var GameObjectId = GameObject.id;

    return Class('Layer', EventEmitter, { //TODO create scene/layer - resource
        init: function () {
            this.width = 400;
            this.height = 300;

            this._classes = {};
            this._activeClasses = {};

            this.instanceNumber = 0;
            this._layers = {};
            this._views = [];
            this._systems = [];
            this._tags={};
        },
        add: function (instance) {
            var i, classData, parentId, clazz = instance.getClass(), classId = clazz.id, allParent;
            if (!clazz.allParentId[GameObjectId]) { //TODO remove if no check
                throw 'The instance must be a descendant of Grape.GameObject.';
            }
            instance.layer = this;

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
            instance.emit('add');
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
            instance.emit('remove');
        },
        getByTag:function(tags){
            var i,j,  name, instances, result=new GameObjectArray();
            if(!Utils.isArray(tags)){
                tags=[tags];
            }
            for(i=0;i<tags.length;i++){ //todo optimize
                name=tags[i];
                instances=this._tags[name];
                if(instances){
                    for(j=0;j<instances.length;j++){ //todo optimize
                        result.push(instances[j]); //TODO distinct
                    }
                }
            }
            return result;
        },
        getClasses: function (parent) {
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
        addSystem: function (name, system) { //todo add without name
            if (this._systems[name]) {
                throw 'System "' + name + '" already added.';
            }
            system.layer = this;
            this._systems[name] = system;
        },
        removeSystem: function (name) {
            if (!this._systems[name]) {
                throw 'System "' + name + '" does not exists.';
            }
            this._systems[name].layer = null;
            delete this._systems[name];
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
            for (i in this._systems) {
                this._systems[i].emit(event, payload);
            }
        }
    });
});