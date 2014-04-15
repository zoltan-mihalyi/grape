define([], function () {
    var List = function () {
        /**
         * The head of the list.
         *
         * @memberOf Grape.List.prototype
         * @field
         * @type {ListNode}
         */
        this.first = [null, null, null];
        /**
         * The tail of the list.
         *
         * @memberOf Grape.List.prototype
         * @field
         * @type {ListNode}
         */
        this.last = [this.first, null, null];
        this.first[2] = this.last;
    };
    /**
     * A fake class for modeling list nodes.
     * For performance reasons, the list nodes aren't stored in an instance of a class, but in an array.
     * The mapping is: 0:previous, 1:object, 2:next.
     *
     * @name ListNode
     * @private
     * @class
     */

    /**
     * Detaches a list node from the list.
     *
     * @name detachNode
     * @memberOf Grape.List
     *
     * @param {ListNode} node the list node
     */
    var detachNode = List.detachNode = function (node) {
        var prev, next;
        (prev = node[0])[2] = (next = node[2]);
        next[0] = prev;
    };

    /**
     * A simple iterator for the list.
     * Creates an iterator and sets the current position to the given list node (not inclusive in iteration)
     * @name Iterator
     * @memberOf Grape.List
     * @constructor
     * @param {ListNode} the head
     */
    var Iterator = List.Iterator = function (current) {
        return /** @lends Grape.List.Iterator.prototype */ {
            /**
             * Decides whether the iterator has next element
             * @return {Boolean} true, if there is next element
             */
            hasNext: function () {
                return current[2][1] !== null;
            },

            /**
             * The iterator steps to the next list node, and returns it's object
             *
             * @return {*} the object at the next position
             */
            next: function () {
                return (current = current[2])[1];
            },

            /**
             * Removes the current node from the list.
             */
            remove: function () {
                detachNode(current);
            }
        };
    };

    List.prototype = /** @lends Grape.List.prototype */ {
        /**
         * Pushes an object to the end of the list.
         *
         * @param {*} el the object
         * @return {ListNode} the list node containing the object
         */
        push: function (el) {
            var last = this.last, prev = last[0];
            el = [prev, el, last];
            prev[2] = el;
            return last[0] = el;
        },

        /**
         * Pushes a list node to the end of the list.
         *
         * @private
         * @param {ListElement} node the list node
         */
        pushListNode: function (node) {
            var li = this.last;
            node[0] = li[0];
            node[2] = li;
            li[0][2] = node;
            li[0] = node;
        },

        /**
         * Creates an iterator for the list.
         *
         * @return {Grape.List.Iterator}
         */
        iterator: function () {
            return new Iterator(this.first);
        },

        /**
         * Runs a callback for each element in the list
         *
         * @example
         *      list.each(function(){
         *          this.x++;
         *      });
         *
         * @param callback
         */
        each: function (callback) {
            var it = this.iterator(), e;
            while ((e = it.next()) !== null) {
                callback.call(e, e);
            }
        }
    };
    return List;
});