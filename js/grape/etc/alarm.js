define(['../class', '../game/game-object'], function (Class, GameObject) {

    /**
     * A utility class for creating timeouts in a game.
     *
     * @class Grape.Alarm
     */
    return Class('Alarm', GameObject, {
        init: function () {
            this._alarms = {};
        },

        /**
         * Sets a timeout with a given name.
         *
         * @method setAlarm
         * @param name {String} alarm name
         * @param frames {number} the number of frames after the alarm triggers
         */
        'final setAlarm': function (name, frames) {
            this._alarms[name] = frames;
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

        'global-event frame': function () {
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