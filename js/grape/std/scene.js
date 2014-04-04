define(['core/class', 'std/event-emitter'], function(Class, EventEmitter) {
    return Class('Scene', EventEmitter, {
        init: function() {
            this.width = 400;
            this.height = 300;

            this._types = {};
            this._activeTypes = {};

            this._instancesByType = {};
            this._listsByType = {};
            this._instanceNumbersByType = {};
            this._descendantsByType = {};
            this.instanceNumber = 0;
        },
        add: function(clazz, opts) {
            var instances, lists, instance, events, allParent, i;

            var typeData, parentId, typeId = clazz.id;
            opts = opts || {};
            opts.scene = this;
            instance = new clazz(opts);

            if (!(typeData = this._types[typeId])) {
                allParent = clazz.allParent;
                typeData = this._types[typeId] = {
                    instances: instances = new List(),
                    instanceNumber: 1,
                    descendants: [],
                    //lists:
                };
                
                for (i = allParent.length; --i >= 0; ) {
                    parentId = allParent[i].id;
                    if (!this._types[parentId]) { //parent type is not registered yet
                        this._types[parentId] = {descendants:[typeData]};
                    } else {
                        this._types[parentId].descendants.push(typeData);
                    }
                }
            }

            if (!(instances = this._instancesByType[typeId])) { //first instance of type
                instances = this._instancesByType[typeId] = new List();
                lists = this._listsByType[typeId] = [];

                //TODO register event listeners
                /*events = Type.eventNames;
                 for (i = events.length; --i >= 0;) {
                 current = events[i];
                 if (!typesByEventListeners[current]) {
                 typesByEventListeners[current] = new List();
                 }
                 lists.push(typesByEventListeners[current].push(type));
                 }*/

                //register type hierarchy TODO necessarry?
                if (this._instanceNumbersByType[typeId] !== 0) { //never created any instance (else it is undefined)
                    //register as descendant type
                    allParent = clazz.allParent;
                    for (i = allParent.length; --i >= 0; ) {
                        parentId = allParent[i].id;
                        if (!this._descendantsByType[parentId]) {
                            this._descendantsByType[parentId] = [typeId];
                        } else {
                            this._descendantsByType[parentId].push(typeId);
                        }
                    }
                }
                this._instanceNumbersByType[typeId] = 1;

            } else {
                ++this._instanceNumbersByTypes[typeId];
            }
            ++this.instanceNumber;
            //TODO necessarray? inst._id = ++nextId;
            instance._listElement = instances.push(instance); //store the list element for destroying
            return instance;
        },
        remove: function(instance) {
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
                for (i = lists.length; --i >= 0; ) {
                    detach(lists[i]);
                }
            }
            --instanceNumbersByTypes[typeId];
            --instanceNumber;
        }
    });
});