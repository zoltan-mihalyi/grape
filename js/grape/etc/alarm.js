define(['class', 'etc/event-emitter'], function (Class, EventEmitter) {
    return Class('Alarm', EventEmitter, {
        init: function () {
            this._alarms = {};
        },

        'final setAlarm': function (id, frames) {
            this._alarms[id] = frames;
        },

        'final getAlarm': function (id) {
            return this._alarms[id];
        },

        'final increaseAlarm': function (id, frames) {
            if (!this._alarms[id]) {
                this._alarms[id] = frames;
            } else {
                this._alarms[id] += frames;
            }
        },

        'final hasAlarm': function (id) {
            return this._alarms[id] !== undefined;
        },

        'event frame': function () {
            var id;
            for (id in this._alarms) {
                if (--this._alarms[id] <= 0) {
                    delete this._alarms[id];
                    this.emit('alarm', id);
                    this.emit('alarm.' + id);
                }
            }
        }
    });
});