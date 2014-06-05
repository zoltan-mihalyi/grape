define(['class', 'collections/array'], function (Class, Arr) {
    /**
     * A bag class, ie. an unordered list.
     * It is an array, but if you remove an item, and the bag contains at least one more item, the last item replaces the item, and length is reduced by 1.
     * @class Bag
     */
    return Class('Bag', Arr, {
        /**
         * Adds an element to the bag. Equivalent to push()
         * @param item {*} The item to add
         * @method add
         * @returns {number} the new size of the bag
         */
        add: Arr.prototype.push,
        /**
         * @method remove
         * @param index {number} The index to remove at
         * @returns {*} The moved item (which replaces the removed item)
         */
        remove: function (index) {
            if (index === this.length - 1) {
                this.pop();
            } else {
                return this[index] = this.pop();
            }
        }
    });
});