define(['class','collections/bag', 'etc/event-emitter'], function (Class, Bag, EventEmitter) {
    var GameObject;
    Class.registerKeyword('global-event', {
        onInit: function (classInfo) {
            classInfo.globalEvents = {};
            classInfo.allGlobalEvent = {};
        },
        onAdd: function (classInfo, methodDescriptor) {
            if (!classInfo.allParentId[GameObject.id]) {
                throw 'To use "global-event" keyword, inherit the Grape.GameObject class!';
            }
            EventEmitter.decompose(methodDescriptor.method, classInfo.globalEvents, methodDescriptor.name);
            return false;
        },
        onFinish: function (classInfo) {
            var i, event, events;
            //add parent events
            for (i = 0; i < classInfo.allParent.length; i++) {
                events = classInfo.allParent[i].globalEvents;
                for (event in events) {
                    (classInfo.allGlobalEvent[event] || (classInfo.allGlobalEvent[event] = [])).push(events[event]);
                }
            }
            //add own events
            events = classInfo.globalEvents;
            for (event in events) {
                (classInfo.allGlobalEvent[event] || (classInfo.allGlobalEvent[event] = [])).push(events[event]);
            }
        }
    });

    function createProxy(ctx, fn) {
        return function (payload) {
            fn.call(ctx, payload);
        };
    }

    GameObject = Class('GameObject', EventEmitter, {
        init: function () {
            this._tags={};
            this.on('add', function () {//TODO optimize
                var myClass = this.getClass(), event, listeners;
                for (event in myClass.allGlobalEvent) {
                    listeners = myClass.allGlobalEvent[event];
                    for (var j = 0; j < listeners.length; j++) {
                        (function (th, ev, proxy) {
                            th.layer.on(ev, proxy);
                            th.on('remove', function () {
                                this.layer.off(ev, proxy);
                            });
                        })(this, event, createProxy(this, listeners[j]));
                    }
                }
            });
        },
        addTag:function(name){ //todo check
            var layer=this.layer, tags=layer._tags;
            if(!tags[name]){
                tags[name]=new Bag();
            }
            this._tags[name] = tags[name].add(this); //store the index for removal purpose
        },
        hasTag:function(name){
            return this._tags[name] !== undefined;
        },
        removeTag:function(name){ //todo check
            var idx=this._tags[name], moved=this.layer._tags[name].remove(idx);
            if(moved){
                moved._tags[name]=idx;
            }
            delete this._tags[name];
        },
        onGlobal: function (event, handler) {
            var that = this,
                proxy = function (payload) {
                    handler.call(that, payload);
                };
            if (this.layer) { //already added
                this.layer.on(event, proxy);
            } else {
                this.on('add', function () {
                    this.layer.on(event, proxy);
                });
            }
            this.on('remove', function () {
                this.layer.off(event, proxy);
            });
        },
        'final remove': function () {
            this.layer.remove(this);
        },
        'event remove':function(){
            var idx, name, moved;
            for(name in this._tags){
                idx=this._tags[name];
                moved=this.layer._tags[name].remove(idx);
                if(moved){
                    moved._tags[name]=idx;
                }
            }
        }
    });

    return GameObject;
});