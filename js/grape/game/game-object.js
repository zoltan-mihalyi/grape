define(['class', 'etc/event-emitter'], function (Class, EventEmitter) {
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
        }
    }

    GameObject = Class('GameObject', EventEmitter, {
        init: function () {
            this.on('add', function () {//TODO optimize
                var myClass = this.getClass(), event, listeners;
                for (event in myClass.allGlobalEvent) {
                    listeners = myClass.allGlobalEvent[event];
                    for (var j = 0; j < listeners.length; j++) {
                        this.layer.on(event, createProxy(this,listeners[j]));
                    }
                }
            });
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
                this.layer.off(event, proxy)
            });
        },
        remove: function () {

        }
    });

    return GameObject;
});