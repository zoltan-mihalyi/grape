define(['../class', '../collections/bag', '../etc/event-emitter', '../etc/tag'], function (Class, Bag, EventEmitter, Tag) {
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

    function subscribe(th, ev, fn) {
        var proxy = function (payload) {
            fn.call(th, payload);
        };
        th._layer.on(ev, proxy);
        th.on('remove', function () {
            this._layer.off(ev, proxy);
        });
    }

    GameObject = Class('GameObject', [EventEmitter, Tag.Taggable], {
        init: function () {
            this._layer = null;
            this.on('add', function () {//TODOv2 optimize
                var myClass = this.getClass(), event, listeners;
                for (event in myClass.allGlobalEvent) {
                    listeners = myClass.allGlobalEvent[event];
                    for (var j = 0; j < listeners.length; j++) {
                        subscribe(this, event, listeners[j]);
                    }
                }
            });
        },
        onGlobal: function (event, handler) {
            var that = this,
                proxy = function (payload) {
                    handler.call(that, payload);
                };
            if (this._layer) { //already added
                this._layer.on(event, proxy);
            } else {
                this.on('add', function () {
                    this._layer.on(event, proxy);
                });
            }
            this.on('remove', function () {
                this._layer.off(event, proxy);
            });
        },
        'final remove': function () {
            this._layer.remove(this);
        },
        getGame: function () {
            return this._layer === null ? null : this._layer.getGame();
        },
        getScene: function () {
            return this._layer === null ? null : this._layer.getScene();
        },
        getLayer: function () {
            return this._layer === null ? null : this._layer;
        }
    });

    return GameObject;
});