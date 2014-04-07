define(['core/class', 'std/event-emitter', 'std/game-object/game-object', 'utils/list'], function (Class, EventEmitter, GameObject, List) {
    var GameObjectId = GameObject.id;

    return Class('Layer', EventEmitter, {
        init: function () {
            this.width = 400;
            this.height = 300;

            this._classes = {};
            this._activeClasses = {};

            this.instanceNumber = 0;
            this._layers = {};
        },
        add: function (instance) {
            var i, classData, parentId, clazz = instance.getClass(), classId = clazz.id, allParent;
            if (!clazz.allParentId[GameObjectId]) { //TODO remove if no check
                throw 'The instance must be a descendant of Grape.Std.GameObject.';
            }
            instance.scene = this;

            if (!(classData = this._classes[classId])) { //instance class is not registered yet
                this._activeClasses[classId] = this._classes[classId] = classData = {
                    instances: new List(),
                    instanceNumber: 1,
                    descendants: []
                };
                allParent = clazz.allParent;
                for (i = allParent.length; --i >= 0;) {
                    parentId = allParent[i].id;
                    if (!this._classes[parentId]) { //parent type is not registered yet
                        this._classes[parentId] = {
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
        addLayer: function (name, layer) {
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
        'event any': function (event, payload) {
            var i;
            for (i in this._layers) {
                this._layers[i].emit(event, payload);
            }
        }
    });
});