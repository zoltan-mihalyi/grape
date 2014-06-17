define(['../class', '../game/game-object'], function (Class, GameObject) {

    /**
     * A utility class for creating timeouts in a game.
     *
     * @class Grape.Alarm
     * @constructor
     * @uses Grape.GameObject
     */
    return Class('Alarm', GameObject, {
        init: function () {
            this._alarms = {};
        },

        /**
         * Sets a timeout with a given name in frames.
         *
         * @method setAlarm
         * @param name {String} Alarm name
         * @param frames {number} The number of frames after the alarm triggers
         */
        'final setAlarm': function (name, frames) {
            this._alarms[name] = frames;
        },

        /**
         * Returns the remaining frames of a timeout
         *
         * @method getAlarm
         * @param name {String} Alarm name
         * @return {number} The remaining time
         */
        'final getAlarm': function (name) {
            return this._alarms[name];
        },

        /**
         * Increases the duration of a timeout by a given amount. If timeout does not exist, the method creates it.
         *
         * @method increaseAlarm
         * @param name {String} Alarm name
         * @param frames {number} Number of frames to increase with
         */
        'final increaseAlarm': function (name, frames) {
            if (!this._alarms[name]) {
                this._alarms[name] = frames;
            } else {
                this._alarms[name] += frames;
            }
        },

        /**
         * Tells whether a timeout with a given name exists.
         *
         * @method hasAlarm
         * @param id {String} Name of the timeout
         * @return {boolean} true, if the timeout exists
         */
        'final hasAlarm': function (id) {
            return this._alarms[id] !== undefined;
        },

        'global-event frame': function () {
            var id;
            for (id in this._alarms) {
                if (--this._alarms[id] <= 0) {
                    delete this._alarms[id];
                    /**
                     * When a timeout ends, this event occurs. The parameter is the name of the timeout.
                     * @event alarm
                     */
                    this.emit('alarm', id);
                    /**
                     * When a timeout ends, this event occurs too.
                     * @event alarm.<name>
                     */
                    this.emit('alarm.' + id);
                }
            }
        }
    });
});