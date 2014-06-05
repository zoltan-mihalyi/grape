define(['class'], function (Class) {
    var EventEmitter;

    function decompose(method, target, prefix) {
        var i;
        if (typeof method === 'object') { //nested methods
            for (i in method) {
                decompose(method[i], target, prefix + '.' + i);
            }
        } else {
            target[prefix] = method;
        }
    }

    Class.registerKeyword('event', {
        onInit: function (classInfo) {
            classInfo.events = {};
            classInfo.allEvent = {};
        },
        onAdd: function (classInfo, methodDescriptor) {
            if (!classInfo.extends(EventEmitter)) {
                throw 'To use "event" keyword, inherit the Grape.EventEmitter class!';
            }
            decompose(methodDescriptor.method, classInfo.events, methodDescriptor.name);
            return false;
        },
        onFinish: function (classInfo) {
            var i, event, events;
            //add parent events
            for (i = 0; i < classInfo.allParent.length; i++) {
                events = classInfo.allParent[i].events;
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
            for (i in myClass.allEvent) { //TODO separate static and dynamic subscriptions
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
                    i--;
                }
            }
        },
        emit: function (event, payload) { //TODO class level listeners?
            var i, listeners = this._events[event], n;
            if (listeners) {

                for (i = 0, n = listeners.length; i < n; i++) {
                    listeners[i].call(this, payload);
                }
            }
            listeners = this._events.any;
            if (listeners) {
                for (i = 0, n = listeners.length; i < n; i++) {
                    listeners[i].call(this, event, payload);
                }
            }
        },
        'static decompose': decompose
    });


    return EventEmitter;
});