define(['core/class'], function (Class) {
    var EventEmitter;

    Class.registerKeyword('event', {
        onInit: function (classInfo) {
            classInfo.events = {};
            classInfo.allEvent = {};
        },
        onAdd: function (classInfo, methodDescriptor) {
            classInfo.events[methodDescriptor.name] = methodDescriptor.method;
            //TODO EE not inherited?
            return false;
        },
        onFinish: function (classInfo) {
            var i, event, events;
            //add parent events
            for (i in classInfo.parents) {
                events = classInfo.parents[i].events;
                for (event in events) {
                    (classInfo.allEvent[event] || (classInfo.allEvent[event] = [])).push(events[event]);
                }
            }
            //add own events
            events = classInfo.events;
            for (event in events) {
                (classInfo.allEvent[event] || (classInfo.allEvent[event] = [])).push(events[event]);
            }
        }
    });

    EventEmitter = Class('EventEmitter', {
        init: function () {
            this._events = {};
        },
        on: function (event, listener) {
            (this._events[event] || (this._events[event] = [])).push(listener);
        },
        emit: function (event, payload) {
            var i, listeners = this._events[event];
            if (!listeners) {
                return;
            }
            for (i = 0; i < listeners.length; i++) {
                listeners[i].call(this, payload);
            }
        }
    });


    return EventEmitter;
});