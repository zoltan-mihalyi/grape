define(['../class'], function (Class) {
    var EventEmitter;

    /**
     * A helper function for decomposing nested event handlers. When the method is a function, it is just added to the
     * target. If the method is an object, all of it's element are added with name.key.
     *
     * @example
     *      var target = {};
     *      Grape.EventEmitter.decompose(function(){},target,'name1');
     *      Grape.EventEmitter.decompose({
     *          x:function(){}
     *      },target,'name2');
     *
     *      //target will be {'name1':function(){},'name2.x':function(){}}
     *
     * @method decompose
     * @static
     * @param {Function|Object} method The method or methods
     * @param {Object} target The target the methods are added to.
     * @param {String} name method name or nested method prefix
     */
    function decompose(method, target, name) {
        var i;
        if (typeof method === 'object') { //nested methods
            for (i in method) {
                decompose(method[i], target, name + '.' + i);
            }
        } else {
            target[name] = method;
        }
    }

    Class.registerKeyword('event', {
        onInit: function (classInfo) {
            classInfo.events = {};
            classInfo.allEvent = {};
        },
        onAdd: function (classInfo, methodDescriptor) {
            if (!classInfo.extends(EventEmitter)) {
                throw new Error('To use "event" keyword, inherit the Grape.EventEmitter class!');
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


    /**
     * An object which cna emit events, others can subscribe to it, and we can use the event keyword to make easier
     * the subscription when extending this class.
     *
     * @class Grape.EventEmitter
     */
    EventEmitter = Class('EventEmitter', {
        init: function () { //subscribe to events defined in class
            var i, myClass = this.getClass();
            this._events = {};
            for (i in myClass.allEvent) { //TODOv2 separate static and dynamic subscriptions
                this._events[i] = myClass.allEvent[i].slice(0);
            }
        },
        /**
         * Subscribes to an event. The event handler will be called with this instance as context.
         *
         * @method on
         * @param {String} event The event to subscribe
         * @param {Function} listener Event listener
         */
        on: function (event, listener) {
            (this._events[event] || (this._events[event] = [])).push(listener);
        },

        /**
         * Unsubscribes from an event.
         *
         * @method off
         * @param {String} event Event
         * @param {Function} listener Event listener
         */
        off: function (event, listener) { //todov2 check remove with indexOf speed
            //todov2 remove all listeners
            var i, listeners = this._events[event];
            for (i = 0; i < listeners.length; i++) {
                if (listeners[i] === listener) {
                    listeners.splice(i, 1);
                    i--;
                }
            }
        },
        //todov2 once
        /**
         * Emits an event to the instance: calls all event listeners subscribed to this event, or the 'any' event.
         *
         * @method emit
         * @param {String} event Event
         * @param {*} payload An object passed as parameter to all event listeners.
         */
        emit: function (event, payload) { //TODOv2 class level listeners?
            var i, listeners = this._events[event], n;
            if (listeners) {

                for (i = 0, n = listeners.length; i < n; i++) {
                    listeners[i].call(this, payload);
                }
            }
            /**
             * Emitted when any event is emitted. The parameters are the event and the payload.
             *
             * @event any
             */
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