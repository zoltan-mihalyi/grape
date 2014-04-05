define(['core/class', 'std/event-emitter'], function (Class, EventEmitter) {
    return Class('Scene', EventEmitter, {
        init: function () {
            this.width = 400;
            this.height = 300;

            this._types = {};
            this._activeTypes = {};

            /*this._instancesByType = {};
             this._listsByType = {};
             this._instanceNumbersByType = {};
             this._descendantsByType = {};*/
             this.instanceNumber = 0;
        },
        add: function (instance) {
            var instances, lists, events, allParent, i;

            var typeData, parentId, clazz = instance.getClass(), typeId = clazz.id;
            instance.scene = this;

            if (!(typeData = this._types[typeId])) {
                allParent = clazz.allParent;
                typeData = this._types[typeId] = {
                    instances: instances = new List(),
                    instanceNumber: 1,
                    descendants: []
                    //lists:
                };

                for (i = allParent.length; --i >= 0;) {
                    parentId = allParent[i].id;
                    if (!this._types[parentId]) { //parent type is not registered yet
                        this._types[parentId] = {
                            instances: new List(),
                            instanceNumber:0,
                            descendants: [typeData]
                        };
                    } else {
                        this._types[parentId].descendants.push(typeData);
                    }
                }
            }else{

            }

            ++this.instanceNumber;
            //TODO necessarray? instance._id = ++nextId;
            instance._listElement = instances.push(instance); //store the list element for destroying
            return instance;
        },
        remove: function (instance) {
            var i, localEvents, subscribe, typeId = instance.getClass().id, lists, last = this._instanceNumbersByType[typeId] === 1;
            if (instance._destroyed) {
                return;
            }
            instance._destroyed = true;
            instance.dispatch('destroy', last);
            detach(instance._listElement);
            if (instance._localEvents) { //detach local event listeners
                for (i in (localEvents = instance._localEvents)) {
                    if (hasProp(localEvents, i)) { //#if hasOwnCheck
                        if ((subscribe = localEvents[i].subscribe)) {
                            detach(subscribe);
                        }
                    } //#if hasOwnCheck
                }
            }
            if (last) {//last instance
                delete instancesByTypes[typeId];
                lists = listsByTypes[typeId];
                delete listsByTypes[typeId];
                for (i = lists.length; --i >= 0;) {
                    detach(lists[i]);
                }
            }
            --instanceNumbersByTypes[typeId];
            --instanceNumber;
        }
    });
});