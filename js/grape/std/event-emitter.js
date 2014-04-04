define(['core/class', 'utils'], function (Class, Utils) {
    var EventEmitter;

    Class.registerKeyword('event', {
        onInit: function (classInfo) {
            classInfo.events = {};
            classInfo.allEvent = {};
        },
        onAdd: function (classInfo, methodDescriptor) {
            classInfo.events[methodDescriptor.name] = methodDescriptor.method;
            if (!Utils.arrayContains(classInfo.allParent, EventEmitter)) {
                throw 'To use "event" keyword, inherit the Grape.Std.EventEmitter class!';
            }
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
        init: function () { //subscribe to events defined in class
            var i, myClass = this.getClass();
            this._events = {};
            for (i in myClass.allEvent) { //TODO separate static and dinamic subscriptions
                this._events[i] = myClass.allEvent[i].slice(0);
            }
        },
        on: function (event, listener) {
            (this._events[event] || (this._events[event] = [])).push(listener);
        },
        off: function (event, listener) {
            var i, listeners = this._events[event];
            for (i = 0; i < listeners.length; i++) {
                if (listeners[i] === listener) {
                    listeners.splice(i, 1);
                }
            }
        },
        emit: function (event, payload) { //TODO class level listeners?
            var i, listeners = this._events[event];
            if (listeners) {
                for (i = 0; i < listeners.length; i++) {
                    listeners[i].call(this, payload);
                }
            }
            listeners = this._events.any;
            if (listeners) {
                for (i = 0; i < listeners.length; i++) {
                    listeners[i].call(this, event, payload);
                }
            }
        }
    });


    return EventEmitter;
});